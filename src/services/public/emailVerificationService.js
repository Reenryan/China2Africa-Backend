import { createHash, randomInt } from "node:crypto";

import prisma from "../../config/database.js";
import logger from "../../utils/logger.js";

import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../emails/emailService.js";

const CODE_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function createServiceError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function hashCode(userId, code) {
  return createHash("sha256")
    .update(`${userId}:${code}`)
    .digest("hex");
}

function genericResendResponse() {
  return {
    message:
      "If an unverified account exists for this email, a verification email will be sent.",
  };
}

/**
 * Generate, store, and email a verification code.
 * Used by signup and resend operations.
 */
export async function createAndSendVerificationCode({
  userId,
  email,
  firstName,
  enforceCooldown = false,
}) {
  const now = new Date();

  const latestToken = await prisma.accountToken.findFirst({
    where: {
      userId,
      type: "EMAIL_VERIFICATION",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  if (
    enforceCooldown &&
    latestToken &&
    now.getTime() - latestToken.createdAt.getTime() <
      RESEND_COOLDOWN_SECONDS * 1000
  ) {
    const secondsRemaining = Math.ceil(
      RESEND_COOLDOWN_SECONDS -
        (now.getTime() - latestToken.createdAt.getTime()) / 1000
    );

    throw createServiceError(
      `Please wait ${secondsRemaining} seconds before requesting another code.`,
      429,
      "VERIFICATION_RESEND_COOLDOWN"
    );
  }

  const code = randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");

  const tokenHash = hashCode(userId, code);

  const expiresAt = new Date(
    now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000
  );

  // Invalidate previous unused codes and create the new code atomically.
  await prisma.$transaction(async (tx) => {
    await tx.accountToken.updateMany({
      where: {
        userId,
        type: "EMAIL_VERIFICATION",
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await tx.accountToken.create({
      data: {
        userId,
        tokenHash,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });
  });

  try {
    await sendVerificationEmail({
      email,
      firstName,
      code,
    });
  } catch (error) {
    logger.error(
      { err: error, userId },
      "Verification email delivery failed"
    );

    // Invalidate only the code whose delivery failed.
    await prisma.accountToken.updateMany({
      where: {
        userId,
        type: "EMAIL_VERIFICATION",
        tokenHash,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    throw createServiceError(
      "Unable to send the verification email. Please try again later.",
      503,
      "VERIFICATION_EMAIL_DELIVERY_FAILED"
    );
  }
}

/**
 * Resend a verification code.
 */
export async function resendVerificationCode({ email }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      isEmailVerified: true,
      customer: {
        select: {
          firstName: true,
        },
      },
    },
  });

  // Avoid disclosing whether an account exists or is verified.
  if (!user || !user.isActive || user.isEmailVerified || !user.customer) {
    return genericResendResponse();
  }

  await createAndSendVerificationCode({
    userId: user.id,
    email: user.email,
    firstName: user.customer.firstName,
    enforceCooldown: true,
  });

  return genericResendResponse();
}

/**
 * Validate the submitted code and verify the account.
 */
export async function verifyEmailCode({ email, code }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
      customer: {
        select: {
          firstName: true,
        },
      },
    },
  });

  if (!user) {
    throw createServiceError(
      "Invalid email or verification code.",
      400,
      "INVALID_VERIFICATION_CODE"
    );
  }

  if (user.isEmailVerified) {
    throw createServiceError(
      "This email address is already verified.",
      409,
      "EMAIL_ALREADY_VERIFIED"
    );
  }

  const token = await prisma.accountToken.findFirst({
    where: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (
    !token ||
    token.expiresAt.getTime() <= Date.now() ||
    token.tokenHash !== hashCode(user.id, code)
  ) {
    throw createServiceError(
      "Invalid or expired verification code.",
      400,
      "INVALID_OR_EXPIRED_VERIFICATION_CODE"
    );
  }

  // Consume the token and verify the account in one transaction.
  const verifiedUser = await prisma.$transaction(async (tx) => {
    const consumed = await tx.accountToken.updateMany({
      where: {
        id: token.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw createServiceError(
        "Invalid or expired verification code.",
        400,
        "INVALID_OR_EXPIRED_VERIFICATION_CODE"
      );
    }

    return tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailVerified: true,
      },
      select: {
        id: true,
        email: true,
        customer: {
          select: {
            firstName: true,
          },
        },
      },
    });
  });

  // A welcome-email failure must not undo successful verification.
  try {
    await sendWelcomeEmail({
      email: verifiedUser.email,
      firstName: verifiedUser.customer.firstName,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        userId: verifiedUser.id,
      },
      "Welcome email delivery failed"
    );
  }

  return {
    email: verifiedUser.email,
    firstName: verifiedUser.customer.firstName,
  };
}
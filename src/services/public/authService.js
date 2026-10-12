
import { randomBytes } from "node:crypto";

import prisma from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.ts";
import logger from "../../utils/logger.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  createAndSendVerificationCode,
} from "./emailVerificationService.js";

function createError(message, statusCode, code) {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.code = code;

  return error;
}

function generateCustomerNumber() {
  return `CUST_${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function signupUser(input) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    businessType,
    organizationName,
  } = input;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw createError(
      "An account with this email already exists.",
      409,
      "ACCOUNT_ALREADY_EXISTS"
    );
  }

  const passwordHash = await hashPassword(password);

  let user;

  try {
    user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: normalizedEmail,
          phone: phone.trim(),
          passwordHash,

          customer: {
            create: {
              customerNumber: generateCustomerNumber(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              businessType,
              organizationName: organizationName?.trim() || null,
            },
          },
        },

        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,

          customer: {
            select: {
              id: true,
              customerNumber: true,
              firstName: true,
              lastName: true,
              businessType: true,
              organizationName: true,
            },
          },
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw createError(
        "An account with this email or customer number already exists.",
        409,
        "ACCOUNT_ALREADY_EXISTS"
      );
    }

    // Preserve unexpected errors for the controller.
    throw error;
  }

  let verificationEmailSent = true;

  try {
    await createAndSendVerificationCode({
      userId: user.id,
      email: user.email,
      firstName: user.customer.firstName,
    });
  } catch (error) {
    verificationEmailSent = false;

    logger.error(
      {
        err: error,
        userId: user.id,
      },
      "Failed to send signup verification email"
    );
  }

  // The account exists even if email delivery failed.
  // The user can request another code through the resend endpoint.
  return {
    ...user,
    verificationEmailSent,
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      phone: true,
      passwordHash: true,
      isActive: true,
      isEmailVerified: true,
      tokenVersion: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          customerNumber: true,
          firstName: true,
          lastName: true,
          businessType: true,
          organizationName: true,
        },
      },
    },
  });

  if (!user) {
    throw createError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const passwordMatches = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw createError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  if (!user.isActive) {
    throw createError(
      "Your account is inactive. Please contact support.",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  if (!user.isEmailVerified) {
    throw createError(
      "Please verify your email before logging in.",
      403,
      "EMAIL_NOT_VERIFIED"
    );
  }

  const { passwordHash, tokenVersion, ...safeUser } = user;

  return {
    user: safeUser,
    tokenVersion,
  };
}
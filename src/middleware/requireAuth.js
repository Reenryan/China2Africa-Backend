import prisma from "../config/database.js";
import { verifyAccessToken } from "../utils/accessToken.js";
import AppError from "../utils/AppError.js";
import { ACCESS_TOKEN_COOKIE } from "../utils/authCookie.js";
import logger from "../utils/logger.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      return next(
        new AppError(
          "Authentication is required.",
          401,
          "AUTHENTICATION_REQUIRED"
        )
      );
    }

      logger.debug(
    {
      hasCookie: Boolean(req.cookies?.c2a_access),
    },
    "Authentication cookie received"
  );

  
let payload;

try {
  payload = verifyAccessToken(token);

  logger.info("STEP 1 PASSED: Access token verified");
} catch (error) {
  logger.error(
    {
      errorName: error?.name,
      errorMessage: error?.message,
    },
    "STEP 1 FAILED: Access token verification failed"
  );

  return next(
    new AppError(
      "Your session is invalid or has expired. Please log in again.",
      401,
      "INVALID_OR_EXPIRED_SESSION"
    )
  );
}

    if (
      typeof payload.sub !== "string" ||
      !Number.isInteger(payload.ver)
    ) {
      return next(
        new AppError(
          "Your session is invalid. Please log in again.",
          401,
          "INVALID_SESSION"
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
        tokenVersion: true,
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !user ||
      !user.isActive ||
      !user.isEmailVerified ||
      user.tokenVersion !== payload.ver
    ) {
      return next(
        new AppError(
          "Your session is no longer valid. Please log in again.",
          401,
          "SESSION_REVOKED"
        )
      );
    }

    // Available to downstream controllers; never store passwords here.
    req.auth = {
      userId: user.id,
      email: user.email,
    };

    req.authUser = user;

    return next();
  } catch (error) {
  console.error("Error in requireAuth middleware:", error);
    return next(
      new AppError(
        "Unable to authenticate this request.",
        500,
        "AUTHENTICATION_ERROR"
      )
    );
  }
}

/**
 * Optional authentication for endpoints such as logout.
 * Invalid or expired tokens do not block the request.
 */
export function optionalAuth(req, res, next) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);

    if (
      typeof payload.sub === "string" &&
      Number.isInteger(payload.ver)
    ) {
      req.auth = {
        userId: payload.sub,
        tokenVersion: payload.ver,
      };
    }
  } catch {
    // Logout should still be able to clear an invalid cookie.
  }

  return next();
}
import { loginUser, signupUser } from "../../services/public/authService.js";
import AppError from "../../utils/AppError.js";
import { signAccessToken } from "../../utils/accessToken.js";
import { setAccessTokenCookie } from "../../utils/authCookie.js";
import logger from "../../utils/logger.js";

export async function signupController(req, res, next) {
  try {
    const user = await signupUser(req.body);

    return res.status(201).json({
      success: true,
      message: `Hello ${user.customer.firstName}, your account has been created. Email verification is the next step.`,
      data:{
        email: user.email,
      }
    });
  } catch (error) {
  logger.error(
    {
      err: error,
      requestId: req.id,
      method: req.method,
      path: req.path,
    },
    "Signup request failed"
  );

  return next(
    new AppError(
      error.statusCode === 409
        ? error.message
        : "Unable to create your account right now.",
      error.statusCode || 500,
      error.code || "INTERNAL_ERROR"
    )
  );

  }
}

export async function loginController(req, res, next) {
  try {
    const { user, tokenVersion } = await loginUser(req.body);

    const token = signAccessToken({
      id: user.id,
      tokenVersion,
    });
  
    logger.info(
      {
        userId: user.id,
        tokenVersion,
        hasCustomer: Boolean(user.customer),
      },
      "Login service succeeded"
    );

    setAccessTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.customer?.firstName || "customer"}!`,
      data: {
        user,
      },
    });
  } catch (error) {
    const statusCode =
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode <= 599
        ? error.statusCode
        : 500;

    if (statusCode >= 500) {
      logger.error(
        {
          err: error,
          requestId: req.id,
          method: req.method,
          path: req.path,
        },
        "Login request failed"
      );
    } else {
      logger.warn(
        {
          requestId: req.id,
          method: req.method,
          path: req.path,
          statusCode,
          code: error.code,
        },
        "Login attempt rejected"
      );
    }

    return next(
      new AppError(
        statusCode >= 500
          ? "Unable to log in right now."
          : error.message,
        statusCode,
        error.code || "INTERNAL_ERROR"
      )
    );
  }
}
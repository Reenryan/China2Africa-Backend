import AppError from "../../utils/AppError.js";

import {
  resendVerificationCode,
  verifyEmailCode,
} from "../../services/public/emailVerificationService.js";

export async function verifyEmailController(req, res, next) {
  try {
    const { email, code } = req.body;

    const result = await verifyEmailCode({ email, code });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to China2Africa!",
      data: result,
    });
  } catch (error) {
    const statusCode =
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode <= 599
        ? error.statusCode
        : 500;

    return next(
      new AppError(
        statusCode >= 500
          ? "Unable to verify your email right now."
          : error.message,
        statusCode,
        error.code || "INTERNAL_ERROR"
      )
    );
  }
}

export async function resendVerificationController(req, res, next) {
  try {
    const { email } = req.body;

    const result = await resendVerificationCode({ email });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode =
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode <= 599
        ? error.statusCode
        : 500;

    return next(
      new AppError(
        statusCode >= 500
          ? "Unable to resend the verification email right now."
          : error.message,
        statusCode,
        error.code || "INTERNAL_ERROR"
      )
    );
  }
}
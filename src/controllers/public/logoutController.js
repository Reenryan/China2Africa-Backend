import prisma from "../../config/database.js";
import AppError from "../../utils/AppError.js";
import { clearAccessTokenCookie } from "../../utils/authCookie.js";
import logger from "../../utils/logger.js";

export async function logoutController(req, res, next) {
  try {
    if (req.auth?.userId) {
      await prisma.user.updateMany({
        where: {
          id: req.auth.userId,
          tokenVersion: req.auth.tokenVersion,
        },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });
    }

    clearAccessTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "You have been logged out successfully.",
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        requestId: req.id,
        method: req.method,
        path: req.path,
      },
      "Logout request failed"
    );

    return next(
      new AppError(
        "Unable to complete logout right now.",
        500,
        "LOGOUT_FAILED"
      )
    );
  }
}
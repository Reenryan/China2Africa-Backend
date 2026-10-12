import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  const isProduction = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    logger.error(
      {
        err,
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode,
      },
      "Unexpected server error"
    );
  } else {
    logger.warn(
      {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode,
        code: err.code,
      },
      "Request failed"
    );
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && isProduction
        ? "Internal server error"
        : err.message || "Request failed",
    code: err.code || "REQUEST_FAILED",
    ...(req.id ? { requestId: req.id } : {}),
  });
}

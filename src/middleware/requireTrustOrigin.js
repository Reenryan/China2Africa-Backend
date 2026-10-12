import AppError from "../utils/AppError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export default function requireTrustedOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const frontendUrl = process.env.FRONTEND_URL;
  const origin = req.get("origin");

  if (!frontendUrl || !origin || origin !== frontendUrl) {
    return next(
      new AppError(
        "Request origin is not allowed.",
        403,
        "UNTRUSTED_ORIGIN"
      )
    );
  }

  return next();
}
// This is an additional defense for browser requests, not a complete replacement for a CSRF-token strategy in every deployment.
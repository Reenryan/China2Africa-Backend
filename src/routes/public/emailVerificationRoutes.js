import { Router } from "express";

import {
  resendVerificationController,
  verifyEmailController,
} from "../../controllers/public/emailVerificationController.js";

import { resendLimiter, verificationLimiter } from "../../middleware/rateLimitters.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { resendVerificationValidator, verifyEmailValidator } from "../../validators/authValidators.js";

const router = Router();

router.post(
  "/verify",
  verifyEmailValidator,
  validateRequest,
  verificationLimiter,
  verifyEmailController
);

router.post(
  "/resend",
  resendVerificationValidator,
  validateRequest,
  resendLimiter,
  resendVerificationController
);

export default router;

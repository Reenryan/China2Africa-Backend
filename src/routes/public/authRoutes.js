import { Router } from "express";
import { loginController, signupController } from "../../controllers/public/authController.js";
import { logoutController } from "../../controllers/public/logoutController.js";
import { loginLimiter, signupLimiter } from "../../middleware/rateLimitters.js";
import { optionalAuth } from "../../middleware/requireAuth.js";
import requireTrustedOrigin from "../../middleware/requireTrustOrigin.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { loginValidator, signupValidator } from "../../validators/authValidators.js";

const router = Router();

router.post("/signup", signupValidator, validateRequest, signupLimiter, signupController);
router.post("/login", loginValidator, validateRequest,loginLimiter, requireTrustedOrigin,loginController);

router.post("/logout",requireTrustedOrigin,optionalAuth,logoutController);

export default router;

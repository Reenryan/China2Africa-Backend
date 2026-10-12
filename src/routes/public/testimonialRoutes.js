import { Router } from "express";
import { getTestimonials } from "../../controllers/public/testimonialsController.js";
import { publicReadLimiter } from "../../middleware/rateLimitters.js";

const router = Router();

router.get("/", publicReadLimiter, getTestimonials);

export default router;

import { Router } from "express";
import { getFAQs } from "../../controllers/public/faqsController.js";
import { publicReadLimiter } from "../../middleware/rateLimitters.js";

const router = Router();

router.get("/get-faqs", publicReadLimiter, getFAQs);

export default router;

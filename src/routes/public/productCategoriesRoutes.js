import { Router } from "express";

import {
  getProductCategories,
  getProductCategoryBySlug,
} from "../../controllers/public/productsCategoriesController.js";

import { publicReadLimiter } from "../../middleware/rateLimitters.js";

const router = Router();

router.get("/", publicReadLimiter, getProductCategories);
router.get("/:slug", publicReadLimiter, getProductCategoryBySlug);

export default router;

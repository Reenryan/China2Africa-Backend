import { Router } from "express";

import {
    getArticleBySlug,
    getArticleCategories,
    getArticles,
    getArticlesByCategory,
} from "../../controllers/public/articlesController.js";

import { publicReadLimiter } from "../../middleware/rateLimitters.js";

const router = Router();

// Keep specific paths BEFORE /:slug.
router.get("/categories", publicReadLimiter, getArticleCategories);

router.get(
  "/categories/:slug",
  publicReadLimiter,
  getArticlesByCategory
);

router.get("/", publicReadLimiter, getArticles);

router.get("/:slug", publicReadLimiter, getArticleBySlug);

export default router;

import { Router } from "express";

import articleRoutes from "./articleRoutes.js";
import authRoutes from "./authRoutes.js";
import emailVerificationRoutes from "./emailVerificationRoutes.js";
import faqsRoutes from "./faqsRoutes.js";
import productsRoutes from "./productCategoriesRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";

const router = Router();


router.use("/faqs", faqsRoutes);
router.use("/auth", authRoutes);
router.use("/articles", articleRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/products", productsRoutes);
router.use("/email",emailVerificationRoutes);

export default router;
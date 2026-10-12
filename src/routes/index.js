import { Router } from "express";
import adminRoutes from "./admin/index.js";
import customerRoutes from "./customer/index.js";
import publicRoutes from "./public/index.js";

const router = Router();

router.use("/public", publicRoutes);
router.use("/customer", customerRoutes);
router.use("/admin", adminRoutes);


export default router;
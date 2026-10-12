import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import requireTrustedOrigin from "../../middleware/requireTrustOrigin.js";
// import customerPaymentsRoutes from "./customerPaymentsRoutes.js";
import customerRoutes from "./customerProfileRoutes.js";
import customerRequestsRoutes from "./customerRequestsRoutes.js";
// import customerShipmentsRoutes from "./customerShipmentsRoutes.js";

const router = Router();

router.use(requireAuth);
router.use(requireTrustedOrigin);

router.use("/profile",customerRoutes);
router.use("/requests",customerRequestsRoutes);
// router.use("/shipments",customerShipmentsRoutes);
// router.use("/payments",customerPaymentsRoutes);



export default router;
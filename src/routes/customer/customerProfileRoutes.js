import { Router } from "express";
import { getCustomerProfileController } from "../../controllers/customer/customerProfileController.js";

const router = Router();


router.get("/", getCustomerProfileController);

export default router;
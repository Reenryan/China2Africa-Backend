
import { Router } from "express";

import {
  createCustomerRequestController,
  getCustomerRequestByIdController,
  getCustomerRequestsController,
} from "../../controllers/customer/customerRequestsController.js";

import { uploadProductImages } from "../../middleware/uploadProductImages.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  createSourcingRequestValidator,
  getCustomerRequestByIdValidator,
} from "../../validators/authValidators.js";

const router = Router();

router.get("/", getCustomerRequestsController);

router.post(
  "/new-request",
  uploadProductImages,
  createSourcingRequestValidator,
  validateRequest,
  createCustomerRequestController
);

router.get(
  "/:requestId",
  getCustomerRequestByIdValidator,
  validateRequest,
  getCustomerRequestByIdController
);

export default router;
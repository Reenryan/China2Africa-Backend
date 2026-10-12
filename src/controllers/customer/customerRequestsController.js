
import {
    createCustomerRequest,
    getCustomerRequestById,
    getCustomerRequests,
} from "../../services/customer/customerRequestsService.js";
import AppError from "../../utils/AppError.js";

function handleControllerError(error, next, fallbackMessage) {
  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  return next(
    new AppError(
      statusCode >= 500
        ? fallbackMessage
        : error.message,
      statusCode,
      statusCode >= 500
        ? "INTERNAL_ERROR"
        : error.code || "REQUEST_ERROR"
    )
  );
}

export async function getCustomerRequestsController(req, res, next) {
  try {
   const result = await getCustomerRequests(req.auth.userId, {
    page: req.query.page,
    limit: req.query.limit,
    });

    return res.status(200).json({
    success: true,
    message: "Customer requests retrieved successfully.",
    data: result.items,
    pagination: result.pagination,
    });
  } catch (error) {
    return handleControllerError(
      error,
      next,
      "Unable to retrieve your sourcing requests right now."
    );
  }
}

export async function createCustomerRequestController(req, res, next) {
  try {
    const request = await createCustomerRequest(req.auth.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Sourcing request created successfully.",
      data: request,
    });
  } catch (error) {
    return handleControllerError(
      error,
      next,
      "Unable to create your sourcing request right now."
    );
  }
}

export async function getCustomerRequestByIdController(req, res, next) {
  try {
    const request = await getCustomerRequestById(
      req.auth.userId,
      req.params.requestId
    );

    return res.status(200).json({
      success: true,
      message: "Sourcing request retrieved successfully.",
      data: request,
    });
  } catch (error) {
    return handleControllerError(
      error,
      next,
      "Unable to retrieve this sourcing request right now."
    );
  }
}

import { getCustomerProfile } from "../../services/customer/customerProfileService.js";
import AppError from "../../utils/AppError.js";

export async function getCustomerProfileController(req, res, next) {
  try {
    const profile = await getCustomerProfile(req.auth.userId);

    return res.status(200).json({
      success: true,
      message: "Customer profile retrieved successfully.",
      data: profile,
    });
  } catch (error) {
    const statusCode =
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode <= 599
        ? error.statusCode
        : 500;

    return next(
      new AppError(
        statusCode >= 500
          ? "Unable to retrieve your profile right now."
          : error.message,
        statusCode,
        error.code || "INTERNAL_ERROR"
      )
    );
  }
}
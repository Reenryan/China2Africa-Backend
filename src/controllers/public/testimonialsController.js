import * as testimonialsService from "../../services/public/testimonialsService.js";
import logger from "../../utils/logger.js";

export const getTestimonials = async (req, res, next) => {
  try {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
      },
      "Fetching public testimonials"
    );

    const testimonials =
      await testimonialsService.getPublicTestimonials();

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.id },
      "Failed to fetch public testimonials"
    );

    next(error);
  }
};

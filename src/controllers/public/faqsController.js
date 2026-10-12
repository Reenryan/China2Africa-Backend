import * as faqsService from "../../services/public/faqsService.js";
import logger from "../../utils/logger.js";

export const getFAQs = async (req, res, next) => {
  try {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
      },
      "Fetching public FAQs"
    );

    const faqs = await faqsService.getPublicFAQs();

    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

import prisma from "../../config/database.js";
import logger from "../../utils/logger.js";

export const getPublicFAQs = async () => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { category: { name: "asc" } },
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    logger.info(
      { count: faqs.length },
      "Public FAQs retrieved"
    );

    return faqs;
  } catch (error) {
    logger.error(
      { err: error },
      "Failed to retrieve public FAQs"
    );

    throw error;
  }
};

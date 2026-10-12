import prisma from "../../config/database.js";

const getPublicTestimonials = async () => {
  return prisma.testimonial.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      customerName: true,
      organizationName: true,
      role: true,
      content: true,
      customerImage: true,
      sortOrder: true,
      createdAt: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
};

export { getPublicTestimonials };

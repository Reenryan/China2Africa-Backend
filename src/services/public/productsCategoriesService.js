import prisma from "../../config/database.js";

export async function getPublicProductCategories() {
  const categories = await prisma.productCategory.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrls: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
}

export async function getPublicProductCategoryBySlug(slug) {
  const category = await prisma.productCategory.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrls: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return category;
}

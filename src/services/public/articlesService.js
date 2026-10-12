import prisma from "../../config/database.js";

const getPublicArticles = async ({
  page = 1,
  limit = 10,
  categorySlug,
  search,
} = {}) => {
  const where = {
    isPublished: true,
    category: {
      isActive: true,
      ...(categorySlug ? { slug: categorySlug } : {}),
    },
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPublicArticleBySlug = async (slug) => {
  return prisma.article.findFirst({
    where: {
      slug,
      isPublished: true,
      category: {
        isActive: true,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  });
};

const getPublicArticleCategories = async () => {
  return prisma.articleCategory.findMany({
    where: {
      isActive: true,
      articles: {
        some: {
          isPublished: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          articles: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

const getPublicCategoryBySlug = async ({
  slug,
  page = 1,
  limit = 10,
} = {}) => {
  const category = await prisma.articleCategory.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  if (!category) {
    return null;
  }

  const result = await getPublicArticles({
    page,
    limit,
    categorySlug: slug,
  });

  return {
    ...category,
    articles: result.articles,
    pagination: result.pagination,
  };
};

export {
    getPublicArticleBySlug,
    getPublicArticleCategories, getPublicArticles, getPublicCategoryBySlug
};

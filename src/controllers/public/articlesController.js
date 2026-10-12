import * as articlesService from "../../services/public/articlesService.js";
import logger from "../../utils/logger.js";

const parsePagination = (query) => {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedLimit = Number.parseInt(query.limit, 10);

  return {
    page:
      Number.isInteger(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, 100000)
        : 1,
    limit:
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10,
  };
};

export const getArticles = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);

    const categorySlug =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : undefined;

    const result = await articlesService.getPublicArticles({
      page,
      limit,
      categorySlug,
      search: search || undefined,
    });

    logger.info(
      {
        requestId: req.id,
        count: result.articles.length,
        page,
      },
      "Fetched public articles"
    );

    return res.status(200).json({
      success: true,
      count: result.articles.length,
      data: result.articles,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await articlesService.getPublicArticleBySlug(
      req.params.slug
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategories = async (req, res, next) => {
  try {
    const categories =
      await articlesService.getPublicArticleCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticlesByCategory = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);

    const category =
      await articlesService.getPublicCategoryBySlug({
        slug: req.params.slug,
        page,
        limit,
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Article category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
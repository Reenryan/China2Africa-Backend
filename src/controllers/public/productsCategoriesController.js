import {
    getPublicProductCategories,
    getPublicProductCategoryBySlug,
} from "../../services/public/productsCategoriesService.js";

export async function getProductCategories(req, res, next) {
  try {
    const categories = await getPublicProductCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const category = await getPublicProductCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Product category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

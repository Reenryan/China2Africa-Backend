import prisma from "../src/config/database.js";

const categories = [
  {
    name: "Product Sourcing",
    slug: "product-sourcing",
    description: "Guides to finding and selecting products from China.",
  },
  {
    name: "Supplier Sourcing",
    slug: "supplier-sourcing",
    description: "Guidance on researching and evaluating suppliers.",
  },
];

const articles = [
  {
    title: "A Beginner's Guide to Product Sourcing in China",
    slug: "beginners-guide-product-sourcing-china",
    excerpt:
      "Learn the basic steps involved in identifying products and preparing a sourcing request.",
    content: `Product sourcing begins with a clear understanding of the product you want to buy.

Start by documenting the product specifications, quantity, quality requirements, target price, and intended use. Reference images or samples can help communicate your requirements.

Next, research potential suppliers and compare their product offerings, communication, minimum order quantities, and available evidence of reliability.

Before confirming an order, ensure that specifications, costs, payment terms, and shipping arrangements are clearly understood.

This is demonstration content for testing the China2Africa Trade Academy API. Replace or expand it with reviewed editorial content before publication.`,
    coverImage:
      "https://res.cloudinary.com/dudo0jfl5/image/upload/v1783513885/Screenshot_2026-07-08_at_15-29-50_family_saga_movie_genres_family_pictures_-_Google_Search_zfupjn.png",
    isPublished: true,
    publishedAt: new Date(),
    categorySlug: "product-sourcing",
  },
  {
    title: "Questions to Ask Before Choosing a Supplier",
    slug: "questions-before-choosing-a-supplier",
    excerpt:
      "Use a structured checklist when evaluating a potential supplier.",
    content: `Choosing a supplier involves more than comparing prices.

Ask about product specifications, minimum order quantities, production lead times, sample availability, quality checks, payment terms, and shipping arrangements.

Request relevant documentation and clarify who will be responsible for inspection and resolving product discrepancies.

Keep written records of the agreed specifications and any changes made during negotiation.

This is demonstration content for testing the China2Africa Trade Academy API. Replace or expand it with reviewed editorial content before publication.`,
    coverImage:
      "https://res.cloudinary.com/dudo0jfl5/image/upload/v1783513885/Screenshot_2026-07-08_at_15-29-50_family_saga_movie_genres_family_pictures_-_Google_Search_zfupjn.png",
    isPublished: true,
    publishedAt: new Date(),
    categorySlug: "supplier-sourcing",
  }
];

async function main() {
  const categoryMap = new Map();

  for (const category of categories) {
    const savedCategory = await prisma.articleCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
      create: category,
    });

    categoryMap.set(category.slug, savedCategory.id);
  }

  for (const article of articles) {
    const { categorySlug, ...articleData } = article;
    const categoryId = categoryMap.get(categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found for article: ${article.slug}`);
    }

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...articleData,
        categoryId,
      },
      create: {
        ...articleData,
        categoryId,
      },
    });
  }

  console.log(
    `Seeded ${categories.length} categories and ${articles.length} demo articles with cover images.`
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed articles:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

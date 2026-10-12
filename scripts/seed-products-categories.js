import prisma from "../src/config/database.js";

const imageUrls = [
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759480889/samples/shoe.jpg",
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759480898/cld-sample-5.jpg",
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759480879/samples/people/jazz.jpg",
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759480874/samples/ecommerce/analog-classic.jpg",
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759520231/gh_e8gh0g.jpg",
  "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759520221/jki_b9e4em.jpg",
];

const categories = [
  {
    name: "Electronics & Accessories",
    slug: "electronics-accessories",
    description:
      "Source electronics, accessories, gadgets, and related products from suppliers in China.",
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion-apparel",
    description:
      "Find clothing, footwear, bags, accessories, and other fashion products for your business.",
  },
  {
    name: "Home & Living",
    slug: "home-living",
    description:
      "Source furniture, household items, kitchen products, décor, and other home-related goods.",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description:
      "Explore beauty products, personal care items, and related goods.",
  },
  {
    name: "Tools & Equipment",
    slug: "tools-equipment",
    description:
      "Source tools, equipment, and supplies for business needs.",
  },
  {
    name: "Custom & Other Products",
    slug: "custom-other-products",
    description:
      "Tell us what you need and we can help explore sourcing options.",
  },
];

async function main() {
  for (const [index, category] of categories.entries()) {
    const images = [
      imageUrls[index % imageUrls.length],
      imageUrls[(index + 1) % imageUrls.length],
      imageUrls[(index + 2) % imageUrls.length],
    ];

    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: {
        ...category,
        imageUrls: images,
        isActive: true,
      },
      create: {
        ...category,
        imageUrls: images,
        isActive: true,
      },
    });

    console.log(`Seeded: ${category.name}`);
  }

  console.log("Product category seeding completed.");
}

main()
  .catch((error) => {
    console.error("Failed to seed product categories:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

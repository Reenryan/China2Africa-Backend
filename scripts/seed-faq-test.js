
import "dotenv/config";
import prisma from "../src/config/database.js";

async function main() {
  // Create the test category, or reuse it if it already exists.
  const category = await prisma.fAQCategory.upsert({
    where: {
      slug: "test-payments",
    },
    update: {
      name: "Test Payments",
      description: "Temporary FAQ category for API testing.",
      isActive: true,
    },
    create: {
      name: "Test Payments",
      slug: "test-payments",
      description: "Temporary FAQ category for API testing.",
      isActive: true,
    },
  });

  const faqs = [
    {
      question: "What payment methods does China2Africa accept?",
      answer:
        "Our team will provide the applicable payment instructions after your sourcing requirements and order details have been confirmed.",
      sortOrder: 1,
    },
    {
      question: "When do I make payment for my sourcing request?",
      answer:
        "After the product specifications and order details have been confirmed, our team will communicate the payment instructions before the next stage proceeds.",
      sortOrder: 2,
    },
  ];

  for (const item of faqs) {
    await prisma.fAQ.upsert({
      where: {
        // FAQ has no unique question constraint, so find an existing
        // test record by its question and category before creating.
        id: (
          await prisma.fAQ.findFirst({
            where: {
              categoryId: category.id,
              question: item.question,
            },
            select: { id: true },
          })
        )?.id ?? "__create_new_faq__",
      },
      update: {
        answer: item.answer,
        isActive: true,
        sortOrder: item.sortOrder,
      },
      create: {
        categoryId: category.id,
        question: item.question,
        answer: item.answer,
        isActive: true,
        sortOrder: item.sortOrder,
      },
    });
  }

  const result = await prisma.fAQ.findMany({
    where: {
      categoryId: category.id,
    },
    select: {
      id: true,
      question: true,
      answer: true,
      isActive: true,
      sortOrder: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  console.log("FAQ category:", category.name);
  console.log("FAQs found:", result.length);
  console.dir(result, { depth: null });
}

main()
  .catch((error) => {
    console.error("FAQ seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


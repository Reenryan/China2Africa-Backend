import prisma from "../src/config/database.js";

const demoNames = [
  "DEMO — Customer One",
  "DEMO — Customer Two",
];

const testimonials = [
  {
    customerName: "DEMO — Customer One",
    organizationName: "Demo Trading Business",
    role: "Business Owner",
    content:
      "This is demonstration testimonial content for testing the China2Africa website. Replace it with verified customer feedback before publishing.",
    customerImage:
      "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759923311/Screenshot_2025-10-08_at_13-57-17_give_images_of_movie_actors_on_the_100_-_Google_Search_hgdizi.png",
    isPublished: true,
    sortOrder: 1,
  },
  {
    customerName: "DEMO — Customer Two",
    organizationName: "Demo Import Business",
    role: "Import Business Owner",
    content:
      "This is a second demonstration testimonial to check how multiple testimonials appear in the frontend. Replace it with genuine customer feedback before launch.",
    customerImage:
      "https://res.cloudinary.com/dudo0jfl5/image/upload/v1759922843/Screenshot_2025-10-08_at_13-59-13_give_images_of_movie_actors_on_person_of_intrest_-_Google_Search_dozgka.png",
    isPublished: true,
    sortOrder: 2,
  },
];

async function main() {
  // Remove only these specifically named demo records, making this
  // script safe to run repeatedly without duplicating the samples.
  await prisma.testimonial.deleteMany({
    where: {
      customerName: {
        in: demoNames,
      },
    },
  });

  await prisma.testimonial.createMany({
    data: testimonials,
  });

  const result = await prisma.testimonial.findMany({
    where: {
      customerName: {
        in: demoNames,
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  console.log(`Created ${result.length} demo testimonials.`);
  console.log(
    result.map((item) => ({
      customerName: item.customerName,
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
    }))
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed testimonials:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

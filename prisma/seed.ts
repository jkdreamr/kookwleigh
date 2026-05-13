import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.guest.upsert({
    create: {
      allergies: "No shellfish",
      email: "maya@example.com",
      favoriteCuisines: "Handmade noodles, citrusy salads, crispy rice",
      name: "Maya Chen",
      position: 1,
    },
    update: {},
    where: { email: "maya@example.com" },
  });

  await prisma.guest.upsert({
    create: {
      allergies: null,
      email: "eli@example.com",
      favoriteCuisines: "Korean stews, roast chicken, tiny cakes",
      name: "Eli Morgan",
      position: 2,
    },
    update: {},
    where: { email: "eli@example.com" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

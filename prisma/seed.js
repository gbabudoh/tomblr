/* eslint-disable */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in your environment.");
  console.log("Please create a .env file and add your PostgreSQL connection string.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const codes = [
    { code: "TOMBLR-2026-EARLY", expiresAt: new Date("2026-12-31") },
    { code: "ACCESS-NG-PRIV", expiresAt: new Date("2026-06-01") },
    { code: "DATA-STORAGE-ONE", expiresAt: new Date("2026-03-01") },
  ];

  console.log("Seeding access codes...");

  for (const item of codes) {
    const code = await prisma.accessCode.upsert({
      where: { code: item.code },
      update: {},
      create: {
        code: item.code,
        expiresAt: item.expiresAt,
      },
    });
    console.log(`Created/Updated code: ${code.code}`);
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

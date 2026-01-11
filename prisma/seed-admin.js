/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@tomblr.com.ng";
  const adminPassword = "password123"; // Change this immediately
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log("Seeding admin user...");

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Tomblr Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created/updated: ${admin.email}`);
  
  // Seed some access codes
  console.log("Seeding initial access codes...");
  const codes = [
    { code: "ADMN-BETA-01" },
    { code: "ADMN-BETA-02" },
    { code: "ADMN-BETA-03" },
  ];

  for (const codeData of codes) {
    await prisma.accessCode.upsert({
      where: { code: codeData.code },
      update: {},
      create: codeData,
    });
  }

  console.log("Seeding complete! Log in with:");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

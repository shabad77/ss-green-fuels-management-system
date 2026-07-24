// Bootstraps the very first Admin account. Run once after your first
// `prisma db push` — after that, all further users should be created
// from the in-app Users page (Admin only), not this script.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (existingAdmin) {
    console.log(`An admin account already exists (${existingAdmin.email}). Nothing to do.`);
    await prisma.$disconnect();
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL || "admin@ssgreenfuels.in";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });

  console.log("Created the first admin account:");
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log("\nLog in with this, then change the password immediately from the Users page.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

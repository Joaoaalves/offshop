/**
 * Seeds a default admin user.
 * Skips if a user with the same email already exists.
 *
 * Usage:
 *   npm run seed:admin
 *   # or with custom credentials:
 *   ADMIN_EMAIL=joao@offshop.com ADMIN_PASSWORD=minhasenha npm run seed:admin
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@offshop.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const col = mongoose.connection.db!.collection("users");
  const existing = await col.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log(`✓ User "${ADMIN_EMAIL}" already exists — skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await col.insertOne({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashed,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✓ Admin user created: ${ADMIN_EMAIL}`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => mongoose.disconnect());

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@jaconstrucoes.com" },
    update: {},
    create: {
      email: "admin@jaconstrucoes.com",
      senhaHash,
      nome: "Administrador",
      role: "admin",
    },
  });
  console.log("Admin criado:", admin.email);

  const categorias = [
    { nome: "Cimento", slug: "cimento" },
    { nome: "Ferragens", slug: "ferragens" },
    { nome: "Tintas", slug: "tintas" },
    { nome: "Madeiras", slug: "madeiras" },
    { nome: "Elétrica", slug: "eletrica" },
    { nome: "Hidráulica", slug: "hidraulica" },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categorias criadas:", categorias.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });

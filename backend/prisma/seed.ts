import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const company = await prisma.company.upsert({
    where: { cnpj: '00000000000191' },
    update: {},
    create: {
      name: 'Demo Company CRM',
      cnpj: '00000000000191',
      users: {
        create: {
          name: 'Admin User',
          email: 'admin@demo.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      },
      clients: {
        create: [
          { name: 'John Doe', email: 'john@example.com', phone: '11999999999', status: 'ACTIVE' },
          { name: 'Jane Smith', email: 'jane@example.com', phone: '11988888888', status: 'INACTIVE' },
          { name: 'Acme Corp', email: 'contact@acme.com', phone: '1133333333', status: 'ACTIVE' },
        ],
      },
    },
  });

  console.log('Seed completed successfully:', company.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.member.createMany({
    data: [
      { name: 'أحمد علي', phone: '0591234567', email: 'ahmed@example.com' },
      { name: 'سارة محمد', phone: '0597654321', email: 'sara@example.com' },
    ],
  });

  console.log('✅ تم إضافة بيانات تجريبية');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

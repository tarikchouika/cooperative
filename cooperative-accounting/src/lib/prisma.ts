import { PrismaClient } from '@prisma/client';

declare global {
  // السماح بوجود نسخة واحدة فقط في بيئة التطوير لتجنب إعادة إنشاء DB connection
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'info'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

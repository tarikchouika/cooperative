// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // لتجنّب إنشاء أكثر من نسخة في بيئة التطوير (Hot Reload)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let cashbox = await prisma.cashbox.findFirst();
  if (!cashbox) {
    cashbox = await prisma.cashbox.create({
      data: { balance: 0 },
    });
  }

  const movements = await prisma.cashMovement.findMany({
    where: { cashboxId: cashbox.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ ...cashbox, movements });
}

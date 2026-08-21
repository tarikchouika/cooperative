import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { type, amount, description, memberId, fromMemberId, toMemberId } = data;

  // Create the transaction
  const transaction = await prisma.transaction.create({
    data: {
      type,
      amount: Number(amount),
      description,
      memberId: memberId ? Number(memberId) : undefined,
      fromMemberId: fromMemberId ? Number(fromMemberId) : undefined,
      toMemberId: toMemberId ? Number(toMemberId) : undefined,
    },
  });

  // Update member balances
  if (type === 'DEPOSIT' && memberId) {
    await prisma.member.update({
      where: { id: Number(memberId) },
      data: { balance: { increment: Number(amount) } },
    });
  } else if (type === 'WITHDRAW' && memberId) {
    await prisma.member.update({
      where: { id: Number(memberId) },
      data: { balance: { decrement: Number(amount) } },
    });
  } else if (type === 'TRANSFER' && fromMemberId && toMemberId) {
    await prisma.member.update({
      where: { id: Number(fromMemberId) },
      data: { balance: { decrement: Number(amount) } },
    });
    await prisma.member.update({
      where: { id: Number(toMemberId) },
      data: { balance: { increment: Number(amount) } },
    });
  }

  return NextResponse.json(transaction);
}

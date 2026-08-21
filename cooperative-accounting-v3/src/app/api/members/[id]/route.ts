import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const member = await prisma.member.findUnique({
    where: { id: Number(params.id) },
  });
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { memberId: Number(params.id) },
        { fromMemberId: Number(params.id) },
        { toMemberId: Number(params.id) },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ member, transactions });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const data = await request.json();
  const member = await prisma.member.update({
    where: { id: Number(params.id) },
    data,
  });
  return NextResponse.json(member);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.transaction.deleteMany({
    where: {
      OR: [
        { memberId: Number(params.id) },
        { fromMemberId: Number(params.id) },
        { toMemberId: Number(params.id) },
      ],
    },
  });
  await prisma.member.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}

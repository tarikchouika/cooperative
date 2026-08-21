import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const members = await prisma.member.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const member = await prisma.member.create({ data });
  return NextResponse.json(member);
}

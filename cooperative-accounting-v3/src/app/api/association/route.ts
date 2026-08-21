import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let association = await prisma.association.findFirst();
  if (!association) {
    association = await prisma.association.create({
      data: { name: 'جمعية افتراضية' },
    });
  }
  return NextResponse.json(association);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const existing = await prisma.association.findFirst();
  if (existing) {
    const updated = await prisma.association.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json(updated);
  }
  const created = await prisma.association.create({ data });
  return NextResponse.json(created);
}

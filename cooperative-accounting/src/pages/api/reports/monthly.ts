import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  // جمع القيم حسب النوع
  const aggregates = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      createdAt: { gte: from, lte: to }
    },
    _sum: { amount: true },
  });

  const summary: any = {
    deposit: 0,
    withdraw: 0,
    transfer: 0,
  };

  aggregates.forEach(g => {
    summary[g.type.toLowerCase()] = g._sum.amount ?? 0;
  });

  // صافي النقد
  const net = summary.deposit - summary.withdraw - summary.transfer;

  res.json({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    ...summary,
    net,
  });
}

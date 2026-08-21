import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET جميع المعاملات
  if (req.method === 'GET') {
    const transactions = await prisma.transaction.findMany({
      include: { member: true, targetMember: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(transactions);
  }

  // POST إنشاء معاملة
  if (req.method === 'POST') {
    const { type, amount, description, memberId, targetMemberId } = req.body;

    // تحقق أساسي
    if (!type || !amount || !memberId) {
      return res.status(400).json({ error: 'البيانات غير كاملة' });
    }

    const parsedType = type as TransactionType;
    const data: any = {
      type: parsedType,
      amount: Number(amount),
      description,
      memberId: Number(memberId),
    };

    // إذا كان تحويلًا نضيف العضو المستلم
    if (parsedType === 'TRANSFER') {
      if (!targetMemberId) {
        return res.status(400).json({ error: 'يجب تحديد العضو المستلم للتحويل' });
      }
      data.targetMemberId = Number(targetMemberId);
    }

    const transaction = await prisma.transaction.create({ data });
    return res.status(201).json(transaction);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

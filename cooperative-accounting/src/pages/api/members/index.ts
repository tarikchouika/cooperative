import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: جلب كل الأعضاء
  if (req.method === 'GET') {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(members);
  }

  // POST: إضافة عضو جديد
  if (req.method === 'POST') {
    const { name, phone, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'الاسم مطلوب' });
    }
    const member = await prisma.member.create({
      data: { name, phone, email },
    });
    return res.status(201).json(member);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

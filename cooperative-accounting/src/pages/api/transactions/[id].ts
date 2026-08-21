import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'معرف غير صالح' });

  // GET معاملة محددة
  if (req.method === 'GET') {
    const tr = await prisma.transaction.findUnique({
      where: { id },
      include: { member: true, targetMember: true },
    });
    if (!tr) return res.status(404).json({ error: 'المعاملة غير موجودة' });
    return res.json(tr);
  }

  // DELETE (في الغالب لا يُحذف، لكن لتكملة CRUD)
  if (req.method === 'DELETE') {
    await prisma.transaction.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

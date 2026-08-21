import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'معرف غير صالح' });

  // GET عضو محدد
  if (req.method === 'GET') {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ error: 'العضو غير موجود' });
    return res.json(member);
  }

  // PUT تعديل
  if (req.method === 'PUT') {
    const { name, phone, email } = req.body;
    const updated = await prisma.member.update({
      where: { id },
      data: { name, phone, email },
    });
    return res.json(updated);
  }

  // DELETE حذف
  if (req.method === 'DELETE') {
    await prisma.member.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

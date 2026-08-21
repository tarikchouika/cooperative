'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Member } from '@prisma/client';

import TransactionTable from '@/components/TransactionTable';
import { formatNumber } from '@/utils/format';

interface Tx {
  id: number;
  type: string;
  amount: number;
  description?: string | null;
  memberId?: number | null;
  fromMemberId?: number | null;
  toMemberId?: number | null;
  createdAt: string;
}

export default function MemberReport({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/members/${params.id}`);
      const data = await res.json();
      setMember(data.member);
      setTxs(data.transactions);
    })();
  }, [params.id]);

  if (!member) return <p className="p-4">جارٍ التحميل …</p>;

  const totalDeposit = txs
    .filter((t) => t.type === 'DEPOSIT' && t.memberId === member.id)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdraw = txs
    .filter((t) => t.type === 'WITHDRAW' && t.memberId === member.id)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalTransferOut = txs
    .filter((t) => t.type === 'TRANSFER' && t.fromMemberId === member.id)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalTransferIn = txs
    .filter((t) => t.type === 'TRANSFER' && t.toMemberId === member.id)
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        كشف حساب – {member.fullName}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-primary text-white rounded shadow">
          إجمالي الإيداع: {formatNumber(totalDeposit)}
        </div>
        <div className="p-4 bg-red-600 text-white rounded shadow">
          إجمالي السحب: {formatNumber(totalWithdraw)}
        </div>
        <div className="p-4 bg-indigo-600 text-white rounded shadow">
          التحويلات الصادرة: {formatNumber(totalTransferOut)}
        </div>
        <div className="p-4 bg-green-600 text-white rounded shadow">
          التحويلات الواردة: {formatNumber(totalTransferIn)}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">الحركة التفصيلية</h2>
        <TransactionTable transactions={txs} />
      </section>
    </div>
  );
}

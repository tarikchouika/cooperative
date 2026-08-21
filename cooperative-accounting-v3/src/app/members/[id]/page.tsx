'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import TransactionTable from '@/components/TransactionTable';
import { formatNumber } from '@/utils/format';

interface Member {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  balance: number;
  createdAt: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description?: string | null;
  memberId?: number | null;
  fromMemberId?: number | null;
  toMemberId?: number | null;
  createdAt: string;
}

export default function MemberProfile({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/members/${params.id}`);
      const data = await res.json();
      setMember(data.member);
      setTxs(data.transactions);
    })();
  }, [params.id]);

  if (!member) return <p className="p-4">جارٍ التحميل…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{member.fullName}</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">البريد الإلكتروني</p>
          <p>{member.email}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">الهاتف</p>
          <p>{member.phone ?? '-'}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">الرصيد</p>
          <p className="text-xl font-bold">{formatNumber(member.balance)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">تاريخ الإنشاء</p>
          <p>{new Date(member.createdAt).toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">معاملات العضو</h2>
        <TransactionTable transactions={txs} />
      </section>
    </div>
  );
}

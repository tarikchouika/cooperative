import useSWR from 'swr';
import { Member } from '@prisma/client';
import TransactionForm from '@/components/TransactionForm';
import { useState } from 'react';

type TransactionWithRelations = {
  id: number;
  type: string;
  amount: number;
  description: string | null;
  createdAt: Date;
  memberId: number;
  targetMemberId: number | null;
  member?: Member;
  targetMember?: Member;
};

export default function TransactionsPage() {
  const { data: members, error: membersError } = useSWR<Member[]>('/api/members', (u: string) =>
    fetch(u).then(r => r.json())
  );
  const { data: transactions, error: trError, mutate } = useSWR<TransactionWithRelations[]>('/api/transactions', (u: string) =>
    fetch(u).then(r => r.json())
  );

  const [showForm, setShowForm] = useState(false);

  if (membersError || trError) return <p className="text-red-500">خطأ في التحميل</p>;
  if (!members || !transactions) return <p>جاري التحميل…</p>;

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold">المعاملات المالية</h2>

      <button
        className="px-4 py-2 bg-primary-600 text-white rounded"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'إخفاء النموذج' : 'إضافة معاملة'}
      </button>

      {showForm && (
        <TransactionForm
          members={members}
          onSuccess={() => {
            mutate();
            setShowForm(false);
          }}
        />
      )}

      {/* جدول المعاملات */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-right">النوع</th>
              <th className="px-4 py-2 text-right">المبلغ</th>
              <th className="px-4 py-2 text-right">العضو</th>
              <th className="px-4 py-2 text-right">المستلم (للتحويل)</th>
              <th className="px-4 py-2 text-right">التاريخ</th>
              <th className="px-4 py-2 text-center">الوصف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2">{t.amount.toFixed(2)} ر.س</td>
                <td className="px-4 py-2">{t.member?.name ?? '-'}</td>
                <td className="px-4 py-2">{t.targetMember?.name ?? '-'}</td>
                <td className="px-4 py-2">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="px-4 py-2">{t.description ?? '-'}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  لا توجد معاملات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

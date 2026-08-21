'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import CashboxInfo from '@/components/CashboxInfo';
import { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

type Movement = {
  id: number;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
};

export default function CashboxPage() {
  const cashbox = useStore((s) => s.cashbox);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/cashbox');
        const data = await res.json();
        setMovements(data.movements || []);
      } catch (e) {
        console.error('Failed to fetch cashbox:', e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الصندوق</h1>

      <CashboxInfo movements={movements as any} />

      <section>
        <h2 className="text-xl font-semibold mb-2">الحركات اليومية</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">التاريخ</th>
                <th className="p-2">النوع</th>
                <th className="p-2">المبلغ</th>
                <th className="p-2">الوصف</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{new Date(m.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-2 flex items-center justify-center">
                    {m.type === 'IN' ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-600" />
                    )}
                  </td>
                  <td className="p-2">{m.amount.toFixed(2)}</td>
                  <td className="p-2">{m.description ?? '-'}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">لا توجد حركات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import ReportCharts from '@/components/ReportCharts';
import { useEffect, useState } from 'react';
import { Transaction } from '@prisma/client';


export default function ReportsPage() {
  const transactions = useStore((s) => s.transactions);
  const setTransactions = useStore((s) => s.setTransactions);
  const [loading, setLoading] = useState(false);

  // تحديث البيانات إذا تغيرت
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const txs = await res.json();
      setTransactions(txs);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">التقارير</h1>

      {/* مخطط شهري للمعاملات */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">الإيداع والسحب شهرياً</h2>
        {loading ? (
          <p>جارٍ التحميل…</p>
        ) : (
          <ReportCharts transactions={transactions} />
        )}
      </section>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
export default function TransactionsPage() {
  const transactions = useStore((s) => s.transactions);
  const setTransactions = useStore((s) => s.setTransactions);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered =
    typeFilter === 'ALL'
      ? transactions
      : transactions.filter((t) => t.type === typeFilter);

  const refresh = async () => {
    const res = await fetch('/api/transactions');
    if (!res.ok) {
      console.error('فشل جلب المعاملات');
      return;
    }
    const txs = await res.json();
    setTransactions(txs);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">المعاملات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          إضافة عملية
        </button>
      </div>

      {/* فلاتر النوع */}
      <div className="flex space-x-2">
        {['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded ${
              typeFilter === t ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {t === 'ALL' ? 'الكل' : t}
          </button>
        ))}
      </div>

      <TransactionTable transactions={filtered} />

      {/* نموذج إضافة/تعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded shadow w-96">
            <TransactionForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

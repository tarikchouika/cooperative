"use client";
// src/components/TransactionForm.tsx
import { useForm } from 'react-hook-form';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

type Props = {
  onClose: () => void;
};

type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

type Member = {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  balance: number;
  createdAt: string;
};

type FormValues = {
  type: TransactionType;
  amount: number;
  description?: string;
  memberId?: number;        // إيداع/سحب
  fromMemberId?: number;    // تحويل
  toMemberId?: number;      // تحويل
};

export default function TransactionForm({ onClose }: Props) {
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { type: 'DEPOSIT' },
  });
  const [members, setMembers] = useState<Member[]>([]);
  const setTransactions = useStore((s) => s.setTransactions);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/members');
      const list = await res.json();
      setMembers(list);
    })();
  }, []);

  const onSubmit = async (data: FormValues) => {
    // ضبط البيانات حسب نوع العملية
    const payload: any = {
      type: data.type,
      amount: data.amount,
      description: data.description,
    };

    if (data.type === 'DEPOSIT' || data.type === 'WITHDRAW') {
      payload.memberId = data.memberId;
    } else if (data.type === 'TRANSFER') {
      payload.fromMemberId = data.fromMemberId;
      payload.toMemberId = data.toMemberId;
    }

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // تحديث الرصيد وسجل المعاملات
    const [membersRes, txsRes] = await Promise.all([
      fetch('/api/members'),
      fetch('/api/transactions'),
    ]);
    const updatedMembers = await membersRes.json();
    const txs = await txsRes.json();
    setMembers(updatedMembers);
    setTransactions(txs);
    reset();
    onClose();
  };

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div>
        <label className="block mb-1">نوع العملية</label>
        <select
          {...register('type')}
          className="w-full border rounded p-2"
        >
          <option value="DEPOSIT">إيداع</option>
          <option value="WITHDRAW">سحب</option>
          <option value="TRANSFER">تحويل</option>
        </select>
      </div>

      {/* اختيار العضو للـ إيداع أو السحب */}
      {(type === 'DEPOSIT' || type === 'WITHDRAW') && (
        <div>
          <label className="block mb-1">العضو</label>
          <select
            {...register('memberId', { required: true })}
            className="w-full border rounded p-2"
          >
            <option value="">اختر عضواً</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* اختيار الأعضاء للـ تحويل */}
      {type === 'TRANSFER' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">من العضو</label>
            <select
              {...register('fromMemberId', { required: true })}
              className="w-full border rounded p-2"
            >
              <option value="">اختر</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">إلى العضو</label>
            <select
              {...register('toMemberId', { required: true })}
              className="w-full border rounded p-2"
            >
              <option value="">اختر</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block mb-1">المبلغ</label>
        <input
          type="number"
          step="0.01"
          {...register('amount', { required: true, min: 0.01 })}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1">الوصف (اختياري)</label>
        <textarea
          {...register('description')}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          إلغاء
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          حفظ العملية
        </button>
      </div>
    </form>
  );
}

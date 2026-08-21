import { useState, FormEvent, useEffect } from 'react';
import { Member } from '@prisma/client';

type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

type Props = {
  members: Member[];
  onSuccess: () => void;
};

export default function TransactionForm({ members, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState<number>(members[0]?.id ?? 0);
  const [targetMemberId, setTargetMemberId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // عند اختيار تحويل، إظهار قائمة المستلم
  const showTarget = type === 'TRANSFER';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      type,
      amount: Number(amount),
      memberId,
      targetMemberId: showTarget ? targetMemberId : undefined,
      description,
    };

    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    // إفراغ الحقول
    setAmount('');
    setDescription('');
    onSuccess();
  }

  // عندما يتغير نوع المعاملة، نعيد ضبط المستلم
  useEffect(() => {
    if (showTarget) setTargetMemberId(members[0]?.id ?? 0);
  }, [showTarget, members]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">إضافة معاملة</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">النوع</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as TransactionType)}
          className="mt-1 block w-full rounded border-gray-300"
        >
          <option value="DEPOSIT">إيداع</option>
          <option value="WITHDRAW">سحب</option>
          <option value="TRANSFER">تحويل</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">المبلغ *</label>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded border-gray-300"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">العضو</label>
        <select
          value={memberId}
          onChange={e => setMemberId(Number(e.target.value))}
          className="mt-1 block w-full rounded border-gray-300"
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {showTarget && (
        <div>
          <label className="block text-sm font-medium text-gray-700">المستلم (للتحويل)</label>
          <select
            value={targetMemberId}
            onChange={e => setTargetMemberId(Number(e.target.value))}
            className="mt-1 block w-full rounded border-gray-300"
          >
            {members
              .filter(m => m.id !== memberId)
              .map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">الوصف (اختياري)</label>
        <textarea
          className="mt-1 block w-full rounded border-gray-300"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
      >
        {loading ? 'جاري الإضافة...' : 'حفظ'}
      </button>
    </form>
  );
}

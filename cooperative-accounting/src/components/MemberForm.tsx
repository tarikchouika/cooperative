import { useState, FormEvent } from 'react';
import { Member } from '@prisma/client';

type Props = {
  member?: Member;               // إذا كان تعديل
  onSuccess: () => void;        // لتحديث القائمة بعد الإضافة/التعديل
};

export default function MemberForm({ member, onSuccess }: Props) {
  const [name, setName] = useState(member?.name ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [loading, setLoading] = useState(false);
  const isEdit = !!member;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { name, phone, email };

    try {
      if (isEdit) {
        await fetch(`/api/members/${member!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">{isEdit ? 'تعديل عضو' : 'إضافة عضو'}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">الاسم *</label>
        <input
          required
          className="mt-1 block w-full rounded border-gray-300"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">الهاتف</label>
        <input
          className="mt-1 block w-full rounded border-gray-300"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input
          type="email"
          className="mt-1 block w-full rounded border-gray-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
      >
        {loading ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إضافة'}
      </button>
    </form>
  );
}

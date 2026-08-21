'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import MemberTable from '@/components/MemberTable';
import { useState } from 'react';
import MemberForm from '@/components/MemberForm';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Member } from '@prisma/client';

export default function MembersPage() {
  const members = useStore((s) => s.members);
  const setMembers = useStore((s) => s.setMembers);
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');

  const filtered = members.filter(
    (m) =>
      m.fullName.includes(search) ||
      m.email.includes(search) ||
      (m.phone ?? '').includes(search)
  );

  const handleDelete = async (id: number) => {
    if (!confirm('هل تريد حذف هذا العضو؟')) return;
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    const updated: Member[] = await fetch('/api/members').then((r) => r.json());
    setMembers(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">قائمة الأعضاء</h1>
        <button
          onClick={() => {
            setEditMember(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> إضافة عضو
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد..."
          className="w-full border rounded p-2"
        />
      </div>

      <MemberTable members={filtered} onDelete={handleDelete} />

      {/* نموذج الإضافة / التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded shadow w-96">
            <MemberForm
              defaultValues={editMember ?? undefined}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

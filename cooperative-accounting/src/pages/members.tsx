import useSWR from 'swr';
import { Member } from '@prisma/client';
import MemberForm from '@/components/MemberForm';
import { useState } from 'react';

export default function MembersPage() {
  const { data: members, error, mutate } = useSWR<Member[]>('/api/members', (url: string) =>
    fetch(url).then(r => r.json())
  );
  const [editing, setEditing] = useState<Member | null>(null);

  if (error) return <p className="text-red-500">خطأ في تحميل الأعضاء</p>;
  if (!members) return <p>جاري التحميل…</p>;

  async function handleDelete(id: number) {
    if (!confirm('هل تريد حذف هذا العضو؟')) return;

    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    mutate(); // تحديث القائمة
  }

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold">إدارة الأعضاء</h2>

      {/* نموذج الإضافة / التعديل */}
      <MemberForm
        member={editing ?? undefined}
        onSuccess={() => {
          mutate();
          setEditing(null);
        }}
      />

      {/* جدول الأعضاء */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-right">الاسم</th>
              <th className="px-4 py-2 text-right">الهاتف</th>
              <th className="px-4 py-2 text-right">البريد</th>
              <th className="px-4 py-2 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map(m => (
              <tr key={m.id}>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.phone ?? '-'}</td>
                <td className="px-4 py-2">{m.email ?? '-'}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => setEditing(m)}
                  >
                    تعديل
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(m.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

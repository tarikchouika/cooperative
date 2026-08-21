// src/components/MemberTable.tsx
import Link from 'next/link';
import { Member } from '@prisma/client';
import { formatNumber } from '@/utils/format';

type Props = {
  members: Member[];
  onDelete: (id: number) => void;
};

export default function MemberTable({ members, onDelete }: Props) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">الاسم</th>
            <th className="p-2">البريد</th>
            <th className="p-2">الهاتف</th>
            <th className="p-2">الرصيد</th>
            <th className="p-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.fullName}</td>
              <td className="p-2">{m.email}</td>
              <td className="p-2">{m.phone ?? '-'}</td>
              <td className="p-2">{formatNumber(m.balance)}</td>
              <td className="p-2 space-x-2">
                <Link
                  href={`/members/${m.id}`}
                  className="px-2 py-1 bg-primary rounded text-xs"
                >
                  تفاصيل
                </Link>
                <button
                  onClick={() => onDelete(m.id)}
                  className="px-2 py-1 bg-red-600 rounded text-xs"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

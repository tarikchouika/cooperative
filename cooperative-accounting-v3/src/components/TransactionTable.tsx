// src/components/TransactionTable.tsx
import { formatNumber } from '@/utils/format';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type TransactionLike = {
  id: number;
  type: string;
  amount: number;
  description?: string | null;
  memberId?: number | null;
  fromMemberId?: number | null;
  toMemberId?: number | null;
  createdAt: string | Date;
};

type Props = {
  transactions: TransactionLike[];
};

export default function TransactionTable({ transactions }: Props) {
  return (
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
          {transactions.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">
                {format(t.createdAt, 'dd/MM/yyyy HH:mm', { locale: ar })}
              </td>
              <td className="p-2">{t.type}</td>
              <td className="p-2">{formatNumber(t.amount)}</td>
              <td className="p-2">{t.description ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

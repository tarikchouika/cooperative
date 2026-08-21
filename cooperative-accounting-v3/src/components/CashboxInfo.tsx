// src/components/CashboxInfo.tsx
import { useStore } from '@/store/useStore';
import { formatNumber } from '@/utils/format';
import { CashMovement } from '@prisma/client';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

type Props = {
  movements: CashMovement[];
};

export default function CashboxInfo({ movements }: Props) {
  const cashbox = useStore((s) => s.cashbox);
  const balance = cashbox?.balance ?? 0;

  const inSum = movements
    .filter((m) => m.type === 'IN')
    .reduce((a, b) => a + Number(b.amount), 0);
  const outSum = movements
    .filter((m) => m.type === 'OUT')
    .reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-primary text-white rounded shadow">
        <p className="text-sm">الرصيد الحالي</p>
        <p className="text-2xl font-bold">{formatNumber(balance)}</p>
      </div>

      <div className="p-4 bg-green-600 text-white rounded shadow flex items-center">
        <ArrowUpIcon className="h-6 w-6 mr-2" />
        <div>
          <p className="text-sm">إجمالي الإيداعات</p>
          <p className="font-bold">{formatNumber(inSum)}</p>
        </div>
      </div>

      <div className="p-4 bg-red-600 text-white rounded shadow flex items-center">
        <ArrowDownIcon className="h-6 w-6 mr-2" />
        <div>
          <p className="text-sm">إجمالي السحوبات</p>
          <p className="font-bold">{formatNumber(outSum)}</p>
        </div>
      </div>
    </div>
  );
}

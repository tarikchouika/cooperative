'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import StatsCard from '@/components/StatsCard';
import TransactionTable from '@/components/TransactionTable';
import { HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '@/utils/format';

export default function Dashboard() {
  const members = useStore((s) => s.members);
  const transactions = useStore((s) => s.transactions);
  const cashbox = useStore((s) => s.cashbox);

  const totalMembers = members.length;
  const totalBalance = members.reduce(
    (sum, m) => sum + Number(m.balance),
    0
  );

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="عدد الأعضاء"
          value={totalMembers}
          icon={<HomeIcon className="h-6 w-6" />}
          bg="primary"
        />
        <StatsCard
          title="رصيد الأعضاء"
          value={formatNumber(totalBalance)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          bg="secondary"
        />
        <StatsCard
          title="رصيد الصندوق"
          value={formatNumber(cashbox?.balance ?? 0)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          bg="primary"
        />
      </div>

      {/* آخر المعاملات */}
      <section>
        <h2 className="text-xl font-semibold mb-4">آخر المعاملات</h2>
        <TransactionTable transactions={recentTx} />
      </section>
    </div>
  );
}

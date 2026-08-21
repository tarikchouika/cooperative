// src/components/ReportCharts.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

type ChartData = {
  month: string;
  deposit: number;
  withdraw: number;
};

export default function ReportCharts({ transactions }: Props) {
  // تجميع شهري
  const data: ChartData[] = [];

  transactions.forEach((t) => {
    const month = format(t.createdAt, 'yyyy-MM', { locale: ar });
    let monthObj = data.find((d) => d.month === month);
    if (!monthObj) {
      monthObj = { month, deposit: 0, withdraw: 0 };
      data.push(monthObj);
    }
    if (t.type === 'DEPOSIT') monthObj.deposit += Number(t.amount);
    if (t.type === 'WITHDRAW') monthObj.withdraw += Number(t.amount);
  });

  // ترتيب زمني
  data.sort((a, b) => (a.month > b.month ? 1 : -1));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="deposit" fill="#10b981" name="إيداع" />
        <Bar dataKey="withdraw" fill="#ef4444" name="سحب" />
      </BarChart>
    </ResponsiveContainer>
  );
}

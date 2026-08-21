import useSWR from 'swr';

type Summary = {
  month: number;
  year: number;
  deposit: number;
  withdraw: number;
  transfer: number;
  net: number;
};

export default function DashboardStats() {
  const { data, error } = useSWR<Summary>('/api/reports/monthly', (url: string) =>
    fetch(url).then(res => res.json())
  );

  if (error) return <p className="text-red-500">خطأ في تحميل البيانات</p>;
  if (!data) return <p>جاري التحميل…</p>;

  const { deposit, withdraw, transfer, net } = data;

  const cards = [
    { title: 'إجمالي الإيداع', value: deposit, bg: 'bg-green-100', txt: 'text-green-800' },
    { title: 'إجمالي السحب', value: withdraw, bg: 'bg-red-100', txt: 'text-red-800' },
    { title: 'إجمالي التحويل', value: transfer, bg: 'bg-yellow-100', txt: 'text-yellow-800' },
    { title: 'صافي النقد', value: net, bg: 'bg-blue-100', txt: 'text-blue-800' },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(c => (
        <div key={c.title} className={`p-4 rounded ${c.bg} shadow`}>
          <p className="text-sm font-medium text-gray-600">{c.title}</p>
          <p className={`text-2xl font-bold ${c.txt}`}>{c.value.toFixed(2)} ر.س</p>
        </div>
      ))}
    </div>
  );
}

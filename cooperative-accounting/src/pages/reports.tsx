import useSWR from 'swr';

type Summary = {
  month: number;
  year: number;
  deposit: number;
  withdraw: number;
  transfer: number;
  net: number;
};

export default function ReportsPage() {
  const { data, error } = useSWR<Summary>('/api/reports/monthly', (u: string) =>
    fetch(u).then(r => r.json())
  );

  if (error) return <p className="text-red-500">خطأ في تحميل التقرير</p>;
  if (!data) return <p>جاري التحميل…</p>;

  const monthNames = [
    '',
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">التقرير الشهري</h2>

      <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm text-gray-600">الشهر</p>
          <p className="text-lg font-semibold">{monthNames[data.month]}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">السنة</p>
          <p className="text-lg font-semibold">{data.year}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">الإيداع</p>
          <p className="text-lg font-semibold text-green-600">{data.deposit.toFixed(2)} ر.س</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">السحب</p>
          <p className="text-lg font-semibold text-red-600">{data.withdraw.toFixed(2)} ر.س</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">التحويل</p>
          <p className="text-lg font-semibold text-yellow-600">{data.transfer.toFixed(2)} ر.س</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">الصافي</p>
          <p className="text-lg font-semibold text-blue-600">{data.net.toFixed(2)} ر.س</p>
        </div>
      </div>
    </section>
  );
}

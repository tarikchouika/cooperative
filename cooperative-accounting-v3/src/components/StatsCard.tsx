// src/components/StatsCard.tsx
type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg?: string;
};

export default function StatsCard({ title, value, icon, bg }: Props) {
  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow bg-${bg ?? 'secondary'} text-white`}
    >
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

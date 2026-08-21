// src/components/Header.tsx
import { useStore } from '@/store/useStore';

export default function Header() {
  const association = useStore((s) => s.association);
  return (
    <header className="flex items-center justify-between bg-white shadow p-4">
      <h2 className="text-xl font-semibold">
        {association?.name || 'جمعية غير معرفة'}
      </h2>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">
          عملة: {association?.currency || '-'}
        </span>
      </div>
    </header>
  );
}

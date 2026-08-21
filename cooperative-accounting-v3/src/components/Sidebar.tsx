"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BanknotesIcon,
  TableCellsIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const nav = [
  { href: '/', label: 'اللوحة', icon: HomeIcon },
  { href: '/members', label: 'الأعضاء', icon: UsersIcon },
  { href: '/transactions', label: 'المعاملات', icon: TableCellsIcon },
  { href: '/cashbox', label: 'الصندوق', icon: BanknotesIcon },
  { href: '/reports', label: 'التقارير', icon: ChartBarIcon },
  { href: '/settings', label: 'الإعدادات', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-primary text-white h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">نظام الجمعية</h1>
      <nav className="flex-1 space-y-2">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <div
              className={`flex items-center py-2 px-3 rounded hover:bg-primary/80 transition-colors ${
                pathname === item.href ? 'bg-primary/80' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-2" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

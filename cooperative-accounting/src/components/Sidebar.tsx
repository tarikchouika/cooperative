import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'لوحة التحكم' },
  { href: '/members', label: 'الأعضاء' },
  { href: '/transactions', label: 'المعاملات' },
  { href: '/reports', label: 'التقارير' },
];

export default function Sidebar() {
  const { pathname } = useRouter();

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 text-center font-bold text-lg">🧩 التعاونيات</div>
      <nav className="flex-1">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            <a
              className={`block px-4 py-2 hover:bg-gray-100 ${
                pathname === href ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              {label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

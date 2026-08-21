import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

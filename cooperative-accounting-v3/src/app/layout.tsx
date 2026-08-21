import '@/styles/globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Initialize from './initialize';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <Initialize>{children}</Initialize>
        </div>
      </body>
    </html>
  );
}

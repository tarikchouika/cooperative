import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';

export default function MyApp({ Component, pageProps }: AppProps) {
  // جميع الصفحات ستُحاط بـ Layout (قائمة جانبية + Header)
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

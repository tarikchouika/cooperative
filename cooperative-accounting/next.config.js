/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // لتفعيل اللغة العربية (rtl) نضيف إعداد بسيط للـ CSS
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
};

module.exports = nextConfig;

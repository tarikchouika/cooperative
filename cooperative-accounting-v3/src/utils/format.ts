// src/utils/format.ts
export const formatNumber = (num: number | string) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'AED', // غيّر إلى عملتك في settings إذا أردت
  }).format(Number(num));
};

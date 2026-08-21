module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a', // أزرق غامق للـ sidebar
        secondary: '#0f172a',
      },
    },
  },
  plugins: [],
};

// static/js/theme.js — مبدّل الوضع القاتم/الفاتح (جمعية المعمورة)
(function () {
    const THEME_KEY = 'app_theme';

    // قراءة الوضع المحفوظ (مع دعم تفضيل النظام)
    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // ربط أزرار التبديل
    function bindToggles() {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                localStorage.setItem(THEME_KEY, next);
                applyTheme(next);
            });
        });
    }

    // تهيئة مبكرة لمنع الوميض (يُستدعى أيضاً بعد DOMContentLoaded للأزرار)
    applyTheme(getTheme());
    document.addEventListener('DOMContentLoaded', bindToggles);
})();

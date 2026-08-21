// static/js/i18n.js
const translations = {
    en: { dir: 'ltr', lang: 'en', data: {} },
    ar: { dir: 'rtl', lang: 'ar', data: {} },
    fr: { dir: 'ltr', lang: 'fr', data: {} }
};

let currentLang = localStorage.getItem('app_lang') || 'en';

async function loadLanguage(lang) {
    const response = await fetch(`/locales/${lang}.json`);
    translations[lang].data = await response.json();
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguage();
}

function applyLanguage() {
    const html = document.documentElement;
    html.setAttribute('dir', translations[currentLang].dir);
    html.setAttribute('lang', translations[currentLang].lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang].data[key]) {
            el.textContent = translations[currentLang].data[key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadLanguage(currentLang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            loadLanguage(e.target.dataset.lang);
        });
    });
});

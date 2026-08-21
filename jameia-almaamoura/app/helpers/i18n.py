import json
import os
from flask import request, session

LOCALES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'locales')
_translations = {}

def load_translations():
    global _translations
    for lang in ['en', 'ar', 'fr']:
        path = os.path.join(LOCALES_DIR, f'{lang}.json')
        with open(path, 'r', encoding='utf-8') as f:
            _translations[lang] = json.load(f)

def get_current_lang():
    # Priority: URL param > Session > Browser > Default
    lang = request.args.get('lang')
    if lang and lang in ['en', 'ar', 'fr']:
        session['lang'] = lang
        return lang
    return session.get('lang', request.accept_languages.best_match(['en', 'ar', 'fr']) or 'en')

def t(key, lang=None):
    """Translate a key to current language"""
    if lang is None:
        lang = get_current_lang()
    return _translations.get(lang, {}).get(key, _translations['en'].get(key, key))

def inject_i18n():
    """Inject translations into Jinja2 templates"""
    lang = get_current_lang()
    return {
        'current_lang': lang,
        'dir': 'rtl' if lang == 'ar' else 'ltr',
        't': lambda key: t(key, lang),
        'translations': _translations.get(lang, {})
    }

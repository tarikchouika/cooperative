import os

# المسار الأساسي للمشروع (يعمل من أي مجلد)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    # [FIX] المسار الأساسي للمشروع (متاح كخاصية للفئة كما تستخدمه المسارات)
    BASE_DIR = BASE_DIR
    # [FIX] مفتاح سري حقيقي — يُقرأ من متغير البيئة أو قيمة تطوير افتراضية (وليس '***')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me-9f3a2c')
    DATABASE = os.path.join(BASE_DIR, 'database', 'jameia.db')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    REPORTS_FOLDER = os.path.join(BASE_DIR, 'reports')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    SESSION_TIMEOUT = 3600  # ساعة واحدة
    DEFAULT_LANG = 'en'
    SUPPORTED_LANGS = ['en', 'ar', 'fr']

    # إعدادات البريد الإلكتروني (اختيارية، من متغيرات البيئة)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

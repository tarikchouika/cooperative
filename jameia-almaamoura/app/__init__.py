import os
from flask import Flask, send_file, abort
from config import Config
from app.helpers.i18n import load_translations, inject_i18n

def create_app():
    # [FIX] تحديد مسار static صراحةً: الملفات في static/ على مستوى جذر المشروع
    # (وإلا يبحث Flask افتراضياً في app/static فيرجع 404 لكل CSS/JS)
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static'))
    app.config.from_object(Config)

    # تحميل ملفات الترجمة (en/ar/fr)
    load_translations()

    # حقن دوال الترجمة في جميع القوالب (t, current_lang, dir)
    @app.context_processor
    def inject_globals():
        return inject_i18n()

    # [FIX] تقديم ملفات الترجمة JSON للواجهة الأمامية (يستخدمها i18n.js في صفحة dashboard.html التجريبية)
    @app.route('/locales/<lang>.json')
    def locales(lang):
        # منع أي لغة غير مدعومة (حماية من المسارات)
        if lang not in Config.SUPPORTED_LANGS:
            abort(404)
        path = os.path.join(Config.BASE_DIR, 'locales', f'{lang}.json')
        if not os.path.exists(path):
            abort(404)
        return send_file(path, mimetype='application/json')

    # تسجيل الـ blueprints
    from app.controllers.auth import auth_bp
    from app.controllers.dashboard import dashboard_bp
    from app.controllers.members import members_bp
    from app.controllers.finance import finance_bp
    from app.controllers.donations import donations_bp
    from app.controllers.projects import projects_bp
    from app.controllers.beneficiaries import beneficiaries_bp
    from app.controllers.legal import legal_bp
    from app.controllers.reports import reports_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(members_bp, url_prefix='/members')
    app.register_blueprint(finance_bp, url_prefix='/finance')
    app.register_blueprint(donations_bp, url_prefix='/donations')
    app.register_blueprint(projects_bp, url_prefix='/projects')
    app.register_blueprint(beneficiaries_bp, url_prefix='/beneficiaries')
    app.register_blueprint(legal_bp, url_prefix='/legal')
    app.register_blueprint(reports_bp, url_prefix='/reports')

    return app

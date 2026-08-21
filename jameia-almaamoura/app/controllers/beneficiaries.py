# ==========================================
# جمعية المعمورة للتنمية والتكافل
# وحدة المستفيدين (Beneficiaries Controller)
# ==========================================
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.helpers.auth import login_required, role_required, get_db, log_activity
from app.helpers.i18n import t
from datetime import datetime

beneficiaries_bp = Blueprint('beneficiaries', __name__)


@beneficiaries_bp.route('/')
@login_required
def index():
    """قائمة المستفيدين + إحصائيات سريعة"""
    conn = get_db()
    stats = {
        'total': conn.execute("SELECT COUNT(*) FROM beneficiaries WHERE is_active = 1").fetchone()[0],
        'families': conn.execute("SELECT COUNT(DISTINCT national_id) FROM beneficiaries WHERE is_active = 1").fetchone()[0],
        'this_month': conn.execute("SELECT COUNT(*) FROM assistance_records WHERE assistance_date >= date('now', 'start of month')").fetchone()[0],
        'total_assistance': conn.execute("SELECT COUNT(*) FROM assistance_records").fetchone()[0]
    }
    beneficiaries = conn.execute('SELECT * FROM beneficiaries WHERE is_active = 1 ORDER BY registered_date DESC').fetchall()
    conn.close()
    return render_template('beneficiaries/index.html', stats=stats, beneficiaries=beneficiaries)


@beneficiaries_bp.route('/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'project_manager'])
def new():
    """إضافة مستفيد جديد"""
    conn = get_db()
    if request.method == 'POST':
        national_id = request.form.get('national_id')
        # منع التكرار حسب رقم الهوية
        existing = conn.execute('SELECT id FROM beneficiaries WHERE national_id = ?', (national_id,)).fetchone()
        if existing:
            flash(t('beneficiary_exists'), 'error')
            conn.close()
            return redirect(request.url)

        ben_number = f"BEN-{datetime.now().strftime('%Y%m%d')}-{conn.execute('SELECT COUNT(*) FROM beneficiaries').fetchone()[0] + 1:04d}"

        conn.execute('''
            INSERT INTO beneficiaries (beneficiary_number, full_name, national_id, gender, birthdate, family_size, address, phone, income_level, social_status, needs_description, registered_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))
        ''', (ben_number, request.form.get('full_name'), national_id, request.form.get('gender'),
              request.form.get('birthdate'), request.form.get('family_size'), request.form.get('address'),
              request.form.get('phone'), request.form.get('income_level'), request.form.get('social_status'),
              request.form.get('needs_description')))

        conn.commit()
        log_activity(session['user_id'], 'BENEFICIARY_ADD', f'Added {ben_number}')
        flash(t('beneficiary_added'), 'success')
        conn.close()
        return redirect(url_for('beneficiaries.index'))

    conn.close()
    return render_template('beneficiaries/form.html')


@beneficiaries_bp.route('/<int:id>')
@login_required
def view(id):
    """ملف المستفيد: بياناته + سجل مساعداته + نموذج إضافة مساعدة"""
    conn = get_db()
    beneficiary = conn.execute('SELECT * FROM beneficiaries WHERE id = ?', (id,)).fetchone()
    if not beneficiary:
        flash(t('beneficiary_not_found'), 'error')
        conn.close()
        return redirect(url_for('beneficiaries.index'))
    assistance = conn.execute('''
        SELECT ar.*, p.project_name
        FROM assistance_records ar
        LEFT JOIN projects p ON ar.project_id = p.id
        WHERE ar.beneficiary_id = ?
        ORDER BY ar.assistance_date DESC
    ''', (id,)).fetchall()
    # المشاريع النشطة لاختيارها في نموذج إضافة المساعدة
    projects = conn.execute("SELECT * FROM projects WHERE status = 'active'").fetchall()
    conn.close()
    return render_template('beneficiaries/view.html', beneficiary=beneficiary, assistance=assistance, projects=projects)


@beneficiaries_bp.route('/<int:id>/assistance', methods=['POST'])
@login_required
@role_required(['admin', 'project_manager'])
def add_assistance(id):
    """تسجيل مساعدة جديدة لمستفيد"""
    conn = get_db()
    project_id = request.form.get('project_id') or None
    conn.execute('''
        INSERT INTO assistance_records (beneficiary_id, project_id, assistance_type, amount_or_description, assistance_date, approved_by, notes)
        VALUES (?, ?, ?, ?, date('now'), ?, ?)
    ''', (id, project_id, request.form.get('assistance_type'),
          request.form.get('amount_or_description'), session['user_id'], request.form.get('notes')))
    conn.commit()
    log_activity(session['user_id'], 'ASSISTANCE', f'Beneficiary {id}')
    flash(t('assistance_recorded'), 'success')
    conn.close()
    return redirect(url_for('beneficiaries.view', id=id))

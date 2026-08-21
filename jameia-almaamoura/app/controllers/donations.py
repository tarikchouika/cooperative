from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.helpers.auth import login_required, role_required, get_db, log_activity
from app.helpers.i18n import t
from datetime import datetime

donations_bp = Blueprint('donations', __name__)


@donations_bp.route('/')
@login_required
def index():
    """صفحة التبرعات: إحصائيات + آخر التبرعات المسجلة"""
    conn = get_db()
    stats = {
        'total': conn.execute("SELECT COALESCE(SUM(amount), 0) FROM donations").fetchone()[0],
        'this_month': conn.execute("SELECT COALESCE(SUM(amount), 0) FROM donations WHERE donation_date >= date('now', 'start of month')").fetchone()[0],
        'zakat_balance': conn.execute("SELECT COALESCE(SUM(CASE WHEN donation_type='zakat' THEN amount ELSE 0 END), 0) - COALESCE((SELECT SUM(amount) FROM zakat_distributions), 0) FROM donations").fetchone()[0],
        'donors_count': conn.execute("SELECT COUNT(DISTINCT donor_id) FROM donations WHERE donor_id IS NOT NULL").fetchone()[0]
    }
    recent = conn.execute('''
        SELECT d.*, COALESCE(do.full_name, do.company_name, 'Anonymous') as donor_name
        FROM donations d
        LEFT JOIN donors do ON d.donor_id = do.id
        ORDER BY d.donation_date DESC, d.id DESC LIMIT 10
    ''').fetchall()
    conn.close()
    return render_template('donations/index.html', stats=stats, recent=recent)


@donations_bp.route('/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'accountant'])
def new_donation():
    """تسجيل تبرع جديد وإصدار إيصال برقم تسلسلي RC-YYYYMMDD-NNNN"""
    conn = get_db()
    if request.method == 'POST':
        donor_id = request.form.get('donor_id') or None
        amount = float(request.form.get('amount'))
        donation_type = request.form.get('donation_type')
        project_id = request.form.get('project_id') or None
        campaign_id = request.form.get('campaign_id') or None
        payment_method = request.form.get('payment_method')
        is_anonymous = 1 if request.form.get('is_anonymous') else 0

        last = conn.execute("SELECT donation_number FROM donations ORDER BY id DESC LIMIT 1").fetchone()
        n = (int(last['donation_number'].split('-')[-1]) + 1) if last else 1
        donation_number = f"RC-{datetime.now().strftime('%Y%m%d')}-{n:04d}"

        conn.execute('''
            INSERT INTO donations (donor_id, donation_number, donation_date, amount, donation_type, project_id, campaign_id, payment_method, is_anonymous, receipt_issued)
            VALUES (?, ?, date('now'), ?, ?, ?, ?, ?, ?, 1)
        ''', (donor_id, donation_number, amount, donation_type, project_id, campaign_id, payment_method, is_anonymous))

        if donor_id:
            conn.execute('UPDATE donors SET total_donated = total_donated + ? WHERE id = ?', (amount, donor_id))
        if campaign_id:
            conn.execute('UPDATE campaigns SET collected_amount = collected_amount + ? WHERE id = ?', (amount, campaign_id))

        conn.commit()
        log_activity(session['user_id'], 'DONATION', f'Receipt {donation_number} - ${amount}')
        flash(t('donation_recorded'), 'success')
        conn.close()
        return redirect(url_for('donations.receipt', number=donation_number))

    donors = conn.execute('SELECT * FROM donors ORDER BY full_name').fetchall()
    projects = conn.execute("SELECT * FROM projects WHERE status = 'active'").fetchall()
    campaigns = conn.execute("SELECT * FROM campaigns WHERE status = 'active'").fetchall()
    conn.close()
    return render_template('donations/new.html', donors=donors, projects=projects, campaigns=campaigns)


@donations_bp.route('/receipt/<number>')
@login_required
def receipt(number):
    """عرض إيصال التبرع للطباعة"""
    conn = get_db()
    donation = conn.execute('''
        SELECT d.*, COALESCE(do.full_name, do.company_name, 'Anonymous') as donor_name
        FROM donations d LEFT JOIN donors do ON d.donor_id = do.id
        WHERE d.donation_number = ?
    ''', (number,)).fetchone()
    conn.close()
    if not donation:
        flash(t('receipt_not_found'), 'error')
        return redirect(url_for('donations.index'))
    return render_template('donations/receipt.html', donation=donation)


@donations_bp.route('/zakat')
@login_required
@role_required(['admin', 'accountant'])
def zakat():
    """لوحة الزكاة: الأصناف الثمانية وتوزيعاتها مقارنة بإجمالي الزكاة المحصلة"""
    conn = get_db()
    categories = [
        ('fuqara', t('zakat_fuqara')),
        ('masakin', t('zakat_masakin')),
        ('amilin', t('zakat_amilin')),
        ('muallafah', t('zakat_muallafah')),
        ('riqab', t('zakat_riqab')),
        ('gharimin', t('zakat_gharimin')),
        ('fisabilillah', t('zakat_fisabilillah')),
        ('ibn_sabil', t('zakat_ibn_sabil'))
    ]
    total_zakat = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM donations WHERE donation_type = 'zakat'").fetchone()[0]
    distributed = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM zakat_distributions").fetchone()[0]

    distributions = {}
    for cat, _ in categories:
        distributions[cat] = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM zakat_distributions WHERE category = ?", (cat,)
        ).fetchone()[0]  # [FIX] استعلام معامل — الأصلي كان بإدراج f-string

    conn.close()
    return render_template('donations/zakat.html',
                          categories=categories, distributions=distributions,
                          total_zakat=total_zakat, distributed=distributed,
                          remaining=total_zakat - distributed)


@donations_bp.route('/campaigns')
@login_required
def campaigns():
    """عرض حملات التبرع مع تقدم التحصيل"""
    conn = get_db()
    campaigns = conn.execute('SELECT * FROM campaigns ORDER BY start_date DESC').fetchall()
    conn.close()
    return render_template('donations/campaigns.html', campaigns=campaigns)

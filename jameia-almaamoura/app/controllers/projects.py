from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.helpers.auth import login_required, role_required, get_db, log_activity
from app.helpers.i18n import t
from datetime import date, datetime

projects_bp = Blueprint('projects', __name__)

# الحالات المسموح بها للمشروع
PROJECT_STATUSES = ['planning', 'active', 'completed', 'suspended']

# خريطة حالة -> فئة شارة ملونة
STATUS_BADGES = {
    'planning': 'badge-warning',
    'active': 'badge-success',
    'completed': 'badge-info',
    'suspended': 'badge-danger',
}


def _status_badge(status):
    """إرجاع فئة الشارة المناسبة لحالة المشروع"""
    return STATUS_BADGES.get(status, 'badge-info')


@projects_bp.route('/')
@login_required
def index():
    """قائمة المشاريع مع إحصائيات موجزة"""
    conn = get_db()
    stats = {
        'total_projects': conn.execute('SELECT COUNT(*) FROM projects').fetchone()[0],
        'active_count': conn.execute("SELECT COUNT(*) FROM projects WHERE status = 'active'").fetchone()[0],
        'total_budget': conn.execute('SELECT COALESCE(SUM(budget), 0) FROM projects').fetchone()[0],
        'total_spent': conn.execute('SELECT COALESCE(SUM(spent_amount), 0) FROM projects').fetchone()[0]
    }
    rows = conn.execute('''
        SELECT p.*, u.full_name as manager_name
        FROM projects p
        LEFT JOIN users u ON p.manager_id = u.id
        ORDER BY p.start_date DESC, p.id DESC
    ''').fetchall()
    conn.close()

    # تحويل الصفوف إلى قواميس مع إضافة حقول مساعدة للقالب
    projects = []
    for row in rows:
        d = dict(row)
        budget = d.get('budget') or 0
        d['spent_percent'] = (d.get('spent_amount') or 0) / budget * 100 if budget > 0 else 0
        d['status_badge'] = _status_badge(d['status'])
        projects.append(d)

    return render_template('projects/index.html', stats=stats, projects=projects)


@projects_bp.route('/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'project_manager'])
def new():
    """إنشاء مشروع جديد (رقم المشروع يُولَّد تلقائياً)"""
    conn = get_db()
    if request.method == 'POST':
        project_name = (request.form.get('project_name') or '').strip()
        if not project_name:
            flash(t('fill_required_fields'), 'error')
            conn.close()
            return redirect(request.url)

        category = (request.form.get('category') or '').strip() or None
        description = (request.form.get('description') or '').strip() or None
        start_date = request.form.get('start_date') or None
        end_date = request.form.get('end_date') or None
        budget = float(request.form.get('budget') or 0)
        status = request.form.get('status', 'planning')
        if status not in PROJECT_STATUSES:
            status = 'planning'
        manager_id = request.form.get('manager_id') or None
        notes = (request.form.get('notes') or '').strip() or None

        # توليد رقم المشروع التلقائي: PRJ-YYYYMMDD-NNNN
        last = conn.execute('SELECT project_number FROM projects ORDER BY id DESC LIMIT 1').fetchone()
        n = (int(last['project_number'].split('-')[-1]) + 1) if last else 1
        project_number = f"PRJ-{datetime.now().strftime('%Y%m%d')}-{n:04d}"

        conn.execute('''
            INSERT INTO projects (project_number, project_name, category, description,
                                  start_date, end_date, budget, status, manager_id, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (project_number, project_name, category, description,
              start_date, end_date, budget, status, manager_id, notes))
        conn.commit()
        log_activity(session['user_id'], 'PROJECT_CREATE', f'Created {project_number}')
        flash(t('project_created'), 'success')
        conn.close()
        return redirect(url_for('projects.index'))

    managers = conn.execute('SELECT id, full_name FROM users WHERE is_active = 1 ORDER BY full_name').fetchall()
    conn.close()
    return render_template('projects/form.html', managers=managers, today=date.today().isoformat())


@projects_bp.route('/<int:id>')
@login_required
def detail(id):
    """صفحة تفاصيل المشروع: البطاقة + شريط تقدم المصروفات"""
    conn = get_db()
    row = conn.execute('''
        SELECT p.*, u.full_name as manager_name
        FROM projects p
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.id = ?
    ''', (id,)).fetchone()
    if not row:
        flash(t('project_not_found'), 'error')
        conn.close()
        return redirect(url_for('projects.index'))

    project = dict(row)
    budget = project.get('budget') or 0
    project['spent_percent'] = (project.get('spent_amount') or 0) / budget * 100 if budget > 0 else 0
    project['status_badge'] = _status_badge(project['status'])
    conn.close()
    return render_template('projects/detail.html', project=project)

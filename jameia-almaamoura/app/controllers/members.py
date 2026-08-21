# -*- coding: utf-8 -*-
# إدارة أعضاء الجمعية: قائمة الأعضاء + إضافة عضو جديد + تسجيل الاشتراكات السنوية
from datetime import date

from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from app.helpers.auth import get_db, login_required, log_activity
from app.helpers.i18n import t

members_bp = Blueprint('members', __name__)

# أنواع العضوية المسموح بها
MEMBERSHIP_TYPES = ('founding', 'active', 'honorary', 'associate')


def _next_member_number(conn):
    """رقم عضوية تلقائي بصيغة M-YYYYMMDD-NNNN"""
    prefix = 'M-' + date.today().strftime('%Y%m%d') + '-'
    count = conn.execute(
        "SELECT COUNT(*) FROM members WHERE member_number LIKE ?",
        (prefix + '%',)
    ).fetchone()[0]
    return f'{prefix}{count + 1:04d}'


@members_bp.route('/')
@login_required
def index():
    """قائمة الأعضاء مع إحصائيات موجزة وبحث بالاسم أو رقم العضوية"""
    conn = get_db()
    q = request.args.get('q', '').strip()

    total_members = conn.execute("SELECT COUNT(*) FROM members").fetchone()[0]
    active_members = conn.execute(
        "SELECT COUNT(*) FROM members WHERE is_active = 1"
    ).fetchone()[0]
    fees_this_year = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM membership_fees WHERE year = ?",
        (date.today().year,)
    ).fetchone()[0]
    unpaid_members = conn.execute(
        "SELECT COUNT(*) FROM members WHERE is_active = 1 AND fee_status = 'unpaid'"
    ).fetchone()[0]

    if q:
        members = conn.execute(
            "SELECT * FROM members WHERE full_name LIKE ? OR member_number LIKE ? "
            "ORDER BY join_date DESC, id DESC",
            (f'%{q}%', f'%{q}%')
        ).fetchall()
    else:
        members = conn.execute(
            "SELECT * FROM members ORDER BY join_date DESC, id DESC"
        ).fetchall()
    conn.close()

    return render_template(
        'members/index.html',
        members=members,
        q=q,
        total_members=total_members,
        active_members=active_members,
        fees_this_year=fees_this_year,
        unpaid_members=unpaid_members,
    )


@members_bp.route('/new', methods=['GET', 'POST'])
@login_required
def new():
    """إضافة عضو جديد برقم عضوية تلقائي"""
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        national_id = request.form.get('national_id', '').strip()
        membership_type = request.form.get('membership_type', '')
        join_date = request.form.get('join_date', '')
        annual_fee = request.form.get('annual_fee', '0')
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()
        gender = request.form.get('gender', '')
        birthdate = request.form.get('birthdate', '')

        # التحقق من الحقول الإلزامية
        if not full_name or membership_type not in MEMBERSHIP_TYPES or not join_date:
            flash(t('fill_required_fields'), 'error')
            return render_template('members/form.html', form=request.form)

        try:
            annual_fee = float(annual_fee) if annual_fee else 0.0
        except ValueError:
            annual_fee = 0.0

        conn = get_db()
        member_number = _next_member_number(conn)
        conn.execute(
            "INSERT INTO members (member_number, full_name, national_id, birthdate, gender, "
            "address, phone, email, membership_type, join_date, annual_fee) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (member_number, full_name, national_id or None, birthdate or None, gender or None,
             address, phone, email, membership_type, join_date, annual_fee)
        )
        conn.commit()
        conn.close()

        log_activity(session['user_id'], 'MEMBER_CREATE',
                     f'Member {member_number} ({full_name}) created')
        flash(t('member_added'), 'success')
        return redirect(url_for('members.index'))

    return render_template('members/form.html', form=None)


@members_bp.route('/fees', methods=['GET', 'POST'])
@login_required
def fees():
    """تسجيل اشتراك سنوي لعضو + عرض سجل اشتراكات العضو المحدد"""
    conn = get_db()
    members_list = conn.execute(
        "SELECT id, member_number, full_name FROM members WHERE is_active = 1 "
        "ORDER BY full_name"
    ).fetchall()
    selected_member_id = None

    if request.method == 'POST':
        try:
            member_id = int(request.form.get('member_id', 0))
            year = int(request.form.get('year', 0))
            amount = float(request.form.get('amount', 0) or 0)
        except ValueError:
            member_id, year, amount = 0, 0, 0
        payment_date = request.form.get('payment_date', '')
        payment_method = request.form.get('payment_method', '')
        receipt_number = request.form.get('receipt_number', '').strip()
        notes = request.form.get('notes', '').strip()

        if member_id <= 0 or year <= 0 or amount <= 0 or not payment_date:
            flash(t('fill_required_fields'), 'error')
        else:
            conn.execute(
                "INSERT INTO membership_fees (member_id, year, amount, payment_date, "
                "payment_method, receipt_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (member_id, year, amount, payment_date, payment_method, receipt_number, notes)
            )
            # تحديث حالة الاشتراك إذا كانت السنة المسددة هي السنة الحالية
            if year == date.today().year:
                conn.execute(
                    "UPDATE members SET fee_status = 'paid' WHERE id = ?", (member_id,)
                )
            conn.commit()
            conn.close()

            log_activity(session['user_id'], 'FEE_RECORD',
                         f'Fee {amount} for year {year} recorded for member #{member_id}')
            flash(t('fee_recorded'), 'success')
            return redirect(url_for('members.fees', member_id=member_id))

        selected_member_id = member_id
    else:
        selected_member_id = request.args.get('member_id', type=int)

    # سجل الاشتراكات للعضو المحدد
    selected_member = None
    fees_list = []
    if selected_member_id:
        selected_member = conn.execute(
            "SELECT * FROM members WHERE id = ?", (selected_member_id,)
        ).fetchone()
        fees_list = conn.execute(
            "SELECT * FROM membership_fees WHERE member_id = ? "
            "ORDER BY year DESC, id DESC",
            (selected_member_id,)
        ).fetchall()
    conn.close()

    return render_template(
        'members/fees.html',
        members=members_list,
        fees=fees_list,
        selected_member_id=selected_member_id or 0,
        selected_member=selected_member,
        current_year=date.today().year,
        today=date.today().isoformat(),
    )

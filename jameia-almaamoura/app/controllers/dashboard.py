# -*- coding: utf-8 -*-
# لوحة التحكم الرئيسية — ملخص المؤشرات المالية والإدارية + الرسوم البيانية + التنبيهات
from calendar import month_abbr
from datetime import date, datetime

from flask import Blueprint, render_template

from app.helpers.auth import get_db, login_required
from app.helpers.i18n import t

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/')
@login_required
def index():
    """الصفحة الرئيسية: إحصائيات + رسوم بيانية + آخر القيود + تنبيهات الوثائق القانونية"""
    conn = get_db()
    today = date.today()
    this_month = today.strftime('%Y-%m')

    # ---- المؤشرات الأساسية ----
    total_members = conn.execute(
        "SELECT COUNT(*) FROM members WHERE is_active = 1"
    ).fetchone()[0]

    total_balance = conn.execute(
        "SELECT COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) "
        "FROM journal_entry_lines jel "
        "JOIN chart_of_accounts c ON jel.account_id = c.id "
        "WHERE c.account_type = 'asset'"
    ).fetchone()[0]

    monthly_donations = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM donations "
        "WHERE strftime('%Y-%m', donation_date) = ?",
        (this_month,)
    ).fetchone()[0]

    active_projects = conn.execute(
        "SELECT COUNT(*) FROM projects WHERE status = 'active'"
    ).fetchone()[0]

    beneficiaries_count = conn.execute(
        "SELECT COUNT(*) FROM beneficiaries WHERE is_active = 1"
    ).fetchone()[0]

    monthly_expenses = conn.execute(
        "SELECT COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) "
        "FROM journal_entry_lines jel "
        "JOIN journal_entries je ON jel.journal_entry_id = je.id "
        "JOIN chart_of_accounts c ON jel.account_id = c.id "
        "WHERE c.account_type = 'expense' AND strftime('%Y-%m', je.entry_date) = ?",
        (this_month,)
    ).fetchone()[0]

    # ---- رصيد الزكاة: المحصل (حساب 4020) مطروحاً منه الموزع ----
    zakat_received = conn.execute(
        "SELECT COALESCE(SUM(jel.credit_amount - jel.debit_amount), 0) "
        "FROM journal_entry_lines jel "
        "JOIN chart_of_accounts c ON jel.account_id = c.id "
        "WHERE c.account_code = '4020'"
    ).fetchone()[0]
    zakat_distributed = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM zakat_distributions"
    ).fetchone()[0]
    zakat_balance = zakat_received - zakat_distributed

    # ---- آخر 10 قيود يومية ----
    recent_transactions = conn.execute(
        "SELECT entry_number, entry_date, description, total_debit, status "
        "FROM journal_entries "
        "ORDER BY entry_date DESC, id DESC LIMIT 10"
    ).fetchall()

    # ---- وثائق قانونية تنتهي خلال 90 يوماً (تشمل المنتهية للتنبيه) ----
    expiring_rows = conn.execute(
        "SELECT id, doc_type, doc_number, expiry_date FROM legal_documents "
        "WHERE expiry_date IS NOT NULL AND expiry_date <= date('now', '+90 days') "
        "ORDER BY expiry_date ASC LIMIT 10"
    ).fetchall()
    alerts = []
    for doc in expiring_rows:
        expiry = datetime.strptime(doc['expiry_date'], '%Y-%m-%d').date()
        alerts.append({
            'doc_type': doc['doc_type'],
            'doc_number': doc['doc_number'],
            'expiry_date': doc['expiry_date'],
            'days_left': (expiry - today).days,
        })

    # ---- الإيرادات والمصروفات لآخر 6 أشهر (خط زمني) ----
    chart_months, chart_revenue, chart_expenses = [], [], []
    for offset in range(5, -1, -1):
        month = today.month - offset
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        month_key = f'{year:04d}-{month:02d}'
        chart_months.append(f'{month_abbr[month]} {year}')

        revenue = conn.execute(
            "SELECT COALESCE(SUM(jel.credit_amount - jel.debit_amount), 0) "
            "FROM journal_entry_lines jel "
            "JOIN journal_entries je ON jel.journal_entry_id = je.id "
            "JOIN chart_of_accounts c ON jel.account_id = c.id "
            "WHERE c.account_type = 'revenue' AND strftime('%Y-%m', je.entry_date) = ?",
            (month_key,)
        ).fetchone()[0]
        expenses = conn.execute(
            "SELECT COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) "
            "FROM journal_entry_lines jel "
            "JOIN journal_entries je ON jel.journal_entry_id = je.id "
            "JOIN chart_of_accounts c ON jel.account_id = c.id "
            "WHERE c.account_type = 'expense' AND strftime('%Y-%m', je.entry_date) = ?",
            (month_key,)
        ).fetchone()[0]
        chart_revenue.append(round(revenue, 2))
        chart_expenses.append(round(expenses, 2))

    # ---- التبرعات حسب النوع (رسم دائري) ----
    donation_rows = conn.execute(
        "SELECT donation_type, COALESCE(SUM(amount), 0) AS total "
        "FROM donations GROUP BY donation_type"
    ).fetchall()
    donations_by_type = [
        {'label': t('type_' + row['donation_type']), 'value': round(row['total'], 2)}
        for row in donation_rows
    ]

    # ---- المشاريع حسب الحالة (رسم أعمدة) ----
    project_rows = conn.execute(
        "SELECT status, COUNT(*) AS cnt FROM projects GROUP BY status"
    ).fetchall()
    projects_by_status = [
        {'label': t('status_' + row['status']), 'value': row['cnt']}
        for row in project_rows
    ]

    conn.close()
    return render_template(
        'dashboard.html',
        total_members=total_members,
        total_balance=total_balance,
        monthly_donations=monthly_donations,
        active_projects=active_projects,
        beneficiaries_count=beneficiaries_count,
        monthly_expenses=monthly_expenses,
        zakat_balance=zakat_balance,
        recent_transactions=recent_transactions,
        alerts=alerts,
        chart_months=chart_months,
        chart_revenue=chart_revenue,
        chart_expenses=chart_expenses,
        donations_by_type=donations_by_type,
        projects_by_status=projects_by_status,
    )

# -*- coding: utf-8 -*-
# وحدة المالية — قيود يومية، دليل حسابات، ميزان مراجعة، ميزانية عمومية، قائمة دخل
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.helpers.auth import login_required, role_required, get_db, log_activity
from app.helpers.i18n import t
from datetime import date, datetime

finance_bp = Blueprint('finance', __name__)


@finance_bp.route('/')
@login_required
@role_required(['admin', 'accountant'])
def dashboard():
    """لوحة المالية: ملخص الأصول والإيرادات والمصروفات وآخر القيود"""
    conn = get_db()
    stats = {
        'total_assets': conn.execute("SELECT COALESCE(SUM(debit_amount - credit_amount), 0) FROM journal_entry_lines jel JOIN chart_of_accounts c ON jel.account_id = c.id WHERE c.account_type = 'asset'").fetchone()[0],
        'total_revenue': conn.execute("SELECT COALESCE(SUM(credit_amount - debit_amount), 0) FROM journal_entry_lines jel JOIN chart_of_accounts c ON jel.account_id = c.id WHERE c.account_type = 'revenue'").fetchone()[0],
        'total_expenses': conn.execute("SELECT COALESCE(SUM(debit_amount - credit_amount), 0) FROM journal_entry_lines jel JOIN chart_of_accounts c ON jel.account_id = c.id WHERE c.account_type = 'expense'").fetchone()[0],
        'pending_entries': conn.execute("SELECT COUNT(*) FROM journal_entries WHERE status = 'pending'").fetchone()[0]
    }
    recent = conn.execute('''
        SELECT je.*, u.full_name as created_by_name
        FROM journal_entries je
        LEFT JOIN users u ON je.created_by = u.id
        ORDER BY je.entry_date DESC, je.id DESC LIMIT 10
    ''').fetchall()
    conn.close()
    return render_template('finance/dashboard.html', stats=stats, recent=recent)


@finance_bp.route('/chart-of-accounts')
@login_required
@role_required(['admin', 'accountant'])
def chart_of_accounts():
    """دليل الحسابات مع عرض الحساب الأب"""
    conn = get_db()
    accounts = conn.execute('''
        SELECT c.*, p.account_name as parent_name
        FROM chart_of_accounts c
        LEFT JOIN chart_of_accounts p ON c.parent_id = p.id
        ORDER BY c.account_code
    ''').fetchall()
    conn.close()
    return render_template('finance/chart_of_accounts.html', accounts=accounts)


@finance_bp.route('/journal-entry/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'accountant'])
def new_journal_entry():
    """إنشاء قيد يومي متوازن (المدين = الدائن)"""
    conn = get_db()
    if request.method == 'POST':
        entry_date = request.form.get('entry_date')
        description = request.form.get('description')
        accounts = request.form.getlist('account_id')
        debits = request.form.getlist('debit')
        credits = request.form.getlist('credit')

        total_debit = sum(float(d or 0) for d in debits)
        total_credit = sum(float(c or 0) for c in credits)

        if abs(total_debit - total_credit) > 0.01 or total_debit <= 0:
            flash(t('entry_unbalanced'), 'error')
            conn.close()
            return redirect(request.url)

        last = conn.execute("SELECT entry_number FROM journal_entries ORDER BY id DESC LIMIT 1").fetchone()
        n = (int(last['entry_number'].split('-')[-1]) + 1) if last else 1
        entry_number = f"JE-{datetime.now().strftime('%Y%m%d')}-{n:04d}"

        conn.execute('''
            INSERT INTO journal_entries (entry_number, entry_date, description, created_by, total_debit, total_credit, status)
            VALUES (?, ?, ?, ?, ?, ?, 'approved')
        ''', (entry_number, entry_date, description, session['user_id'], total_debit, total_credit))

        entry_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

        for acc_id, d, c in zip(accounts, debits, credits):
            if acc_id and (float(d or 0) > 0 or float(c or 0) > 0):
                conn.execute('''
                    INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount)
                    VALUES (?, ?, ?, ?)
                ''', (entry_id, acc_id, float(d or 0), float(c or 0)))

        conn.commit()
        log_activity(session['user_id'], 'JOURNAL_ENTRY', f'Created {entry_number}')
        flash(t('entry_created'), 'success')
        conn.close()
        return redirect(url_for('finance.dashboard'))

    # [FIX] حسابات كـ dicts لأن القالب يستخدم tojson (Row غير قابل للتسلسل)
    accounts = [dict(r) for r in conn.execute('SELECT * FROM chart_of_accounts WHERE is_active = 1 ORDER BY account_code').fetchall()]
    conn.close()
    return render_template('finance/journal_entry.html', accounts=accounts, today=date.today().isoformat())


@finance_bp.route('/trial-balance')
@login_required
@role_required(['admin', 'accountant'])
def trial_balance():
    """ميزان المراجعة خلال فترة زمنية (من/إلى)"""
    conn = get_db()
    from_date = request.args.get('from', '2026-01-01')
    to_date = request.args.get('to', datetime.now().strftime('%Y-%m-%d'))
    balances = conn.execute('''
        SELECT c.id, c.account_code, c.account_name, c.account_type,
               COALESCE(SUM(jel.debit_amount), 0) as total_debit,
               COALESCE(SUM(jel.credit_amount), 0) as total_credit
        FROM chart_of_accounts c
        LEFT JOIN journal_entry_lines jel ON c.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE je.entry_date BETWEEN ? AND ? AND je.status = 'approved'
        GROUP BY c.id
        HAVING total_debit > 0 OR total_credit > 0
        ORDER BY c.account_code
    ''', (from_date, to_date)).fetchall()
    conn.close()
    return render_template('finance/trial_balance.html', balances=balances, from_date=from_date, to_date=to_date)


@finance_bp.route('/balance-sheet')
@login_required
@role_required(['admin', 'accountant'])
def balance_sheet():
    """الميزانية العمومية: أصول / خصوم / حقوق ملكية"""
    conn = get_db()
    data = conn.execute('''
        SELECT c.account_type,
               COALESCE(SUM(CASE WHEN c.account_type IN ('asset','expense') THEN jel.debit_amount - jel.credit_amount
                                 ELSE jel.credit_amount - jel.debit_amount END), 0) as balance
        FROM chart_of_accounts c
        LEFT JOIN journal_entry_lines jel ON c.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE je.status = 'approved'
        GROUP BY c.account_type
    ''').fetchall()
    conn.close()
    balances = {row['account_type']: row['balance'] for row in data}
    return render_template('finance/balance_sheet.html', balances=balances)


@finance_bp.route('/income-statement')
@login_required
@role_required(['admin', 'accountant'])
def income_statement():
    """قائمة الدخل: الإيرادات والمصروفات وصافي الدخل"""
    conn = get_db()
    from_date = request.args.get('from', '2026-01-01')
    to_date = request.args.get('to', datetime.now().strftime('%Y-%m-%d'))
    revenue = conn.execute('''
        SELECT c.account_name, COALESCE(SUM(jel.credit_amount - jel.debit_amount), 0) as amount
        FROM chart_of_accounts c
        LEFT JOIN journal_entry_lines jel ON c.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE c.account_type = 'revenue' AND je.entry_date BETWEEN ? AND ? AND je.status = 'approved'
        GROUP BY c.id
    ''', (from_date, to_date)).fetchall()
    expenses = conn.execute('''
        SELECT c.account_name, COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) as amount
        FROM chart_of_accounts c
        LEFT JOIN journal_entry_lines jel ON c.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE c.account_type = 'expense' AND je.entry_date BETWEEN ? AND ? AND je.status = 'approved'
        GROUP BY c.id
    ''', (from_date, to_date)).fetchall()
    conn.close()
    total_revenue = sum(r['amount'] for r in revenue)
    total_expenses = sum(e['amount'] for e in expenses)
    return render_template('finance/income_statement.html',
                          revenue=revenue, expenses=expenses,
                          total_revenue=total_revenue, total_expenses=total_expenses,
                          net_income=total_revenue - total_expenses,
                          from_date=from_date, to_date=to_date)

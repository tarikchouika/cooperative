# -*- coding: utf-8 -*-
# وحدة التقارير: تقارير مالية، تبرعات، مستفيدون + تصدير PDF / Excel
import os
from flask import Blueprint, render_template, request, send_file, flash, redirect, url_for
from app.helpers.auth import login_required, role_required, get_db
from app.helpers.i18n import t, get_current_lang
from datetime import datetime
import io

reports_bp = Blueprint('reports', __name__)

# [FIX] اختيار خطوط PDF بحسب ما توفره بيئة reportlab:
# بعض البنيات (مثل هذه) لا تتضمن بيانات خطوط Helvetica القياسية.
# نُسجّل خطوط Vera المرفقة مع reportlab كبديل، ونعود إلى Helvetica إن توفرت.
try:
    import reportlab
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfbase.pdfmetrics import getRegisteredFontNames
    _RL_FONTS = os.path.join(os.path.dirname(reportlab.__file__), 'fonts')
    if 'Helvetica' in getRegisteredFontNames():
        FONT_BOLD, FONT_NORMAL, FONT_ITALIC = 'Helvetica-Bold', 'Helvetica', 'Helvetica-Italic'
    else:
        pdfmetrics.registerFont(TTFont('Vera', os.path.join(_RL_FONTS, 'Vera.ttf')))
        pdfmetrics.registerFont(TTFont('VeraBd', os.path.join(_RL_FONTS, 'VeraBd.ttf')))
        pdfmetrics.registerFont(TTFont('VeraIt', os.path.join(_RL_FONTS, 'VeraIt.ttf')))
        pdfmetrics.registerFont(TTFont('VeraBI', os.path.join(_RL_FONTS, 'VeraBI.ttf')))
        FONT_BOLD, FONT_NORMAL, FONT_ITALIC = 'VeraBd', 'Vera', 'VeraIt'
except Exception:
    FONT_BOLD, FONT_NORMAL, FONT_ITALIC = 'Helvetica-Bold', 'Helvetica', 'Helvetica-Italic'


@reports_bp.route('/')
@login_required
def index():
    return render_template('reports/index.html')


@reports_bp.route('/financial')
@login_required
@role_required(['admin', 'accountant'])
def financial():
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
    expense = conn.execute('''
        SELECT c.account_name, COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) as amount
        FROM chart_of_accounts c
        LEFT JOIN journal_entry_lines jel ON c.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE c.account_type = 'expense' AND je.entry_date BETWEEN ? AND ? AND je.status = 'approved'
        GROUP BY c.id
    ''', (from_date, to_date)).fetchall()
    # إجماليات الإيرادات والمصروفات لعرضها أسفل الجدولين
    revenue_total = sum(r['amount'] for r in revenue)
    expense_total = sum(r['amount'] for r in expense)
    conn.close()
    return render_template('reports/financial.html', revenue=revenue, expense=expense,
                          revenue_total=revenue_total, expense_total=expense_total,
                          from_date=from_date, to_date=to_date)


@reports_bp.route('/donations')
@login_required
def donations_report():
    conn = get_db()
    from_date = request.args.get('from', '2026-01-01')
    to_date = request.args.get('to', datetime.now().strftime('%Y-%m-%d'))
    by_type = conn.execute('''
        SELECT donation_type, COUNT(*) as count, SUM(amount) as total
        FROM donations WHERE donation_date BETWEEN ? AND ?
        GROUP BY donation_type
    ''', (from_date, to_date)).fetchall()
    top_donors = conn.execute('''
        SELECT COALESCE(d.full_name, d.company_name, 'Anonymous') as name,
               COUNT(do.id) as count, SUM(do.amount) as total
        FROM donations do
        LEFT JOIN donors d ON do.donor_id = d.id
        WHERE do.donation_date BETWEEN ? AND ?
        GROUP BY do.donor_id
        ORDER BY total DESC LIMIT 10
    ''', (from_date, to_date)).fetchall()
    conn.close()
    return render_template('reports/donations.html', by_type=by_type, top_donors=top_donors,
                          from_date=from_date, to_date=to_date)


@reports_bp.route('/beneficiaries')
@login_required
@role_required(['admin', 'project_manager'])
def beneficiaries_report():
    conn = get_db()
    stats = {
        'by_region': conn.execute('''
            SELECT address, COUNT(*) as count FROM beneficiaries
            WHERE is_active = 1 GROUP BY address ORDER BY count DESC
        ''').fetchall(),
        'by_need': conn.execute('''
            SELECT needs_description, COUNT(*) as count FROM beneficiaries
            WHERE is_active = 1 GROUP BY needs_description ORDER BY count DESC
        ''').fetchall()
    }
    conn.close()
    return render_template('reports/beneficiaries.html', stats=stats)


@reports_bp.route('/export/pdf/<report_type>')
@login_required
def export_pdf(report_type):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import cm
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        p.setFont(FONT_BOLD, 18)
        p.drawString(2*cm, height - 2*cm, "Al Maamoura Association")
        p.setFont(FONT_NORMAL, 12)
        p.drawString(2*cm, height - 2.8*cm, f"Report: {report_type} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        p.line(2*cm, height - 3.2*cm, width - 2*cm, height - 3.2*cm)
        p.setFont(FONT_NORMAL, 11)
        p.drawString(2*cm, height - 5*cm, f"[{report_type.title()} Report Content]")
        p.setFont(FONT_ITALIC, 9)
        p.drawString(2*cm, 1.5*cm, "Confidential - Al Maamoura Association for Development and Solidarity")
        p.showPage()
        p.save()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f'{report_type}_{datetime.now().strftime("%Y%m%d")}.pdf', mimetype='application/pdf')
    except Exception as e:
        flash(f'Error generating PDF: {str(e)}', 'error')
        return redirect(request.referrer or url_for('reports.index'))


@reports_bp.route('/export/excel/<report_type>')
@login_required
def export_excel(report_type):
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill
        wb = Workbook()
        ws = wb.active
        ws.title = report_type.title()
        header_fill = PatternFill(start_color="1B5E20", end_color="1B5E20", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        ws['A1'] = "Al Maamoura Association"
        ws['A1'].font = Font(bold=True, size=16, color="1B5E20")
        ws['A2'] = f"Report: {report_type} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True,
                        download_name=f'{report_type}_{datetime.now().strftime("%Y%m%d")}.xlsx',
                        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        flash(f'Error generating Excel: {str(e)}', 'error')
        return redirect(request.referrer or url_for('reports.index'))

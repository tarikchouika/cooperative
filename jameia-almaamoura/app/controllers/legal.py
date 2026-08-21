# -*- coding: utf-8 -*-
# الوحدة القانونية: الوثائق القانونية، العقود، الاجتماعات
# يتحكم بها مسؤول النظام وأمين السر فقط
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.helpers.auth import login_required, role_required, get_db, log_activity
from app.helpers.i18n import t
from datetime import datetime

legal_bp = Blueprint('legal', __name__)


@legal_bp.route('/')
@login_required
@role_required(['admin', 'secretary'])
def index():
    conn = get_db()
    documents = conn.execute('SELECT * FROM legal_documents ORDER BY expiry_date').fetchall()
    contracts = conn.execute('SELECT * FROM contracts ORDER BY end_date').fetchall()

    today = datetime.now().date()
    alerts = []
    docs_ctx = []
    for doc in documents:
        # حساب الأيام المتبقية حتى انتهاء صلاحية كل وثيقة
        days_left = None
        if doc['expiry_date']:
            expiry = datetime.strptime(doc['expiry_date'], '%Y-%m-%d').date()
            days_left = (expiry - today).days
            if days_left < 0:
                alerts.append({'type': 'expired', 'doc': doc, 'days': days_left})
            elif days_left <= 30:
                alerts.append({'type': 'critical', 'doc': doc, 'days': days_left})
            elif days_left <= 90:
                alerts.append({'type': 'warning', 'doc': doc, 'days': days_left})
        d = dict(zip(doc.keys(), doc))
        d['days_left'] = days_left
        docs_ctx.append(d)

    conn.close()
    return render_template('legal/index.html', documents=docs_ctx, contracts=contracts, alerts=alerts)


@legal_bp.route('/documents/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'secretary'])
def new_document():
    conn = get_db()
    if request.method == 'POST':
        conn.execute('''
            INSERT INTO legal_documents (doc_type, doc_number, issue_date, expiry_date, issuing_authority, reminder_days, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (request.form.get('doc_type'), request.form.get('doc_number'),
              request.form.get('issue_date'), request.form.get('expiry_date'),
              request.form.get('issuing_authority'), request.form.get('reminder_days'),
              request.form.get('notes')))
        conn.commit()
        log_activity(session['user_id'], 'LEGAL_DOC', f'Added {request.form.get("doc_number")}')
        flash(t('document_added'), 'success')
        conn.close()
        return redirect(url_for('legal.index'))
    conn.close()
    return render_template('legal/document_form.html')


@legal_bp.route('/meetings')
@login_required
@role_required(['admin', 'secretary'])
def meetings():
    conn = get_db()
    meetings = conn.execute('SELECT * FROM meetings ORDER BY meeting_date DESC').fetchall()
    conn.close()
    return render_template('legal/meetings.html', meetings=meetings)


@legal_bp.route('/meetings/new', methods=['GET', 'POST'])
@login_required
@role_required(['admin', 'secretary'])
def new_meeting():
    conn = get_db()
    if request.method == 'POST':
        conn.execute('''
            INSERT INTO meetings (meeting_type, meeting_date, location, agenda, minutes_text, attendees_count, decisions, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (request.form.get('meeting_type'), request.form.get('meeting_date'),
              request.form.get('location'), request.form.get('agenda'),
              request.form.get('minutes_text'), request.form.get('attendees_count'),
              request.form.get('decisions'), session['user_id']))
        conn.commit()
        log_activity(session['user_id'], 'MEETING', f'Meeting on {request.form.get("meeting_date")}')
        flash(t('meeting_recorded'), 'success')
        conn.close()
        return redirect(url_for('legal.meetings'))
    conn.close()
    return render_template('legal/meeting_form.html')

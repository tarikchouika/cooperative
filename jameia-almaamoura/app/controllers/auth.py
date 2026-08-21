from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from app.helpers.auth import get_db, check_password, hash_password, log_activity
from app.helpers.i18n import t, get_current_lang

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,)).fetchone()
        conn.close()

        if user and check_password(password, user['password_hash']):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            session['role'] = user['role']
            log_activity(user['id'], 'LOGIN', f'User {username} logged in')
            return redirect(url_for('dashboard.index'))
        else:
            flash(t('invalid_credentials'), 'error')

    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    if 'user_id' in session:
        log_activity(session['user_id'], 'LOGOUT', f'User {session["username"]} logged out')
    session.clear()
    return redirect(url_for('auth.login'))

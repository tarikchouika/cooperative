from functools import wraps
from flask import session, redirect, url_for, flash, request
import bcrypt
import sqlite3
from config import Config

def get_db():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")  # [FIX] ensure FK enforcement
    return conn

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated

def role_required(roles):
    """Decorator to restrict access by role"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('auth.login'))
            if session.get('role') not in roles:
                flash('Access denied', 'error')
                return redirect(url_for('dashboard.index'))
            return f(*args, **kwargs)
        return decorated
    return decorator

def log_activity(user_id, action, details=''):
    """Audit log for security"""
    conn = get_db()
    conn.execute(
        'INSERT INTO audit_log (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        (user_id, action, details, request.remote_addr)
    )
    conn.commit()
    conn.close()

# Role permissions mapping
ROLE_PERMISSIONS = {
    'admin': ['all'],
    'accountant': ['finance', 'donations', 'reports', 'members_view'],
    'secretary': ['members', 'legal', 'meetings', 'reports_view'],
    'project_manager': ['projects', 'beneficiaries', 'reports_view'],
    'staff': ['view_only']
}

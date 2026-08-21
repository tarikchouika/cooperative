#!/usr/bin/env python3
"""
سكربت التثبيت لنظام إدارة جمعية المعمورة للتنمية والتكافل
"""
import os
import sys
import sqlite3
import bcrypt

# [FIX] جعل المسارات مستقلة عن مجلد العمل الحالي (CWD)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from config import Config


def check_requirements():
    """فحص متطلبات النظام"""
    print("🔍 Checking requirements...")
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    try:
        import flask, bcrypt
        print("✅ Core packages installed (flask, bcrypt)")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("   Run: pip install -r requirements.txt")
        return False
    # الحزم الاختيارية: تحذير فقط ولا توقف التثبيت
    for mod in ('reportlab', 'openpyxl'):
        try:
            __import__(mod)
        except ImportError:
            print(f"⚠️  Optional package {mod} not installed (reports export disabled)")
    return True


def create_directories():
    """إنشاء المجلدات المطلوبة"""
    print("📁 Creating directories...")
    dirs = ['database', 'uploads', 'reports', 'static/css', 'static/js', 'static/images', 'locales', 'backups']
    for d in dirs:
        os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)
    print("✅ Directories created")


def setup_database():
    """تهيئة قاعدة البيانات من schema.sql"""
    print("🗄️  Setting up database...")
    db_path = Config.DATABASE
    if os.path.exists(db_path):
        print("ℹ️  Database already exists, skipping schema creation")
        return
    conn = sqlite3.connect(db_path)
    with open(os.path.join(BASE_DIR, 'database', 'schema.sql'), 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    # إنشاء حساب المدير الافتراضي (admin) بكلمة مرور مشفرة
    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn.execute('''
        INSERT INTO users (username, password_hash, full_name, role, email, is_active)
        VALUES ('admin', ?, 'System Administrator', 'admin', 'admin@almaamoura.org', 1)
    ''', (admin_password,))
    conn.commit()
    conn.close()
    print("✅ Database initialized")
    print("📝 Default admin credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")


def main():
    print("=" * 60)
    print("🏛️  Al Maamoura Association - Installation")
    print("=" * 60)
    if not check_requirements():
        sys.exit(1)
    create_directories()
    setup_database()
    print("\n" + "=" * 60)
    print("✅ Installation complete!")
    print("=" * 60)
    print("\n🚀 To start the application:")
    print("   python run.py")
    print("\n🌐 Then open: http://localhost:5000")
    print("=" * 60)


if __name__ == '__main__':
    main()

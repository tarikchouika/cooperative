#!/usr/bin/env python3
"""سكربت النسخ الاحتياطي التلقائي"""
import os
import sys
import zipfile
from datetime import datetime

# [FIX] جعل المسارات مستقلة عن مجلد العمل الحالي (CWD)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from config import Config


def create_backup():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = os.path.join(BASE_DIR, 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, f'backup_{timestamp}.zip')
    with zipfile.ZipFile(backup_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        if os.path.exists(Config.DATABASE):
            zipf.write(Config.DATABASE, 'database/jameia.db')
        if os.path.exists(Config.UPLOAD_FOLDER):
            for root, _, files in os.walk(Config.UPLOAD_FOLDER):
                for file in files:
                    path = os.path.join(root, file)
                    zipf.write(path, os.path.relpath(path, BASE_DIR))
    print(f"✅ Backup created: {backup_file}")
    # الاحتفاظ بآخر 30 نسخة فقط
    backups = sorted([f for f in os.listdir(backup_dir) if f.endswith('.zip')])
    if len(backups) > 30:
        for old in backups[:-30]:
            os.remove(os.path.join(backup_dir, old))
            print(f"🗑️  Removed old backup: {old}")


if __name__ == '__main__':
    create_backup()

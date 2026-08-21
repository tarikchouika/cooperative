# 🏛️ نظام إدارة جمعية المعمورة للتنمية والتكافل
## Al Maamoura Association Management System

نظام متكامل لإدارة الجمعيات الخيرية يدعم **ثلاث لغات** (English, العربية, Français) مع واجهة احترافية وقاعدة بيانات شاملة.

### ✨ المميزات
- 🌐 **ثلاث لغات**: الإنجليزية (افتراضي)، العربية (RTL)، الفرنسية
- 💰 **محاسبة متكاملة**: القيد المزدوج، دليل الحسابات، ميزان المراجعة، الميزانية، قائمة الدخل
- 💝 **إدارة التبرعات والزكاة**: 8 مصارف شرعية، إيصالات مرقمة، حملات
- 👥 **إدارة المستفيدين**: منع الازدواجية، متابعة الحالات
- 📊 **تقارير احترافية**: PDF و Excel
- 🔒 **أمان متقدم**: صلاحيات، سجل عمليات، تشفير
- 📱 **متجاوب**: يعمل على جميع الأجهزة

### 🚀 التثبيت
```bash
cd jameia-almaamoura
pip install -r requirements.txt
python install.py
python run.py
```

### 🔐 بيانات الدخول الافتراضية
- **الرابط**: http://localhost:5000
- **المستخدم**: `admin`
- **كلمة المرور**: `admin123`
- ⚠️ **غيّر كلمة المرور فوراً بعد أول دخول!**

### 📁 هيكل المشروع
```
jameia-almaamoura/
├── app/                    # Backend (Flask)
│   ├── controllers/        # Business logic
│   ├── helpers/            # Auth, i18n
│   └── templates/          # HTML views
├── static/                 # CSS, JS, images
├── locales/                # Translation files (en, ar, fr)
├── database/               # SQLite database
├── uploads/                # User uploads
├── reports/                # Generated reports
├── config.py               # Configuration
├── install.py              # Installation script
├── run.py                  # Start server
├── backup.py               # Backup script
└── requirements.txt        # Python dependencies
```

### 🎨 الأدوار والصلاحيات
| الدور | الصلاحيات |
|------|----------|
| **المدير العام** (admin) | كل شيء |
| **المحاسب** (accountant) | المالية، التبرعات، التقارير |
| **أمين السر** (secretary) | الأعضاء، القانوني، الاجتماعات |
| **مشرف المشاريع** (project_manager) | المشاريع، المستفيدين |
| **موظف** (staff) | عرض فقط |

### 💾 النسخ الاحتياطي
```bash
python backup.py
```
يتم حفظ النسخ في مجلد `backups/` مع الاحتفاظ بآخر 30 نسخة.

### 📞 الدعم
للمساعدة: admin@almaamoura.org

**© 2026 جمعية المعمورة للتنمية والتكافل - جميع الحقوق محفوظة**

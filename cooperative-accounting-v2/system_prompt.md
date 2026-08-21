# نظام المحاسبة الشامل للتعاونيات - متطلبات التصميم

## الرؤية
نظام محاسبي متكامل احترافي لجمعيات التعاونية في المغرب العربي، بواجهة عربية حديثة وتصميم عصري (Dashboard-first) يشبه تطبيقات مثل Zoho / ERPNext.

## الواجهة (UI/UX)
- **تصميم Dashboard-first** مع sidebar ثابت وقائمة تنقل
- **ألوان احترافية:** درجات الأزرق الداكن مع accent colors
- **RTL كامل** مع خطوط عربية حديثة (IBM Plex Sans Arabic أو Cairo)
- **Responsive** يعمل على الموبايل والتابلت والديسكتوب
- **Dark mode support**
- **Framer Motion** للحركات السلسة
- **Recharts** للرسوم البيانية التفاعلية

## الوحدات الأساسية

### 1. لوحة التحكم (Dashboard)
- إحصائيات سريعة: إجمالي الأعضاء، رصيد الجمعية، عدد المعاملات الشهرية
- رسم بياني للمعاملات (إيداع/سحب/تحويل) خلال آخر 12 شهر
- أ recent transactions list
- Quick actions panel

### 2. إدارة الأعضاء (Members Management)
- قائمة الأعضاء مع بحث وفلتر وفرز
- إضافة عضو: اسم، هاتف، بريد، تاريخ الانضمام، صورة، حالة النشاط
- تعديل وحذف مع تأكيد
- ملف شخصي لكل عضو يعرض معاملاته
- استيراد/تصدير CSV

### 3. المعاملات المالية (Transactions)
- تسجيل: إيداع (إدخال)، سحب (إخراج)، تحويل بين أعضاء
- حقل المبلغ، التاريخ، الوصف، المرفق
- **سجل المعاملات** مع فلتر بالتاريخ والنوع والعضو
- إجماليات تلقائية (إيداعات، سحوبات، تحويلات، صافي)

### 4. صندوق الجمعية (Treasury/Fund)
- رصيد الصندوق الحالي
- حركات الصندوق اليومية
- ميزان ميزاني (Balance Sheet) بسيط

### 5. التقارير (Reports)
- تقرير شهري تفصيلي
- كشف حساب عضو محدد
- تقرير سنوي
- تصدير PDF / Excel

### 6. الإعدادات (Settings)
- معلومات الجمعية (اسم، شعار، عنوان)
- عملة الجمعية (ر.س / درهم / دينار)
- إدارة المستخدمين والأدوار

## المتطلبات التقنية
- **React 18+** with **Next.js 14 (App Router)**
- **TypeScript** strict mode
- **Tailwind CSS 3** + **shadcn/ui** components
- **Prisma** ORM + **SQLite** (قابل للتحويل لـ PostgreSQL)
- **Zustand** لإدارة الحالة
- **React Hook Form** + **Zod** للنماذج
- **date-fns** للتواريخ
- **next-intl** للدعم متعدد اللغات (عربي/فرنسية)
- **next-themes** للوضع الليلي

## هيكل المجلدات المطلوب
```
src/
├── app/
│   ├── layout.tsx           # Layout رئيسي مع sidebar
│   ├── page.tsx             # Dashboard
│   ├── (dashboard)/
│   │   ├── members/
│   │   │   ├── page.tsx     # قائمة الأعضاء
│   │   │   └── [id]/page.tsx # ملف العضو
│   │   ├── transactions/
│   │   │   └── page.tsx     # المعاملات
│   │   ├── treasury/
│   │   │   └── page.tsx     # الصندوق
│   │   ├── reports/
│   │   │   └── page.tsx     # التقارير
│   │   └── settings/
│   │       └── page.tsx     # الإعدادات
│   └── api/
│       ├── members/
│       ├── transactions/
│       ├── treasury/
│       └── reports/
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── TransactionChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── members/
│   │   ├── MemberList.tsx
│   │   ├── MemberForm.tsx
│   │   └── MemberProfile.tsx
│   └── transactions/
│       ├── TransactionForm.tsx
│       └── TransactionList.tsx
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   └── useDebounce.ts
├── store/
│   └── useStore.ts
└── types/
    └── index.ts
```

## ملاحظات هامة
- يجب أن يكون الكود **جاهز للتشغيل مباشرة** بدون تعديلات
- يجب أن يعمل على Vercel مع SQLite
- التصميم يجب أن يكون **احترافي** يشبه تطبيقات SaaS الحديثة
- يجب أن تدعم جميع الوظائف CRUD بشكل كامل

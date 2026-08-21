-- ==========================================
-- جمعية المعمورة للتنمية والتكافل
-- Database Schema (SQLite-compatible)
-- ==========================================

-- 1. المستخدمين
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK(role IN ('admin','accountant','secretary','project_manager','staff')) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- 2. دليل الحسابات المحاسبي (created before FKs reference it)
CREATE TABLE chart_of_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) CHECK(account_type IN ('asset','liability','equity','revenue','expense')) NOT NULL,
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    description TEXT,
    FOREIGN KEY (parent_id) REFERENCES chart_of_accounts(id)
);

-- 3. المتبرعين
CREATE TABLE donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_type VARCHAR(20) CHECK(donor_type IN ('individual','company','government')) NOT NULL,
    full_name VARCHAR(100),
    national_id VARCHAR(20),
    company_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    total_donated DECIMAL(15,2) DEFAULT 0,
    is_regular BOOLEAN DEFAULT 0,
    notes TEXT
);

-- 4. حملات التبرع
CREATE TABLE campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name VARCHAR(150) NOT NULL,
    goal_amount DECIMAL(15,2),
    collected_amount DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active'
);

-- 5. المشاريع
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_number VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) CHECK(status IN ('planning','active','completed','suspended')) DEFAULT 'planning',
    manager_id INTEGER,
    beneficiaries_count INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- 6. الأعضاء
CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20),
    birthdate DATE,
    gender VARCHAR(10),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    membership_type VARCHAR(20) CHECK(membership_type IN ('founding','active','honorary','associate')) NOT NULL,
    join_date DATE NOT NULL,
    annual_fee DECIMAL(10,2) DEFAULT 0,
    fee_status VARCHAR(20) DEFAULT 'unpaid',
    notes TEXT,
    documents_path VARCHAR(255),
    photo_path VARCHAR(255),
    is_active BOOLEAN DEFAULT 1
);

-- 7. اشتراكات الأعضاء
CREATE TABLE membership_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20),
    receipt_number VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 8. القيود اليومية
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    created_by INTEGER,
    approved_by INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 9. تفاصيل القيود
CREATE TABLE journal_entry_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);

-- 10. الحسابات البنكية
CREATE TABLE bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100),
    iban VARCHAR(50),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- 11. التبرعات
CREATE TABLE donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER,
    donation_number VARCHAR(50) UNIQUE NOT NULL,
    donation_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    donation_type VARCHAR(20) CHECK(donation_type IN ('general','zakat','kafara','sadaqa','waqf','specific')) NOT NULL,
    project_id INTEGER,
    campaign_id INTEGER,
    payment_method VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT 0,
    receipt_issued BOOLEAN DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES donors(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- 12. المستفيدين
CREATE TABLE beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    gender VARCHAR(10),
    birthdate DATE,
    family_size INTEGER DEFAULT 1,
    address TEXT,
    phone VARCHAR(20),
    income_level VARCHAR(20),
    social_status VARCHAR(50),
    needs_description TEXT,
    registered_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

-- 13. المساعدات المقدمة
CREATE TABLE assistance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    project_id INTEGER,
    assistance_type VARCHAR(50),
    amount_or_description TEXT,
    assistance_date DATE NOT NULL,
    approved_by INTEGER,
    notes TEXT,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 14. الموظفين
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(50),
    hire_date DATE NOT NULL,
    basic_salary DECIMAL(10,2),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    bank_account VARCHAR(50),
    is_active BOOLEAN DEFAULT 1
);

-- 15. الرواتب
CREATE TABLE payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary DECIMAL(10,2),
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2),
    payment_date DATE,
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 16. الاجتماعات
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_type VARCHAR(30) CHECK(meeting_type IN ('general_assembly','board','committee')) NOT NULL,
    meeting_date DATE NOT NULL,
    location VARCHAR(100),
    agenda TEXT,
    minutes_text TEXT,
    attendees_count INTEGER,
    decisions TEXT,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 17. العقود
CREATE TABLE contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(50),
    party_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    value DECIMAL(15,2),
    description TEXT,
    renewal_reminder DATE,
    file_path VARCHAR(255)
);

-- 18. الوثائق القانونية
CREATE TABLE legal_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_type VARCHAR(50),
    doc_number VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(100),
    reminder_days INTEGER DEFAULT 30,
    file_path VARCHAR(255),
    notes TEXT
);

-- 19. سجل العمليات (audit log)
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 20. توزيعات الزكاة
CREATE TABLE zakat_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    distribution_date DATE NOT NULL,
    notes TEXT,
    created_by INTEGER,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============ INDEXES ============
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
CREATE INDEX idx_zakat_category ON zakat_distributions(category);
CREATE INDEX idx_members_number ON members(member_number);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_journal_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_status ON journal_entries(status);
CREATE INDEX idx_beneficiaries_nid ON beneficiaries(national_id);
CREATE INDEX idx_assistance_beneficiary ON assistance_records(beneficiary_id);
CREATE INDEX idx_legal_expiry ON legal_documents(expiry_date);

-- ==========================================
-- بيانات أولية: دليل الحسابات (NGO Standard)
-- ==========================================
INSERT INTO chart_of_accounts (account_code, account_name, account_type, parent_id) VALUES
('1000', 'Assets / الأصول', 'asset', NULL),
('1010', 'Cash on Hand / الصندوق', 'asset', 1),
('1020', 'Bank Accounts / البنوك', 'asset', 1),
('1030', 'Accounts Receivable / المدينون', 'asset', 1),
('2000', 'Liabilities / الخصوم', 'liability', NULL),
('2010', 'Accounts Payable / الدائنون', 'liability', 5),
('3000', 'Net Assets / صافي الأصول', 'equity', NULL),
('3010', 'Unrestricted Net Assets / أموال غير مقيدة', 'equity', 7),
('3020', 'Temporarily Restricted / أموال مقيدة مؤقتاً', 'equity', 7),
('4000', 'Revenue / الإيرادات', 'revenue', NULL),
('4010', 'General Donations / التبرعات العامة', 'revenue', 10),
('4020', 'Zakat Funds / الزكاة', 'revenue', 10),
('4030', 'Membership Fees / اشتراكات الأعضاء', 'revenue', 10),
('4040', 'Grants / المنح', 'revenue', 10),
('5000', 'Expenses / المصروفات', 'expense', NULL),
('5010', 'Salaries & Wages / الرواتب', 'expense', 15),
('5020', 'Project Expenses / مصاريف المشاريع', 'expense', 15),
('5030', 'Administrative Expenses / مصاريف إدارية', 'expense', 15),
('5040', 'Rent & Utilities / الإيجار والمرافق', 'expense', 15);

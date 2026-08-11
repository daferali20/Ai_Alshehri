-- backend/models/compliance.sql

-- جدول الموافقات القانونية
CREATE TABLE execution_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    consent_signature TEXT NOT NULL,
    consent_given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    document_hash VARCHAR(255),
    document_version VARCHAR(10) DEFAULT '1.0'
);

-- جدول تدقيق التنفيذ
CREATE TABLE execution_audit (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_id VARCHAR(50),
    symbol VARCHAR(10),
    action VARCHAR(10),
    quantity INTEGER,
    price DECIMAL(10,2),
    executed_at TIMESTAMP,
    broker_type VARCHAR(50),
    status VARCHAR(20),
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- جدول سجل النشاط
CREATE TABLE user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- فهارس للبحث السريع
CREATE INDEX idx_execution_audit_user_date ON execution_audit(user_id, executed_at);
CREATE INDEX idx_user_activity_user_date ON user_activity_log(user_id, created_at);

-- =============================================================================
-- SEED USER: awabuyer1@gmail.com (Azure B2C User with Welcome@123)
-- SEED USER: krish14378@gmail.com (+919154506870 for WhatsApp & Email Testing)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Insert or update awabuyer1@gmail.com
INSERT INTO users (
    id, email, password_hash, full_name, phone_number, role, kyc_verified, is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'awabuyer1@gmail.com',
    crypt('Welcome@123', gen_salt('bf', 10)),
    'AWA Azure B2C Buyer 1',
    '+971501982736',
    'BUYER',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('Welcome@123', gen_salt('bf', 10)),
    role = 'BUYER',
    kyc_verified = true,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- Map role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'awabuyer1@gmail.com' AND r.name = 'BUYER'
ON CONFLICT DO NOTHING;

-- 2. Insert or update krish14378@gmail.com (Phone: +919154506870)
INSERT INTO users (
    id, email, password_hash, full_name, phone_number, role, kyc_verified, is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'krish14378@gmail.com',
    crypt('Welcome@123', gen_salt('bf', 10)),
    'Krish User',
    '+919154506870',
    'BUYER',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('Welcome@123', gen_salt('bf', 10)),
    phone_number = '+919154506870',
    role = 'BUYER',
    kyc_verified = true,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- Map role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'krish14378@gmail.com' AND r.name = 'BUYER'
ON CONFLICT DO NOTHING;

-- Seed 500 Active Users for Bharat E-Auction Testing
-- Password for all seed users: Password123!
-- BCrypt Hash: $2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC

-- 1. 450 Verified Buyers
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, kyc_verified, pan_number, gst_number, is_active)
SELECT 
    gen_random_uuid(),
    'buyer' || i || '@eauction.in',
    '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
    (ARRAY['Sharma Transport', 'Patel Logistics', 'Verma Carriers', 'Gupta Cargo', 'Singh Express', 'Kumar Freights', 'Reddy Roadways', 'Choudhury Fleet', 'Nair Movers', 'Mishra Haulage'])[1 + (i % 10)] || ' #' || i,
    '+919800' || LPAD(i::text, 6, '0'),
    'BUYER',
    TRUE,
    'ABCDE' || LPAD((1000 + i)::text, 4, '0') || 'F',
    '27ABCDE' || LPAD((1000 + i)::text, 4, '0') || 'F1Z5',
    TRUE
FROM generate_series(1, 450) AS i
ON CONFLICT (email) DO NOTHING;

-- 2. 40 Verified Fleet Sellers
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, kyc_verified, pan_number, gst_number, is_active)
SELECT 
    gen_random_uuid(),
    'seller' || i || '@eauction.in',
    '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
    (ARRAY['Tata Fleet Logistics', 'Ashok Leyland Certified', 'Bharat Fleet Yard', 'Mahindra Heavy Sales', 'Eicher Commercial Hub'])[1 + (i % 5)] || ' #' || i,
    '+919810' || LPAD(i::text, 6, '0'),
    'SELLER',
    TRUE,
    'BCDEF' || LPAD((2000 + i)::text, 4, '0') || 'G',
    '27BCDEF' || LPAD((2000 + i)::text, 4, '0') || 'G1Z5',
    TRUE
FROM generate_series(1, 40) AS i
ON CONFLICT (email) DO NOTHING;

-- 3. 10 Operations & System Admins
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, kyc_verified, pan_number, gst_number, is_active)
SELECT 
    gen_random_uuid(),
    'admin' || i || '@eauction.in',
    '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
    (ARRAY['Operations Supervisor', 'Chief Auctioneer', 'RTO Fleet Inspector', 'Settlement Controller', 'Platform Auditor'])[1 + (i % 5)] || ' #' || i,
    '+919820' || LPAD(i::text, 6, '0'),
    'ADMIN',
    TRUE,
    'CDEFG' || LPAD((3000 + i)::text, 4, '0') || 'H',
    '27CDEFG' || LPAD((3000 + i)::text, 4, '0') || 'H1Z5',
    TRUE
FROM generate_series(1, 10) AS i
ON CONFLICT (email) DO NOTHING;

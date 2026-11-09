-- =============================================================================
-- VEHICLE E-AUCTION PLATFORM - POSTGRESQL PRODUCTION DDL SCHEMA & SEED DATA
-- Target Database: PostgreSQL 14+
-- Architect: Principal Cloud Architect
-- Description: Core schema supporting Identity (RBAC), Vehicle Catalog,
--              High-Concurrency Auctions, Immutable Bids Ledger, and Payments.
-- =============================================================================

-- Enable required extensions for UUID generation and cryptographic utilities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- DOMAIN ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('CAR', 'TRUCK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auction_status AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bid_status AS ENUM ('ACCEPTED', 'REJECTED', 'SUPERSEDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM ('RAZORPAY', 'CASHFREE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- AUTOMATED TIMESTAMP REFRESH TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- TABLE: users
-- Purpose: Handles Identity, RBAC, KYC verification, Indian PAN & GST metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'BUYER' CHECK (role IN ('BUYER', 'SELLER', 'ADMIN')),
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    pan_number VARCHAR(10) CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' OR pan_number IS NULL),
    gst_number VARCHAR(15) CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$' OR gst_number IS NULL),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- TABLE: otp_verifications
-- Purpose: Ephemeral verification tokens for email/SMS multi-pod OTP workflows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_verifications (
    destination VARCHAR(255) PRIMARY KEY,
    code VARCHAR(16) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- -----------------------------------------------------------------------------
-- TABLE: vehicles
-- Purpose: Vehicle & Inventory domain (Commercial Trucks and Passenger Cars)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vin VARCHAR(100) NOT NULL UNIQUE,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    engine_number VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('CAR', 'TRUCK')),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturing_year INT NOT NULL CHECK (manufacturing_year >= 1990 AND manufacturing_year <= 2030),
    odometer_reading_km NUMERIC(10, 2) NOT NULL CHECK (odometer_reading_km >= 0),
    fuel_type VARCHAR(50) NOT NULL CHECK (fuel_type IN ('DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID')),
    media_paths TEXT[] NOT NULL DEFAULT '{}',
    inspection_report_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_vehicles_seller_id ON vehicles(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg_no ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_type_make ON vehicles(vehicle_type, make);

-- -----------------------------------------------------------------------------
-- TABLE: auctions
-- Purpose: Real-time auction states, reserve prices, and current price leader
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE RESTRICT,
    start_price NUMERIC(15, 2) NOT NULL CHECK (start_price > 0),
    reserve_price NUMERIC(15, 2) NOT NULL CHECK (reserve_price >= start_price),
    min_bid_increment NUMERIC(15, 2) NOT NULL CHECK (min_bid_increment > 0),
    current_highest_bid NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (current_highest_bid >= 0),
    highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'ENDED', 'CANCELLED')),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_auctions_updated_at
BEFORE UPDATE ON auctions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_vehicle_id ON auctions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_auctions_start_end ON auctions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_highest_bidder ON auctions(highest_bidder_id);

-- -----------------------------------------------------------------------------
-- TABLE: bids
-- Purpose: Immutable financial audit ledger for each submitted/accepted bid
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bid_amount NUMERIC(15, 2) NOT NULL CHECK (bid_amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'ACCEPTED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, bid_amount DESC);

-- -----------------------------------------------------------------------------
-- TABLE: payments
-- Purpose: Financial reconciliation checkpoints for security deposits / settlements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    gateway VARCHAR(50) NOT NULL CHECK (gateway IN ('RAZORPAY', 'CASHFREE')),
    gateway_order_id VARCHAR(255) NOT NULL UNIQUE,
    gateway_payment_id VARCHAR(255) UNIQUE,
    gateway_signature VARCHAR(512),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    reconciliation_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payments_auction_id ON payments(auction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================================================
-- SEED DATA: AUTOMATIC INITIALIZATION FOR ZERO-CONFIGURATION DOCKER STARTUP
-- Password for all seed users is 'Password123!' (BCrypt 10 rounds)
-- =============================================================================

INSERT INTO users (id, email, password_hash, full_name, phone_number, role, kyc_verified, pan_number, gst_number, is_active)
VALUES 
    (
        'a1111111-1111-1111-1111-111111111111',
        'admin@eauction.in',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'System Administrator',
        '+919000000001',
        'ADMIN',
        TRUE,
        'AAACT1234F',
        '27AAACT1234F1Z5',
        TRUE
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'seller@tatafleet.in',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'Tata Fleet Logistics Pvt Ltd',
        '+919876543210',
        'SELLER',
        TRUE,
        'AAACT1234F',
        '27AAACT1234F1Z5',
        TRUE
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'buyer@sharmatransport.in',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'Sharma Transport Logistics',
        '+919876543211',
        'BUYER',
        TRUE,
        'ABCDE1234F',
        '27ABCDE1234F1Z9',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (id, seller_id, vin, registration_number, engine_number, vehicle_type, make, model, manufacturing_year, odometer_reading_km, fuel_type, media_paths, inspection_report_url)
VALUES 
    (
        'd4444444-4444-4444-4444-444444444444',
        'b2222222-2222-2222-2222-222222222222',
        'MAT612345N1234567',
        'MH12AB9999',
        'ENG99887766',
        'TRUCK',
        'Tata Motors',
        'Signa 4825.TK Heavy Commercial Truck',
        2023,
        35000.50,
        'DIESEL',
        ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'],
        'https://storage.eauction.in/reports/mh12ab9999.pdf'
    ),
    (
        'e5555555-5555-5555-5555-555555555555',
        'b2222222-2222-2222-2222-222222222222',
        'MAL789012P7654321',
        'DL01CA1234',
        'ENG55443322',
        'CAR',
        'Mahindra',
        'XUV700 AX7 Luxury AWD SUV',
        2024,
        12500.00,
        'DIESEL',
        ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
        'https://storage.eauction.in/reports/dl01ca1234.pdf'
    ),
    (
        'f6666666-6666-6666-6666-666666666666',
        'b2222222-2222-2222-2222-222222222222',
        'MAK345678Q9876543',
        'KA05MN8888',
        'ENG11223344',
        'TRUCK',
        'Ashok Leyland',
        'Ecomet 1615 HE Commercial Tipper',
        2022,
        52000.00,
        'DIESEL',
        ARRAY['https://images.unsplash.com/photo-1586191582056-a6f9f528a7e0?auto=format&fit=crop&q=80&w=800'],
        'https://storage.eauction.in/reports/ka05mn8888.pdf'
    )
ON CONFLICT (vin) DO NOTHING;

INSERT INTO auctions (id, vehicle_id, start_price, reserve_price, min_bid_increment, current_highest_bid, highest_bidder_id, start_time, end_time, status, version)
VALUES 
    (
        'e87e1a92-3a56-4279-bf7c-88e89f89ef32',
        'd4444444-4444-4444-4444-444444444444',
        2500000.00,
        3000000.00,
        25000.00,
        2500000.00,
        'c3333333-3333-3333-3333-333333333333',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP + INTERVAL '24 hours',
        'ACTIVE',
        1
    ),
    (
        'f98f2b83-4b67-5380-ca8d-99f90f90fa43',
        'e5555555-5555-5555-5555-555555555555',
        1800000.00,
        2100000.00,
        10000.00,
        1800000.00,
        'c3333333-3333-3333-3333-333333333333',
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '48 hours',
        'ACTIVE',
        1
    )
ON CONFLICT (vehicle_id) DO NOTHING;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES 
    (
        '99999999-9999-9999-9999-999999999991',
        'e87e1a92-3a56-4279-bf7c-88e89f89ef32',
        'c3333333-3333-3333-3333-333333333333',
        2500000.00,
        'ACCEPTED',
        CURRENT_TIMESTAMP - INTERVAL '30 minutes'
    ),
    (
        '99999999-9999-9999-9999-999999999992',
        'f98f2b83-4b67-5380-ca8d-99f90f90fa43',
        'c3333333-3333-3333-3333-333333333333',
        1800000.00,
        'ACCEPTED',
        CURRENT_TIMESTAMP - INTERVAL '45 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 500 VERIFIED SEED USERS FOR HIGH-CONCURRENCY BIDDING & RBAC TESTING
-- -----------------------------------------------------------------------------
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

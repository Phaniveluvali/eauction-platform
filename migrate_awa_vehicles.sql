-- =============================================================================
-- AWA ENTERPRISE FLEET & OPERATIONS SCHEMA MIGRATION
-- Supports: Add New Car, Request Vehicle (FVSA), Request from ERP, Workflow Steps
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS vehicle_lot_seq START WITH 100820;

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS lot_no INTEGER DEFAULT nextval('vehicle_lot_seq');
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Sharjah';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS no_of_keys VARCHAR(50) DEFAULT '1 Key';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'White';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS target_selling_price NUMERIC(14,2) DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS minimum_selling_price NUMERIC(14,2) DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS previous_numberplate VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mulkiya_document_url VARCHAR(1024);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wf_activity_id VARCHAR(50) DEFAULT 'FVSA';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'SUBMISSION_PENDING';

-- Backfill lot_no for existing vehicles if null
UPDATE vehicles SET lot_no = nextval('vehicle_lot_seq') WHERE lot_no IS NULL;
UPDATE vehicles SET target_selling_price = 100000 WHERE target_selling_price IS NULL OR target_selling_price = 0;
UPDATE vehicles SET minimum_selling_price = 85000 WHERE minimum_selling_price IS NULL OR minimum_selling_price = 0;
UPDATE vehicles SET branch = 'Sharjah' WHERE branch IS NULL;
UPDATE vehicles SET wf_activity_id = 'FVSA' WHERE wf_activity_id IS NULL;
UPDATE vehicles SET status = 'SUBMISSION_PENDING' WHERE status IS NULL;

-- Insert Seed vehicles matching Screenshot 4 for Request Vehicle pool
INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, branch, no_of_keys, color, target_selling_price, minimum_selling_price,
    previous_numberplate, client_name, wf_activity_id, status, lot_no
) VALUES
('b1008130-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140342641', 'DXB-L-100813', 'ENG-TOY-813', 'CAR', 'Toyota', 'Land Cruiser 2023', 2023, 15400, 'PETROL', '{"/assets/00c7c84b-d9f1-4983-ac01-a7d747c1ff25"}', 'Sharjah', '2 Keys', 'Pearl White', 100000, 92000, 'DXB-100813', 'Emirates Fleet Transport', 'FVSA', 'SUBMISSION_PENDING', 100813),
('b1009680-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140306806', 'SHJ-E-100968', 'ENG-TOY-968', 'CAR', 'Toyota', 'Innova 2022', 2022, 38200, 'PETROL', '{"/assets/07c7207b-3c38-41cf-9e31-57f80dcc12db"}', 'Sharjah', '2 Keys', 'Silver', 100000, 88000, 'SHJ-100968', 'Sharjah VIP Motors', 'FVSA', 'SUBMISSION_PENDING', 100968),
('b1007860-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140306807', 'AD-5-100786', 'ENG-TOY-786', 'CAR', 'Toyota', 'Land Cruiser 2025', 2025, 4200, 'PETROL', '{"/assets/1ca9a478-4a75-4ee6-91de-f6b97023ece9"}', 'Sharjah', '2 Keys', 'Black', 100000, 95000, 'AD-100786', 'Al Mansoori Consignments', 'FVSA', 'SUBMISSION_PENDING', 100786),
('b1003880-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '030726153039349', 'AJM-C-100388', 'ENG-NIS-388', 'CAR', 'Nissan', 'Sunny 2024', 2024, 21000, 'PETROL', '{"/assets/5ef79d4a-517b-4611-803f-ef1f1d525bad"}', 'Sharjah', '1 Key', 'White', 45000, 39000, 'AJM-100388', 'Al Wataneya Consignment', 'FVSA', 'SUBMISSION_PENDING', 100388),
('b1003810-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '030726153027179', 'DXB-N-100381', 'ENG-NIS-381', 'CAR', 'Nissan', 'Patrol 2025', 2025, 8900, 'PETROL', '{"/assets/5fd3594e-0310-4495-acd4-d589cd227541"}', 'Sharjah', '2 Keys', 'Gold', 45000, 42000, 'DXB-100381', 'Emirates Transport Fleet', 'FVSA', 'SUBMISSION_PENDING', 100381),
('b1003530-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '030726152917539', 'SHJ-R-100353', 'ENG-NIS-353', 'CAR', 'Nissan', 'Sunny 2022', 2022, 62000, 'PETROL', '{"/assets/675669d9-9129-4db2-abf2-61290e96e4da"}', 'Sharjah', '1 Key', 'Silver', 100000, 85000, 'SHJ-100353', 'Sharjah Trading Logistics', 'FVSA', 'SUBMISSION_PENDING', 100353)
ON CONFLICT (id) DO UPDATE SET
    target_selling_price = EXCLUDED.target_selling_price,
    minimum_selling_price = EXCLUDED.minimum_selling_price,
    branch = EXCLUDED.branch,
    lot_no = EXCLUDED.lot_no,
    wf_activity_id = EXCLUDED.wf_activity_id,
    status = EXCLUDED.status;

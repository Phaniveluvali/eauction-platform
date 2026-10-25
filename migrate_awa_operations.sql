-- =============================================================================
-- AWA OPERATIONS WORKFLOW & SUBMODULES MIGRATION
-- Supports: Request Vehicle (FVSA), Washed Vehicle (FW), PhotoVehicle (FP)
-- =============================================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS old_id VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Sharjah';

-- Update existing branch to location if location is null
UPDATE vehicles SET location = branch WHERE location IS NULL OR location = '';

-- Update seller_name on seed vehicles for Screenshot 2
UPDATE vehicles SET client_name = 'AWA Admin', created_at = '2026-07-03 15:30:14+00' WHERE lot_no = 100813;
UPDATE vehicles SET client_name = 'sri teja', created_at = '2026-07-03 15:29:19+00', vin = '' WHERE lot_no = 100968;
UPDATE vehicles SET client_name = 'sri teja', created_at = '2026-07-03 15:29:17+00' WHERE lot_no = 100786;
UPDATE vehicles SET client_name = 'AWA Admin', created_at = '2026-07-03 15:28:59+00' WHERE lot_no = 100388;
UPDATE vehicles SET client_name = 'sri teja', created_at = '2026-07-03 15:29:12+00' WHERE lot_no = 100381;
UPDATE vehicles SET client_name = 'AWA Admin', created_at = '2026-07-03 15:28:53+00' WHERE lot_no = 100353;

-- Add or update Washed Vehicle seed (Screenshot 3 & 4)
INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    branch, location, color, target_selling_price, minimum_selling_price,
    client_name, wf_activity_id, status, lot_no, created_at
) VALUES
('b1010180-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '123456782345678', 'AUH-101018', 'ENG-AR-1018', 'CAR', 'Alfa Romeo', 'Brera 2020', 2020, 48000, 'PETROL', 'Abu Dhabi', 'Abu Dhabi', 'Red', 75000, 68000, 'Emirates VIP Fleet', 'FW', 'UNDER_WASHING', 101018, '2026-08-27 13:14:00+00')
ON CONFLICT (id) DO UPDATE SET
    wf_activity_id = 'FW',
    status = 'UNDER_WASHING',
    location = 'Abu Dhabi',
    branch = 'Abu Dhabi',
    lot_no = 101018,
    created_at = '2026-08-27 13:14:00+00';

-- Add PhotoVehicle seeds (Screenshot 5)
INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    branch, location, color, target_selling_price, minimum_selling_price,
    client_name, wf_activity_id, status, lot_no, created_at
) VALUES
('b1009100-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140918604', 'AUH-100910', 'ENG-NIS-910', 'CAR', 'Nissan', 'Sunny 2022', 2022, 34000, 'PETROL', 'Abu Dhabi', 'Abu Dhabi', 'Silver', 42000, 38000, 'Abu Dhabi Fleet Corp', 'FP', 'PHOTO_PENDING', 100910, '2026-07-22 14:05:00+00'),
('b1009090-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140915920', 'AUH-100909', 'ENG-NIS-909', 'CAR', 'Nissan', 'Altima 2023', 2023, 19500, 'PETROL', 'Abu Dhabi', 'Abu Dhabi', 'White', 58000, 52000, 'Abu Dhabi Fleet Corp', 'FP', 'PHOTO_PENDING', 100909, '2026-07-22 14:02:00+00'),
('b1009070-1111-2222-3333-444455556666', 'b2222222-2222-2222-2222-222222222222', '220726140909720', 'AUH-100907', 'ENG-TOY-907', 'CAR', 'Toyota', 'Land Cruiser 2025', 2025, 6200, 'PETROL', 'Abu Dhabi', 'Abu Dhabi', 'Black', 115000, 105000, 'Emirates VIP Fleet', 'FP', 'PHOTO_PENDING', 100907, '2026-07-22 14:00:00+00')
ON CONFLICT (id) DO UPDATE SET
    wf_activity_id = 'FP',
    status = 'PHOTO_PENDING',
    location = 'Abu Dhabi',
    branch = 'Abu Dhabi',
    created_at = EXCLUDED.created_at;

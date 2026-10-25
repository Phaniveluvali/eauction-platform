-- =============================================================================
-- 100 REALISTIC ONLINE AUCTION VEHICLES & 30-DAY LIVE ACTIVE AUCTIONS SEED
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
        'Emirates Transport Government Fleet',
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
    ),
    (
        'd1111111-0000-0000-0000-000000000001',
        'awabuyer@gmail.com',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'Awa Buyer Primary',
        '+971501234567',
        'BUYER',
        TRUE,
        'AWABY1234F',
        '27AWABY1234F1Z1',
        TRUE
    ),
    (
        'd1111111-0000-0000-0000-000000000002',
        'awabuyer1@gmail.com',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'Awa Buyer Premium',
        '+971509876543',
        'BUYER',
        TRUE,
        'AWABY5678G',
        '27AWABY5678G1Z2',
        TRUE
    ),
    (
        'd1111111-0000-0000-0000-000000000003',
        'krish14378@gmail.com',
        '$2a$10$8gwjvzrGRrxqTZVj7ea9bufzzr/JV3.hyPFa45ZEtLiB8eLRywoNC',
        'Krish Principal Bidder',
        '+919154506870',
        'BUYER',
        TRUE,
        'KRISH1234P',
        '27KRISH1234P1Z3',
        TRUE
    )
ON CONFLICT (email) DO UPDATE SET is_active = TRUE, kyc_verified = TRUE;


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000001',
    'DXB-1001',
    'ENG-AWA-900001',
    'CAR',
    'Toyota',
    'Land Cruiser 300 VXR 3.5L Twin Turbo',
    2024,
    12730,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000001.pdf',
    100001,
    'Dubai',
    'Dubai',
    'Pearl White',
    '2 Keys',
    390000.00,
    340000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    340000.00,
    390000.00,
    2500.00,
    345000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'c3333333-3333-3333-3333-333333333333',
    345000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000002',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000002',
    'AUH-1002',
    'ENG-AWA-900002',
    'CAR',
    'Lexus',
    'LX600 VIP Edition 3.5L Turbo',
    2024,
    13460,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000002.pdf',
    100002,
    'Abu Dhabi',
    'Abu Dhabi',
    'Sonic Titanium',
    '2 Keys',
    530000.00,
    480000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    480000.00,
    530000.00,
    5000.00,
    495000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'c3333333-3333-3333-3333-333333333333',
    495000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000003',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000003',
    'SHJ-1003',
    'ENG-AWA-900003',
    'CAR',
    'Nissan',
    'Patrol Titanium 5.6L V8 4WD',
    2023,
    14190,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000003.pdf',
    100003,
    'Sharjah',
    'Sharjah',
    'Metallic Black',
    '2 Keys',
    295000.00,
    260000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    260000.00,
    295000.00,
    2000.00,
    268000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    'c3333333-3333-3333-3333-333333333333',
    268000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000004',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000004',
    'RAK-1004',
    'ENG-AWA-900004',
    'CAR',
    'Mercedes-Benz',
    'G63 AMG 4.0L V8 Biturbo Magno',
    2024,
    14920,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000004.pdf',
    100004,
    'Dubai',
    'Dubai',
    'Night Black Magno',
    '2 Keys',
    850000.00,
    780000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000004',
    780000.00,
    850000.00,
    10000.00,
    830000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    'c3333333-3333-3333-3333-333333333333',
    830000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000005',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024TR0000000005',
    'AJM-1005',
    'ENG-AWA-900005',
    'TRUCK',
    'Volvo Trucks',
    'FH16 750 Heavy Haulage Prime Mover 6x4',
    2024,
    15650,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024tr0000000005.pdf',
    100005,
    'Dubai',
    'Dubai',
    'Ocean Blue',
    '2 Keys',
    590000.00,
    520000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    520000.00,
    590000.00,
    5000.00,
    525000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000005',
    'c3333333-3333-3333-3333-333333333333',
    525000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000006',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000006',
    'FUJ-1006',
    'ENG-AWA-900006',
    'CAR',
    'BMW',
    'X7 xDrive40i M-Sport 7-Seater',
    2024,
    16380,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000006.pdf',
    100006,
    'Abu Dhabi',
    'Abu Dhabi',
    'Carbon Black',
    '2 Keys',
    420000.00,
    380000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000006',
    380000.00,
    420000.00,
    2500.00,
    385000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000006',
    'c3333333-3333-3333-3333-333333333333',
    385000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000007',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000007',
    'UAQ-1007',
    'ENG-AWA-900007',
    'CAR',
    'Land Rover',
    'Range Rover Autobiography LWB 4.4L V8',
    2023,
    17110,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000007.pdf',
    100007,
    'Dubai',
    'Dubai',
    'Santorini Black',
    '2 Keys',
    680000.00,
    620000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000007',
    620000.00,
    680000.00,
    5000.00,
    635000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000007',
    'c3333333-3333-3333-3333-333333333333',
    635000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000008',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000008',
    'DXB-1008',
    'ENG-AWA-900008',
    'CAR',
    'Audi',
    'RS Q8 4.0 TFSI Quattro Carbon Edition',
    2023,
    17840,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000008.pdf',
    100008,
    'Dubai',
    'Dubai',
    'Nardo Grey',
    '2 Keys',
    510000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000008',
    460000.00,
    510000.00,
    5000.00,
    480000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000008',
    'c3333333-3333-3333-3333-333333333333',
    480000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000009',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000009',
    'AUH-1009',
    'ENG-AWA-900009',
    'CAR',
    'Cadillac',
    'Escalade Sport Platinum 6.2L V8',
    2024,
    18570,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000009.pdf',
    100009,
    'Sharjah',
    'Sharjah',
    'Crystal White',
    '2 Keys',
    495000.00,
    450000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000009',
    450000.00,
    495000.00,
    2500.00,
    462500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000009',
    'c3333333-3333-3333-3333-333333333333',
    462500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000010',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000010',
    'SHJ-1010',
    'ENG-AWA-900010',
    'TRUCK',
    'Isuzu',
    'Forward FVR 12-Ton Heavy Duty Flatbed',
    2023,
    19300,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000010.pdf',
    100010,
    'Dubai',
    'Dubai',
    'Polar White',
    '2 Keys',
    245000.00,
    210000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000010',
    '10000000-0000-0000-0000-000000000010',
    210000.00,
    245000.00,
    1500.00,
    211500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000010',
    'c3333333-3333-3333-3333-333333333333',
    211500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000011',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000011',
    'DXB-1011',
    'ENG-AWA-900011',
    'CAR',
    'Toyota',
    'Camry Grande Hybrid 2.5L',
    2024,
    20030,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000011.pdf',
    100011,
    'Dubai',
    'Dubai',
    'Silver Metallic',
    '2 Keys',
    130000.00,
    115000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000011',
    115000.00,
    130000.00,
    1000.00,
    117000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000011',
    'c3333333-3333-3333-3333-333333333333',
    117000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000012',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000012',
    'AUH-1012',
    'ENG-AWA-900012',
    'CAR',
    'Lexus',
    'ES 300h Premier Hybrid',
    2023,
    20760,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000012.pdf',
    100012,
    'Sharjah',
    'Sharjah',
    'Caviar',
    '2 Keys',
    198000.00,
    175000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000012',
    175000.00,
    198000.00,
    1500.00,
    179500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000012',
    '20000000-0000-0000-0000-000000000012',
    'c3333333-3333-3333-3333-333333333333',
    179500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000013',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000013',
    'SHJ-1013',
    'ENG-AWA-900013',
    'CAR',
    'Tesla',
    'Model X Plaid Tri-Motor AWD',
    2023,
    21490,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000013.pdf',
    100013,
    'Dubai',
    'Dubai',
    'Deep Blue',
    '2 Keys',
    370000.00,
    330000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000013',
    '10000000-0000-0000-0000-000000000013',
    330000.00,
    370000.00,
    2500.00,
    340000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000013',
    'c3333333-3333-3333-3333-333333333333',
    340000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000014',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000014',
    'RAK-1014',
    'ENG-AWA-900014',
    'CAR',
    'Porsche',
    'Taycan Turbo S Electric Performance',
    2023,
    22220,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000014.pdf',
    100014,
    'Abu Dhabi',
    'Abu Dhabi',
    'Frozen Blue',
    '2 Keys',
    490000.00,
    440000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000014',
    '10000000-0000-0000-0000-000000000014',
    440000.00,
    490000.00,
    5000.00,
    465000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000014',
    '20000000-0000-0000-0000-000000000014',
    'c3333333-3333-3333-3333-333333333333',
    465000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000015',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000015',
    'AJM-1015',
    'ENG-AWA-900015',
    'TRUCK',
    'BharatBenz',
    '2823R Multi-Axle Rigid Cargo Hauler',
    2023,
    22950,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000015.pdf',
    100015,
    'Abu Dhabi',
    'Abu Dhabi',
    'Yellow Cab',
    '2 Keys',
    320000.00,
    280000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000015',
    '10000000-0000-0000-0000-000000000015',
    280000.00,
    320000.00,
    2000.00,
    282000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000015',
    '20000000-0000-0000-0000-000000000015',
    'c3333333-3333-3333-3333-333333333333',
    282000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000016',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000016',
    'FUJ-1016',
    'ENG-AWA-900016',
    'CAR',
    'Nissan',
    'Super Safari 4.8L Inline-6 Y61',
    2023,
    23680,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000016.pdf',
    100016,
    'Sharjah',
    'Sharjah',
    'Desert Gold',
    '2 Keys',
    185000.00,
    160000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000016',
    '10000000-0000-0000-0000-000000000016',
    160000.00,
    185000.00,
    1000.00,
    162000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000016',
    '20000000-0000-0000-0000-000000000016',
    'c3333333-3333-3333-3333-333333333333',
    162000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000017',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000017',
    'UAQ-1017',
    'ENG-AWA-900017',
    'CAR',
    'Hyundai',
    'Tucson Ultimate AWD 1.6T',
    2023,
    24410,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000017.pdf',
    100017,
    'Dubai',
    'Dubai',
    'Amazon Grey',
    '2 Keys',
    110000.00,
    95000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000017',
    '10000000-0000-0000-0000-000000000017',
    95000.00,
    110000.00,
    1000.00,
    98000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000017',
    '20000000-0000-0000-0000-000000000017',
    'c3333333-3333-3333-3333-333333333333',
    98000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000018',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000018',
    'DXB-1018',
    'ENG-AWA-900018',
    'CAR',
    'Genesis',
    'GV80 Prestige 3.5L Twin Turbo',
    2024,
    25140,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000018.pdf',
    100018,
    'Abu Dhabi',
    'Abu Dhabi',
    'Cardiff Green',
    '2 Keys',
    310000.00,
    275000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000018',
    '10000000-0000-0000-0000-000000000018',
    275000.00,
    310000.00,
    2000.00,
    283000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000018',
    '20000000-0000-0000-0000-000000000018',
    'c3333333-3333-3333-3333-333333333333',
    283000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000019',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000019',
    'AUH-1019',
    'ENG-AWA-900019',
    'CAR',
    'Toyota',
    'Land Cruiser 300 VXR 3.5L Twin Turbo',
    2024,
    25870,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000019.pdf',
    100019,
    'Dubai',
    'Dubai',
    'Pearl White',
    '2 Keys',
    390000.00,
    340000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000019',
    '10000000-0000-0000-0000-000000000019',
    340000.00,
    390000.00,
    2500.00,
    352500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000019',
    '20000000-0000-0000-0000-000000000019',
    'c3333333-3333-3333-3333-333333333333',
    352500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000020',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2022TR0000000020',
    'SHJ-1020',
    'ENG-AWA-900020',
    'TRUCK',
    'Ashok Leyland',
    'Ecomet 1615 HE Intercity Cargo Freighter',
    2022,
    26600,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1586191582056-a6f9f528a7e0?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2022tr0000000020.pdf',
    100020,
    'Sharjah',
    'Sharjah',
    'White',
    '2 Keys',
    230000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000020',
    '10000000-0000-0000-0000-000000000020',
    195000.00,
    230000.00,
    1500.00,
    196500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000020',
    '20000000-0000-0000-0000-000000000020',
    'c3333333-3333-3333-3333-333333333333',
    196500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000021',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000021',
    'DXB-1021',
    'ENG-AWA-900021',
    'CAR',
    'Nissan',
    'Patrol Titanium 5.6L V8 4WD',
    2023,
    27330,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000021.pdf',
    100021,
    'Sharjah',
    'Sharjah',
    'Metallic Black',
    '2 Keys',
    295000.00,
    260000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000021',
    '10000000-0000-0000-0000-000000000021',
    260000.00,
    295000.00,
    2000.00,
    264000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000021',
    '20000000-0000-0000-0000-000000000021',
    'c3333333-3333-3333-3333-333333333333',
    264000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000022',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000022',
    'AUH-1022',
    'ENG-AWA-900022',
    'CAR',
    'Mercedes-Benz',
    'G63 AMG 4.0L V8 Biturbo Magno',
    2024,
    28060,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000022.pdf',
    100022,
    'Dubai',
    'Dubai',
    'Night Black Magno',
    '2 Keys',
    850000.00,
    780000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000022',
    '10000000-0000-0000-0000-000000000022',
    780000.00,
    850000.00,
    10000.00,
    810000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000022',
    '20000000-0000-0000-0000-000000000022',
    'c3333333-3333-3333-3333-333333333333',
    810000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000023',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000023',
    'SHJ-1023',
    'ENG-AWA-900023',
    'CAR',
    'Porsche',
    '911 Carrera S PDK Sport Chrono',
    2023,
    28790,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000023.pdf',
    100023,
    'Dubai',
    'Dubai',
    'Guards Red',
    '2 Keys',
    540000.00,
    490000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000023',
    '10000000-0000-0000-0000-000000000023',
    490000.00,
    540000.00,
    5000.00,
    510000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000023',
    '20000000-0000-0000-0000-000000000023',
    'c3333333-3333-3333-3333-333333333333',
    510000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000024',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000024',
    'RAK-1024',
    'ENG-AWA-900024',
    'CAR',
    'BMW',
    'X7 xDrive40i M-Sport 7-Seater',
    2024,
    29520,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000024.pdf',
    100024,
    'Abu Dhabi',
    'Abu Dhabi',
    'Carbon Black',
    '2 Keys',
    420000.00,
    380000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000024',
    '10000000-0000-0000-0000-000000000024',
    380000.00,
    420000.00,
    2500.00,
    392500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000024',
    '20000000-0000-0000-0000-000000000024',
    'c3333333-3333-3333-3333-333333333333',
    392500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000025',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000025',
    'AJM-1025',
    'ENG-AWA-900025',
    'TRUCK',
    'Tata Motors',
    'Signa 4825.TK Heavy Commercial Tipper 16-Wheeler',
    2023,
    30250,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000025.pdf',
    100025,
    'Dubai',
    'Dubai',
    'Tata Orange',
    '2 Keys',
    360000.00,
    310000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000025',
    '10000000-0000-0000-0000-000000000025',
    310000.00,
    360000.00,
    2500.00,
    312500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000025',
    '20000000-0000-0000-0000-000000000025',
    'c3333333-3333-3333-3333-333333333333',
    312500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000026',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000026',
    'FUJ-1026',
    'ENG-AWA-900026',
    'CAR',
    'Audi',
    'RS Q8 4.0 TFSI Quattro Carbon Edition',
    2023,
    30980,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000026.pdf',
    100026,
    'Dubai',
    'Dubai',
    'Nardo Grey',
    '2 Keys',
    510000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000026',
    '10000000-0000-0000-0000-000000000026',
    460000.00,
    510000.00,
    5000.00,
    470000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000026',
    '20000000-0000-0000-0000-000000000026',
    'c3333333-3333-3333-3333-333333333333',
    470000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000027',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000027',
    'UAQ-1027',
    'ENG-AWA-900027',
    'CAR',
    'Cadillac',
    'Escalade Sport Platinum 6.2L V8',
    2024,
    31710,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000027.pdf',
    100027,
    'Sharjah',
    'Sharjah',
    'Crystal White',
    '2 Keys',
    495000.00,
    450000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000027',
    '10000000-0000-0000-0000-000000000027',
    450000.00,
    495000.00,
    2500.00,
    457500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000027',
    '20000000-0000-0000-0000-000000000027',
    'c3333333-3333-3333-3333-333333333333',
    457500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000028',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000028',
    'DXB-1028',
    'ENG-AWA-900028',
    'CAR',
    'Mercedes-Benz',
    'S580 4MATIC Long Maybach Styling',
    2023,
    32440,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000028.pdf',
    100028,
    'Abu Dhabi',
    'Abu Dhabi',
    'Obsidian Black',
    '2 Keys',
    640000.00,
    580000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000028',
    '10000000-0000-0000-0000-000000000028',
    580000.00,
    640000.00,
    5000.00,
    600000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000028',
    '20000000-0000-0000-0000-000000000028',
    'c3333333-3333-3333-3333-333333333333',
    600000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000029',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000029',
    'AUH-1029',
    'ENG-AWA-900029',
    'CAR',
    'Toyota',
    'Camry Grande Hybrid 2.5L',
    2024,
    33170,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000029.pdf',
    100029,
    'Dubai',
    'Dubai',
    'Silver Metallic',
    '2 Keys',
    130000.00,
    115000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000029',
    '10000000-0000-0000-0000-000000000029',
    115000.00,
    130000.00,
    1000.00,
    120000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000029',
    '20000000-0000-0000-0000-000000000029',
    'c3333333-3333-3333-3333-333333333333',
    120000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000030',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000030',
    'SHJ-1030',
    'ENG-AWA-900030',
    'TRUCK',
    'Scania',
    'R500 V8 Streamline Long-Haul Tractor',
    2023,
    33900,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000030.pdf',
    100030,
    'Abu Dhabi',
    'Abu Dhabi',
    'Ruby Red',
    '2 Keys',
    525000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000030',
    '10000000-0000-0000-0000-000000000030',
    460000.00,
    525000.00,
    5000.00,
    465000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000030',
    '20000000-0000-0000-0000-000000000030',
    'c3333333-3333-3333-3333-333333333333',
    465000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000031',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000031',
    'DXB-1031',
    'ENG-AWA-900031',
    'CAR',
    'Tesla',
    'Model X Plaid Tri-Motor AWD',
    2023,
    34630,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000031.pdf',
    100031,
    'Dubai',
    'Dubai',
    'Deep Blue',
    '2 Keys',
    370000.00,
    330000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000031',
    '10000000-0000-0000-0000-000000000031',
    330000.00,
    370000.00,
    2500.00,
    335000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000031',
    '20000000-0000-0000-0000-000000000031',
    'c3333333-3333-3333-3333-333333333333',
    335000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000032',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000032',
    'AUH-1032',
    'ENG-AWA-900032',
    'CAR',
    'Porsche',
    'Taycan Turbo S Electric Performance',
    2023,
    35360,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000032.pdf',
    100032,
    'Abu Dhabi',
    'Abu Dhabi',
    'Frozen Blue',
    '2 Keys',
    490000.00,
    440000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000032',
    '10000000-0000-0000-0000-000000000032',
    440000.00,
    490000.00,
    5000.00,
    455000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000032',
    '20000000-0000-0000-0000-000000000032',
    'c3333333-3333-3333-3333-333333333333',
    455000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000033',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000033',
    'SHJ-1033',
    'ENG-AWA-900033',
    'CAR',
    'Toyota',
    'Prado TX-L 2.8L Turbo Diesel',
    2024,
    36090,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000033.pdf',
    100033,
    'Dubai',
    'Dubai',
    'Super White',
    '2 Keys',
    220000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000033',
    '10000000-0000-0000-0000-000000000033',
    195000.00,
    220000.00,
    1500.00,
    201000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000033',
    '20000000-0000-0000-0000-000000000033',
    'c3333333-3333-3333-3333-333333333333',
    201000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000034',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000034',
    'RAK-1034',
    'ENG-AWA-900034',
    'CAR',
    'Nissan',
    'Super Safari 4.8L Inline-6 Y61',
    2023,
    36820,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000034.pdf',
    100034,
    'Sharjah',
    'Sharjah',
    'Desert Gold',
    '2 Keys',
    185000.00,
    160000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000034',
    '10000000-0000-0000-0000-000000000034',
    160000.00,
    185000.00,
    1000.00,
    165000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000034',
    '20000000-0000-0000-0000-000000000034',
    'c3333333-3333-3333-3333-333333333333',
    165000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000035',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024TR0000000035',
    'AJM-1035',
    'ENG-AWA-900035',
    'TRUCK',
    'Volvo Trucks',
    'FH16 750 Heavy Haulage Prime Mover 6x4',
    2024,
    37550,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024tr0000000035.pdf',
    100035,
    'Dubai',
    'Dubai',
    'Ocean Blue',
    '2 Keys',
    590000.00,
    520000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000035',
    '10000000-0000-0000-0000-000000000035',
    520000.00,
    590000.00,
    5000.00,
    525000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000035',
    '20000000-0000-0000-0000-000000000035',
    'c3333333-3333-3333-3333-333333333333',
    525000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000036',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000036',
    'FUJ-1036',
    'ENG-AWA-900036',
    'CAR',
    'Genesis',
    'GV80 Prestige 3.5L Twin Turbo',
    2024,
    38280,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000036.pdf',
    100036,
    'Abu Dhabi',
    'Abu Dhabi',
    'Cardiff Green',
    '2 Keys',
    310000.00,
    275000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000036',
    '10000000-0000-0000-0000-000000000036',
    275000.00,
    310000.00,
    2000.00,
    279000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000036',
    '20000000-0000-0000-0000-000000000036',
    'c3333333-3333-3333-3333-333333333333',
    279000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000037',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000037',
    'UAQ-1037',
    'ENG-AWA-900037',
    'CAR',
    'Toyota',
    'Land Cruiser 300 VXR 3.5L Twin Turbo',
    2024,
    39010,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000037.pdf',
    100037,
    'Dubai',
    'Dubai',
    'Pearl White',
    '2 Keys',
    390000.00,
    340000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000037',
    '10000000-0000-0000-0000-000000000037',
    340000.00,
    390000.00,
    2500.00,
    347500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000037',
    '20000000-0000-0000-0000-000000000037',
    'c3333333-3333-3333-3333-333333333333',
    347500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000038',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000038',
    'DXB-1038',
    'ENG-AWA-900038',
    'CAR',
    'Lexus',
    'LX600 VIP Edition 3.5L Turbo',
    2024,
    39740,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000038.pdf',
    100038,
    'Abu Dhabi',
    'Abu Dhabi',
    'Sonic Titanium',
    '2 Keys',
    530000.00,
    480000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000038',
    '10000000-0000-0000-0000-000000000038',
    480000.00,
    530000.00,
    5000.00,
    500000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000038',
    '20000000-0000-0000-0000-000000000038',
    'c3333333-3333-3333-3333-333333333333',
    500000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000039',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000039',
    'AUH-1039',
    'ENG-AWA-900039',
    'CAR',
    'Nissan',
    'Patrol Titanium 5.6L V8 4WD',
    2023,
    40470,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000039.pdf',
    100039,
    'Sharjah',
    'Sharjah',
    'Metallic Black',
    '2 Keys',
    295000.00,
    260000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000039',
    '10000000-0000-0000-0000-000000000039',
    260000.00,
    295000.00,
    2000.00,
    270000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000039',
    '20000000-0000-0000-0000-000000000039',
    'c3333333-3333-3333-3333-333333333333',
    270000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000040',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000040',
    'SHJ-1040',
    'ENG-AWA-900040',
    'TRUCK',
    'Isuzu',
    'Forward FVR 12-Ton Heavy Duty Flatbed',
    2023,
    41200,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000040.pdf',
    100040,
    'Dubai',
    'Dubai',
    'Polar White',
    '2 Keys',
    245000.00,
    210000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000040',
    '10000000-0000-0000-0000-000000000040',
    210000.00,
    245000.00,
    1500.00,
    211500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000040',
    '20000000-0000-0000-0000-000000000040',
    'c3333333-3333-3333-3333-333333333333',
    211500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000041',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000041',
    'DXB-1041',
    'ENG-AWA-900041',
    'CAR',
    'Porsche',
    '911 Carrera S PDK Sport Chrono',
    2023,
    41930,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000041.pdf',
    100041,
    'Dubai',
    'Dubai',
    'Guards Red',
    '2 Keys',
    540000.00,
    490000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000041',
    '10000000-0000-0000-0000-000000000041',
    490000.00,
    540000.00,
    5000.00,
    500000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000041',
    '20000000-0000-0000-0000-000000000041',
    'c3333333-3333-3333-3333-333333333333',
    500000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000042',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000042',
    'AUH-1042',
    'ENG-AWA-900042',
    'CAR',
    'BMW',
    'X7 xDrive40i M-Sport 7-Seater',
    2024,
    42660,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000042.pdf',
    100042,
    'Abu Dhabi',
    'Abu Dhabi',
    'Carbon Black',
    '2 Keys',
    420000.00,
    380000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000042',
    '10000000-0000-0000-0000-000000000042',
    380000.00,
    420000.00,
    2500.00,
    387500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000042',
    '20000000-0000-0000-0000-000000000042',
    'c3333333-3333-3333-3333-333333333333',
    387500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000043',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000043',
    'SHJ-1043',
    'ENG-AWA-900043',
    'CAR',
    'Land Rover',
    'Range Rover Autobiography LWB 4.4L V8',
    2023,
    43390,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000043.pdf',
    100043,
    'Dubai',
    'Dubai',
    'Santorini Black',
    '2 Keys',
    680000.00,
    620000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000043',
    '10000000-0000-0000-0000-000000000043',
    620000.00,
    680000.00,
    5000.00,
    640000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000043',
    '20000000-0000-0000-0000-000000000043',
    'c3333333-3333-3333-3333-333333333333',
    640000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000044',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000044',
    'RAK-1044',
    'ENG-AWA-900044',
    'CAR',
    'Audi',
    'RS Q8 4.0 TFSI Quattro Carbon Edition',
    2023,
    44120,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000044.pdf',
    100044,
    'Dubai',
    'Dubai',
    'Nardo Grey',
    '2 Keys',
    510000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000044',
    '10000000-0000-0000-0000-000000000044',
    460000.00,
    510000.00,
    5000.00,
    485000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000044',
    '20000000-0000-0000-0000-000000000044',
    'c3333333-3333-3333-3333-333333333333',
    485000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000045',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000045',
    'AJM-1045',
    'ENG-AWA-900045',
    'TRUCK',
    'BharatBenz',
    '2823R Multi-Axle Rigid Cargo Hauler',
    2023,
    44850,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000045.pdf',
    100045,
    'Abu Dhabi',
    'Abu Dhabi',
    'Yellow Cab',
    '2 Keys',
    320000.00,
    280000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000045',
    '10000000-0000-0000-0000-000000000045',
    280000.00,
    320000.00,
    2000.00,
    282000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000045',
    '20000000-0000-0000-0000-000000000045',
    'c3333333-3333-3333-3333-333333333333',
    282000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000046',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000046',
    'FUJ-1046',
    'ENG-AWA-900046',
    'CAR',
    'Mercedes-Benz',
    'S580 4MATIC Long Maybach Styling',
    2023,
    45580,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000046.pdf',
    100046,
    'Abu Dhabi',
    'Abu Dhabi',
    'Obsidian Black',
    '2 Keys',
    640000.00,
    580000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000046',
    '10000000-0000-0000-0000-000000000046',
    580000.00,
    640000.00,
    5000.00,
    590000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000046',
    '20000000-0000-0000-0000-000000000046',
    'c3333333-3333-3333-3333-333333333333',
    590000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000047',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000047',
    'UAQ-1047',
    'ENG-AWA-900047',
    'CAR',
    'Toyota',
    'Camry Grande Hybrid 2.5L',
    2024,
    46310,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000047.pdf',
    100047,
    'Dubai',
    'Dubai',
    'Silver Metallic',
    '2 Keys',
    130000.00,
    115000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000047',
    '10000000-0000-0000-0000-000000000047',
    115000.00,
    130000.00,
    1000.00,
    118000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000047',
    '20000000-0000-0000-0000-000000000047',
    'c3333333-3333-3333-3333-333333333333',
    118000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000048',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000048',
    'DXB-1048',
    'ENG-AWA-900048',
    'CAR',
    'Lexus',
    'ES 300h Premier Hybrid',
    2023,
    47040,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000048.pdf',
    100048,
    'Sharjah',
    'Sharjah',
    'Caviar',
    '2 Keys',
    198000.00,
    175000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000048',
    '10000000-0000-0000-0000-000000000048',
    175000.00,
    198000.00,
    1500.00,
    181000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000048',
    '20000000-0000-0000-0000-000000000048',
    'c3333333-3333-3333-3333-333333333333',
    181000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000049',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000049',
    'AUH-1049',
    'ENG-AWA-900049',
    'CAR',
    'Tesla',
    'Model X Plaid Tri-Motor AWD',
    2023,
    47770,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000049.pdf',
    100049,
    'Dubai',
    'Dubai',
    'Deep Blue',
    '2 Keys',
    370000.00,
    330000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000049',
    '10000000-0000-0000-0000-000000000049',
    330000.00,
    370000.00,
    2500.00,
    342500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000049',
    '20000000-0000-0000-0000-000000000049',
    'c3333333-3333-3333-3333-333333333333',
    342500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000050',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2022TR0000000050',
    'SHJ-1050',
    'ENG-AWA-900050',
    'TRUCK',
    'Ashok Leyland',
    'Ecomet 1615 HE Intercity Cargo Freighter',
    2022,
    48500,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1586191582056-a6f9f528a7e0?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2022tr0000000050.pdf',
    100050,
    'Sharjah',
    'Sharjah',
    'White',
    '2 Keys',
    230000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000050',
    '10000000-0000-0000-0000-000000000050',
    195000.00,
    230000.00,
    1500.00,
    196500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000050',
    '20000000-0000-0000-0000-000000000050',
    'c3333333-3333-3333-3333-333333333333',
    196500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000051',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000051',
    'DXB-1051',
    'ENG-AWA-900051',
    'CAR',
    'Toyota',
    'Prado TX-L 2.8L Turbo Diesel',
    2024,
    49230,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000051.pdf',
    100051,
    'Dubai',
    'Dubai',
    'Super White',
    '2 Keys',
    220000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000051',
    '10000000-0000-0000-0000-000000000051',
    195000.00,
    220000.00,
    1500.00,
    198000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000051',
    '20000000-0000-0000-0000-000000000051',
    'c3333333-3333-3333-3333-333333333333',
    198000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000052',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000052',
    'AUH-1052',
    'ENG-AWA-900052',
    'CAR',
    'Nissan',
    'Super Safari 4.8L Inline-6 Y61',
    2023,
    49960,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000052.pdf',
    100052,
    'Sharjah',
    'Sharjah',
    'Desert Gold',
    '2 Keys',
    185000.00,
    160000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000052',
    '10000000-0000-0000-0000-000000000052',
    160000.00,
    185000.00,
    1000.00,
    163000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000052',
    '20000000-0000-0000-0000-000000000052',
    'c3333333-3333-3333-3333-333333333333',
    163000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000053',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000053',
    'SHJ-1053',
    'ENG-AWA-900053',
    'CAR',
    'Hyundai',
    'Tucson Ultimate AWD 1.6T',
    2023,
    50690,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000053.pdf',
    100053,
    'Dubai',
    'Dubai',
    'Amazon Grey',
    '2 Keys',
    110000.00,
    95000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000053',
    '10000000-0000-0000-0000-000000000053',
    95000.00,
    110000.00,
    1000.00,
    99000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000053',
    '20000000-0000-0000-0000-000000000053',
    'c3333333-3333-3333-3333-333333333333',
    99000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000054',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000054',
    'RAK-1054',
    'ENG-AWA-900054',
    'CAR',
    'Genesis',
    'GV80 Prestige 3.5L Twin Turbo',
    2024,
    51420,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000054.pdf',
    100054,
    'Abu Dhabi',
    'Abu Dhabi',
    'Cardiff Green',
    '2 Keys',
    310000.00,
    275000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000054',
    '10000000-0000-0000-0000-000000000054',
    275000.00,
    310000.00,
    2000.00,
    285000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000054',
    '20000000-0000-0000-0000-000000000054',
    'c3333333-3333-3333-3333-333333333333',
    285000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000055',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000055',
    'AJM-1055',
    'ENG-AWA-900055',
    'TRUCK',
    'Tata Motors',
    'Signa 4825.TK Heavy Commercial Tipper 16-Wheeler',
    2023,
    52150,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000055.pdf',
    100055,
    'Dubai',
    'Dubai',
    'Tata Orange',
    '2 Keys',
    360000.00,
    310000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000055',
    '10000000-0000-0000-0000-000000000055',
    310000.00,
    360000.00,
    2500.00,
    312500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000055',
    '20000000-0000-0000-0000-000000000055',
    'c3333333-3333-3333-3333-333333333333',
    312500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000056',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000056',
    'FUJ-1056',
    'ENG-AWA-900056',
    'CAR',
    'Lexus',
    'LX600 VIP Edition 3.5L Turbo',
    2024,
    52880,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000056.pdf',
    100056,
    'Abu Dhabi',
    'Abu Dhabi',
    'Sonic Titanium',
    '2 Keys',
    530000.00,
    480000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000056',
    '10000000-0000-0000-0000-000000000056',
    480000.00,
    530000.00,
    5000.00,
    490000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000056',
    '20000000-0000-0000-0000-000000000056',
    'c3333333-3333-3333-3333-333333333333',
    490000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000057',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000057',
    'UAQ-1057',
    'ENG-AWA-900057',
    'CAR',
    'Nissan',
    'Patrol Titanium 5.6L V8 4WD',
    2023,
    53610,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000057.pdf',
    100057,
    'Sharjah',
    'Sharjah',
    'Metallic Black',
    '2 Keys',
    295000.00,
    260000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000057',
    '10000000-0000-0000-0000-000000000057',
    260000.00,
    295000.00,
    2000.00,
    266000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000057',
    '20000000-0000-0000-0000-000000000057',
    'c3333333-3333-3333-3333-333333333333',
    266000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000058',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000058',
    'DXB-1058',
    'ENG-AWA-900058',
    'CAR',
    'Mercedes-Benz',
    'G63 AMG 4.0L V8 Biturbo Magno',
    2024,
    54340,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000058.pdf',
    100058,
    'Dubai',
    'Dubai',
    'Night Black Magno',
    '2 Keys',
    850000.00,
    780000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000058',
    '10000000-0000-0000-0000-000000000058',
    780000.00,
    850000.00,
    10000.00,
    820000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000058',
    '20000000-0000-0000-0000-000000000058',
    'c3333333-3333-3333-3333-333333333333',
    820000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000059',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000059',
    'AUH-1059',
    'ENG-AWA-900059',
    'CAR',
    'Porsche',
    '911 Carrera S PDK Sport Chrono',
    2023,
    55070,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000059.pdf',
    100059,
    'Dubai',
    'Dubai',
    'Guards Red',
    '2 Keys',
    540000.00,
    490000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000059',
    '10000000-0000-0000-0000-000000000059',
    490000.00,
    540000.00,
    5000.00,
    515000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000059',
    '20000000-0000-0000-0000-000000000059',
    'c3333333-3333-3333-3333-333333333333',
    515000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000060',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000060',
    'SHJ-1060',
    'ENG-AWA-900060',
    'TRUCK',
    'Scania',
    'R500 V8 Streamline Long-Haul Tractor',
    2023,
    55800,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000060.pdf',
    100060,
    'Abu Dhabi',
    'Abu Dhabi',
    'Ruby Red',
    '2 Keys',
    525000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000060',
    '10000000-0000-0000-0000-000000000060',
    460000.00,
    525000.00,
    5000.00,
    465000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000060',
    '20000000-0000-0000-0000-000000000060',
    'c3333333-3333-3333-3333-333333333333',
    465000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000061',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000061',
    'DXB-1061',
    'ENG-AWA-900061',
    'CAR',
    'Land Rover',
    'Range Rover Autobiography LWB 4.4L V8',
    2023,
    56530,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000061.pdf',
    100061,
    'Dubai',
    'Dubai',
    'Santorini Black',
    '2 Keys',
    680000.00,
    620000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000061',
    '10000000-0000-0000-0000-000000000061',
    620000.00,
    680000.00,
    5000.00,
    630000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000061',
    '20000000-0000-0000-0000-000000000061',
    'c3333333-3333-3333-3333-333333333333',
    630000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000062',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000062',
    'AUH-1062',
    'ENG-AWA-900062',
    'CAR',
    'Audi',
    'RS Q8 4.0 TFSI Quattro Carbon Edition',
    2023,
    57260,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000062.pdf',
    100062,
    'Dubai',
    'Dubai',
    'Nardo Grey',
    '2 Keys',
    510000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000062',
    '10000000-0000-0000-0000-000000000062',
    460000.00,
    510000.00,
    5000.00,
    475000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000062',
    '20000000-0000-0000-0000-000000000062',
    'c3333333-3333-3333-3333-333333333333',
    475000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000063',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000063',
    'SHJ-1063',
    'ENG-AWA-900063',
    'CAR',
    'Cadillac',
    'Escalade Sport Platinum 6.2L V8',
    2024,
    57990,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000063.pdf',
    100063,
    'Sharjah',
    'Sharjah',
    'Crystal White',
    '2 Keys',
    495000.00,
    450000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000063',
    '10000000-0000-0000-0000-000000000063',
    450000.00,
    495000.00,
    2500.00,
    460000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000063',
    '20000000-0000-0000-0000-000000000063',
    'c3333333-3333-3333-3333-333333333333',
    460000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000064',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000064',
    'RAK-1064',
    'ENG-AWA-900064',
    'CAR',
    'Mercedes-Benz',
    'S580 4MATIC Long Maybach Styling',
    2023,
    58720,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000064.pdf',
    100064,
    'Abu Dhabi',
    'Abu Dhabi',
    'Obsidian Black',
    '2 Keys',
    640000.00,
    580000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000064',
    '10000000-0000-0000-0000-000000000064',
    580000.00,
    640000.00,
    5000.00,
    605000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000064',
    '20000000-0000-0000-0000-000000000064',
    'c3333333-3333-3333-3333-333333333333',
    605000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000065',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024TR0000000065',
    'AJM-1065',
    'ENG-AWA-900065',
    'TRUCK',
    'Volvo Trucks',
    'FH16 750 Heavy Haulage Prime Mover 6x4',
    2024,
    59450,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024tr0000000065.pdf',
    100065,
    'Dubai',
    'Dubai',
    'Ocean Blue',
    '2 Keys',
    590000.00,
    520000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000065',
    '10000000-0000-0000-0000-000000000065',
    520000.00,
    590000.00,
    5000.00,
    525000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000065',
    '20000000-0000-0000-0000-000000000065',
    'c3333333-3333-3333-3333-333333333333',
    525000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000066',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000066',
    'FUJ-1066',
    'ENG-AWA-900066',
    'CAR',
    'Lexus',
    'ES 300h Premier Hybrid',
    2023,
    60180,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000066.pdf',
    100066,
    'Sharjah',
    'Sharjah',
    'Caviar',
    '2 Keys',
    198000.00,
    175000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000066',
    '10000000-0000-0000-0000-000000000066',
    175000.00,
    198000.00,
    1500.00,
    178000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000066',
    '20000000-0000-0000-0000-000000000066',
    'c3333333-3333-3333-3333-333333333333',
    178000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000067',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000067',
    'UAQ-1067',
    'ENG-AWA-900067',
    'CAR',
    'Tesla',
    'Model X Plaid Tri-Motor AWD',
    2023,
    60910,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000067.pdf',
    100067,
    'Dubai',
    'Dubai',
    'Deep Blue',
    '2 Keys',
    370000.00,
    330000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000067',
    '10000000-0000-0000-0000-000000000067',
    330000.00,
    370000.00,
    2500.00,
    337500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000067',
    '20000000-0000-0000-0000-000000000067',
    'c3333333-3333-3333-3333-333333333333',
    337500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000068',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000068',
    'DXB-1068',
    'ENG-AWA-900068',
    'CAR',
    'Porsche',
    'Taycan Turbo S Electric Performance',
    2023,
    61640,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000068.pdf',
    100068,
    'Abu Dhabi',
    'Abu Dhabi',
    'Frozen Blue',
    '2 Keys',
    490000.00,
    440000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000068',
    '10000000-0000-0000-0000-000000000068',
    440000.00,
    490000.00,
    5000.00,
    460000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000068',
    '20000000-0000-0000-0000-000000000068',
    'c3333333-3333-3333-3333-333333333333',
    460000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000069',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000069',
    'AUH-1069',
    'ENG-AWA-900069',
    'CAR',
    'Toyota',
    'Prado TX-L 2.8L Turbo Diesel',
    2024,
    62370,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000069.pdf',
    100069,
    'Dubai',
    'Dubai',
    'Super White',
    '2 Keys',
    220000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000069',
    '10000000-0000-0000-0000-000000000069',
    195000.00,
    220000.00,
    1500.00,
    202500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000069',
    '20000000-0000-0000-0000-000000000069',
    'c3333333-3333-3333-3333-333333333333',
    202500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000070',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000070',
    'SHJ-1070',
    'ENG-AWA-900070',
    'TRUCK',
    'Isuzu',
    'Forward FVR 12-Ton Heavy Duty Flatbed',
    2023,
    63100,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000070.pdf',
    100070,
    'Dubai',
    'Dubai',
    'Polar White',
    '2 Keys',
    245000.00,
    210000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000070',
    '10000000-0000-0000-0000-000000000070',
    210000.00,
    245000.00,
    1500.00,
    211500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000070',
    '20000000-0000-0000-0000-000000000070',
    'c3333333-3333-3333-3333-333333333333',
    211500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000071',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000071',
    'DXB-1071',
    'ENG-AWA-900071',
    'CAR',
    'Hyundai',
    'Tucson Ultimate AWD 1.6T',
    2023,
    63830,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000071.pdf',
    100071,
    'Dubai',
    'Dubai',
    'Amazon Grey',
    '2 Keys',
    110000.00,
    95000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000071',
    '10000000-0000-0000-0000-000000000071',
    95000.00,
    110000.00,
    1000.00,
    97000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000071',
    '20000000-0000-0000-0000-000000000071',
    'c3333333-3333-3333-3333-333333333333',
    97000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000072',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000072',
    'AUH-1072',
    'ENG-AWA-900072',
    'CAR',
    'Genesis',
    'GV80 Prestige 3.5L Twin Turbo',
    2024,
    64560,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000072.pdf',
    100072,
    'Abu Dhabi',
    'Abu Dhabi',
    'Cardiff Green',
    '2 Keys',
    310000.00,
    275000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000072',
    '10000000-0000-0000-0000-000000000072',
    275000.00,
    310000.00,
    2000.00,
    281000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000072',
    '20000000-0000-0000-0000-000000000072',
    'c3333333-3333-3333-3333-333333333333',
    281000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000073',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000073',
    'SHJ-1073',
    'ENG-AWA-900073',
    'CAR',
    'Toyota',
    'Land Cruiser 300 VXR 3.5L Twin Turbo',
    2024,
    65290,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000073.pdf',
    100073,
    'Dubai',
    'Dubai',
    'Pearl White',
    '2 Keys',
    390000.00,
    340000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000073',
    '10000000-0000-0000-0000-000000000073',
    340000.00,
    390000.00,
    2500.00,
    350000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000073',
    '20000000-0000-0000-0000-000000000073',
    'c3333333-3333-3333-3333-333333333333',
    350000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000074',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000074',
    'RAK-1074',
    'ENG-AWA-900074',
    'CAR',
    'Lexus',
    'LX600 VIP Edition 3.5L Turbo',
    2024,
    66020,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000074.pdf',
    100074,
    'Abu Dhabi',
    'Abu Dhabi',
    'Sonic Titanium',
    '2 Keys',
    530000.00,
    480000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000074',
    '10000000-0000-0000-0000-000000000074',
    480000.00,
    530000.00,
    5000.00,
    505000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000074',
    '20000000-0000-0000-0000-000000000074',
    'c3333333-3333-3333-3333-333333333333',
    505000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000075',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000075',
    'AJM-1075',
    'ENG-AWA-900075',
    'TRUCK',
    'BharatBenz',
    '2823R Multi-Axle Rigid Cargo Hauler',
    2023,
    66750,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000075.pdf',
    100075,
    'Abu Dhabi',
    'Abu Dhabi',
    'Yellow Cab',
    '2 Keys',
    320000.00,
    280000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000075',
    '10000000-0000-0000-0000-000000000075',
    280000.00,
    320000.00,
    2000.00,
    282000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000075',
    '20000000-0000-0000-0000-000000000075',
    'c3333333-3333-3333-3333-333333333333',
    282000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000076',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000076',
    'FUJ-1076',
    'ENG-AWA-900076',
    'CAR',
    'Mercedes-Benz',
    'G63 AMG 4.0L V8 Biturbo Magno',
    2024,
    67480,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000076.pdf',
    100076,
    'Dubai',
    'Dubai',
    'Night Black Magno',
    '2 Keys',
    850000.00,
    780000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000076',
    '10000000-0000-0000-0000-000000000076',
    780000.00,
    850000.00,
    10000.00,
    800000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000076',
    '20000000-0000-0000-0000-000000000076',
    'c3333333-3333-3333-3333-333333333333',
    800000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000077',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000077',
    'UAQ-1077',
    'ENG-AWA-900077',
    'CAR',
    'Porsche',
    '911 Carrera S PDK Sport Chrono',
    2023,
    68210,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000077.pdf',
    100077,
    'Dubai',
    'Dubai',
    'Guards Red',
    '2 Keys',
    540000.00,
    490000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000077',
    '10000000-0000-0000-0000-000000000077',
    490000.00,
    540000.00,
    5000.00,
    505000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000077',
    '20000000-0000-0000-0000-000000000077',
    'c3333333-3333-3333-3333-333333333333',
    505000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000078',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000078',
    'DXB-1078',
    'ENG-AWA-900078',
    'CAR',
    'BMW',
    'X7 xDrive40i M-Sport 7-Seater',
    2024,
    68940,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000078.pdf',
    100078,
    'Abu Dhabi',
    'Abu Dhabi',
    'Carbon Black',
    '2 Keys',
    420000.00,
    380000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000078',
    '10000000-0000-0000-0000-000000000078',
    380000.00,
    420000.00,
    2500.00,
    390000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000078',
    '20000000-0000-0000-0000-000000000078',
    'c3333333-3333-3333-3333-333333333333',
    390000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000079',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000079',
    'AUH-1079',
    'ENG-AWA-900079',
    'CAR',
    'Land Rover',
    'Range Rover Autobiography LWB 4.4L V8',
    2023,
    69670,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000079.pdf',
    100079,
    'Dubai',
    'Dubai',
    'Santorini Black',
    '2 Keys',
    680000.00,
    620000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000079',
    '10000000-0000-0000-0000-000000000079',
    620000.00,
    680000.00,
    5000.00,
    645000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000079',
    '20000000-0000-0000-0000-000000000079',
    'c3333333-3333-3333-3333-333333333333',
    645000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000080',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2022TR0000000080',
    'SHJ-1080',
    'ENG-AWA-900080',
    'TRUCK',
    'Ashok Leyland',
    'Ecomet 1615 HE Intercity Cargo Freighter',
    2022,
    70400,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1586191582056-a6f9f528a7e0?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2022tr0000000080.pdf',
    100080,
    'Sharjah',
    'Sharjah',
    'White',
    '2 Keys',
    230000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000080',
    '10000000-0000-0000-0000-000000000080',
    195000.00,
    230000.00,
    1500.00,
    196500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000080',
    '20000000-0000-0000-0000-000000000080',
    'c3333333-3333-3333-3333-333333333333',
    196500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000081',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000081',
    'DXB-1081',
    'ENG-AWA-900081',
    'CAR',
    'Cadillac',
    'Escalade Sport Platinum 6.2L V8',
    2024,
    71130,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000081.pdf',
    100081,
    'Sharjah',
    'Sharjah',
    'Crystal White',
    '2 Keys',
    495000.00,
    450000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000081',
    '10000000-0000-0000-0000-000000000081',
    450000.00,
    495000.00,
    2500.00,
    455000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000081',
    '20000000-0000-0000-0000-000000000081',
    'c3333333-3333-3333-3333-333333333333',
    455000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000082',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000082',
    'AUH-1082',
    'ENG-AWA-900082',
    'CAR',
    'Mercedes-Benz',
    'S580 4MATIC Long Maybach Styling',
    2023,
    71860,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000082.pdf',
    100082,
    'Abu Dhabi',
    'Abu Dhabi',
    'Obsidian Black',
    '2 Keys',
    640000.00,
    580000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000082',
    '10000000-0000-0000-0000-000000000082',
    580000.00,
    640000.00,
    5000.00,
    595000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000082',
    '20000000-0000-0000-0000-000000000082',
    'c3333333-3333-3333-3333-333333333333',
    595000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000083',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000083',
    'SHJ-1083',
    'ENG-AWA-900083',
    'CAR',
    'Toyota',
    'Camry Grande Hybrid 2.5L',
    2024,
    72590,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000083.pdf',
    100083,
    'Dubai',
    'Dubai',
    'Silver Metallic',
    '2 Keys',
    130000.00,
    115000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000083',
    '10000000-0000-0000-0000-000000000083',
    115000.00,
    130000.00,
    1000.00,
    119000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000083',
    '20000000-0000-0000-0000-000000000083',
    'c3333333-3333-3333-3333-333333333333',
    119000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000084',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000084',
    'RAK-1084',
    'ENG-AWA-900084',
    'CAR',
    'Lexus',
    'ES 300h Premier Hybrid',
    2023,
    73320,
    'HYBRID',
    ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000084.pdf',
    100084,
    'Sharjah',
    'Sharjah',
    'Caviar',
    '2 Keys',
    198000.00,
    175000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000084',
    '10000000-0000-0000-0000-000000000084',
    175000.00,
    198000.00,
    1500.00,
    182500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000084',
    '20000000-0000-0000-0000-000000000084',
    'c3333333-3333-3333-3333-333333333333',
    182500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000085',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000085',
    'AJM-1085',
    'ENG-AWA-900085',
    'TRUCK',
    'Tata Motors',
    'Signa 4825.TK Heavy Commercial Tipper 16-Wheeler',
    2023,
    74050,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000085.pdf',
    100085,
    'Dubai',
    'Dubai',
    'Tata Orange',
    '2 Keys',
    360000.00,
    310000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000085',
    '10000000-0000-0000-0000-000000000085',
    310000.00,
    360000.00,
    2500.00,
    312500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000085',
    '20000000-0000-0000-0000-000000000085',
    'c3333333-3333-3333-3333-333333333333',
    312500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000086',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000086',
    'FUJ-1086',
    'ENG-AWA-900086',
    'CAR',
    'Porsche',
    'Taycan Turbo S Electric Performance',
    2023,
    74780,
    'ELECTRIC',
    ARRAY['https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000086.pdf',
    100086,
    'Abu Dhabi',
    'Abu Dhabi',
    'Frozen Blue',
    '2 Keys',
    490000.00,
    440000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000086',
    '10000000-0000-0000-0000-000000000086',
    440000.00,
    490000.00,
    5000.00,
    450000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000086',
    '20000000-0000-0000-0000-000000000086',
    'c3333333-3333-3333-3333-333333333333',
    450000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000087',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000087',
    'UAQ-1087',
    'ENG-AWA-900087',
    'CAR',
    'Toyota',
    'Prado TX-L 2.8L Turbo Diesel',
    2024,
    75510,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000087.pdf',
    100087,
    'Dubai',
    'Dubai',
    'Super White',
    '2 Keys',
    220000.00,
    195000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000087',
    '10000000-0000-0000-0000-000000000087',
    195000.00,
    220000.00,
    1500.00,
    199500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000087',
    '20000000-0000-0000-0000-000000000087',
    'c3333333-3333-3333-3333-333333333333',
    199500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000088',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000088',
    'DXB-1088',
    'ENG-AWA-900088',
    'CAR',
    'Nissan',
    'Super Safari 4.8L Inline-6 Y61',
    2023,
    76240,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000088.pdf',
    100088,
    'Sharjah',
    'Sharjah',
    'Desert Gold',
    '2 Keys',
    185000.00,
    160000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000088',
    '10000000-0000-0000-0000-000000000088',
    160000.00,
    185000.00,
    1000.00,
    164000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000088',
    '20000000-0000-0000-0000-000000000088',
    'c3333333-3333-3333-3333-333333333333',
    164000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000089',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000089',
    'AUH-1089',
    'ENG-AWA-900089',
    'CAR',
    'Hyundai',
    'Tucson Ultimate AWD 1.6T',
    2023,
    76970,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000089.pdf',
    100089,
    'Dubai',
    'Dubai',
    'Amazon Grey',
    '2 Keys',
    110000.00,
    95000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000089',
    '10000000-0000-0000-0000-000000000089',
    95000.00,
    110000.00,
    1000.00,
    100000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000089',
    '20000000-0000-0000-0000-000000000089',
    'c3333333-3333-3333-3333-333333333333',
    100000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000090',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000090',
    'SHJ-1090',
    'ENG-AWA-900090',
    'TRUCK',
    'Scania',
    'R500 V8 Streamline Long-Haul Tractor',
    2023,
    77700,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000090.pdf',
    100090,
    'Abu Dhabi',
    'Abu Dhabi',
    'Ruby Red',
    '2 Keys',
    525000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000090',
    '10000000-0000-0000-0000-000000000090',
    460000.00,
    525000.00,
    5000.00,
    465000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000090',
    '20000000-0000-0000-0000-000000000090',
    'c3333333-3333-3333-3333-333333333333',
    465000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000091',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000091',
    'DXB-1091',
    'ENG-AWA-900091',
    'CAR',
    'Toyota',
    'Land Cruiser 300 VXR 3.5L Twin Turbo',
    2024,
    78430,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000091.pdf',
    100091,
    'Dubai',
    'Dubai',
    'Pearl White',
    '2 Keys',
    390000.00,
    340000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000091',
    '10000000-0000-0000-0000-000000000091',
    340000.00,
    390000.00,
    2500.00,
    345000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000091',
    '20000000-0000-0000-0000-000000000091',
    'c3333333-3333-3333-3333-333333333333',
    345000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000092',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000092',
    'AUH-1092',
    'ENG-AWA-900092',
    'CAR',
    'Lexus',
    'LX600 VIP Edition 3.5L Turbo',
    2024,
    79160,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000092.pdf',
    100092,
    'Abu Dhabi',
    'Abu Dhabi',
    'Sonic Titanium',
    '2 Keys',
    530000.00,
    480000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000092',
    '10000000-0000-0000-0000-000000000092',
    480000.00,
    530000.00,
    5000.00,
    495000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000092',
    '20000000-0000-0000-0000-000000000092',
    'c3333333-3333-3333-3333-333333333333',
    495000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000093',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000093',
    'SHJ-1093',
    'ENG-AWA-900093',
    'CAR',
    'Nissan',
    'Patrol Titanium 5.6L V8 4WD',
    2023,
    79890,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000093.pdf',
    100093,
    'Sharjah',
    'Sharjah',
    'Metallic Black',
    '2 Keys',
    295000.00,
    260000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000093',
    '10000000-0000-0000-0000-000000000093',
    260000.00,
    295000.00,
    2000.00,
    268000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000093',
    '20000000-0000-0000-0000-000000000093',
    'c3333333-3333-3333-3333-333333333333',
    268000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000094',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000094',
    'RAK-1094',
    'ENG-AWA-900094',
    'CAR',
    'Mercedes-Benz',
    'G63 AMG 4.0L V8 Biturbo Magno',
    2024,
    80620,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000094.pdf',
    100094,
    'Dubai',
    'Dubai',
    'Night Black Magno',
    '2 Keys',
    850000.00,
    780000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000094',
    '10000000-0000-0000-0000-000000000094',
    780000.00,
    850000.00,
    10000.00,
    830000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000094',
    '20000000-0000-0000-0000-000000000094',
    'c3333333-3333-3333-3333-333333333333',
    830000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000095',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024TR0000000095',
    'AJM-1095',
    'ENG-AWA-900095',
    'TRUCK',
    'Volvo Trucks',
    'FH16 750 Heavy Haulage Prime Mover 6x4',
    2024,
    81350,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024tr0000000095.pdf',
    100095,
    'Dubai',
    'Dubai',
    'Ocean Blue',
    '2 Keys',
    590000.00,
    520000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000095',
    '10000000-0000-0000-0000-000000000095',
    520000.00,
    590000.00,
    5000.00,
    525000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000095',
    '20000000-0000-0000-0000-000000000095',
    'c3333333-3333-3333-3333-333333333333',
    525000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000096',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000096',
    'FUJ-1096',
    'ENG-AWA-900096',
    'CAR',
    'BMW',
    'X7 xDrive40i M-Sport 7-Seater',
    2024,
    82080,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000096.pdf',
    100096,
    'Abu Dhabi',
    'Abu Dhabi',
    'Carbon Black',
    '2 Keys',
    420000.00,
    380000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000096',
    '10000000-0000-0000-0000-000000000096',
    380000.00,
    420000.00,
    2500.00,
    385000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000096',
    '20000000-0000-0000-0000-000000000096',
    'c3333333-3333-3333-3333-333333333333',
    385000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000097',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000097',
    'UAQ-1097',
    'ENG-AWA-900097',
    'CAR',
    'Land Rover',
    'Range Rover Autobiography LWB 4.4L V8',
    2023,
    82810,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000097.pdf',
    100097,
    'Dubai',
    'Dubai',
    'Santorini Black',
    '2 Keys',
    680000.00,
    620000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000097',
    '10000000-0000-0000-0000-000000000097',
    620000.00,
    680000.00,
    5000.00,
    635000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000097',
    '20000000-0000-0000-0000-000000000097',
    'c3333333-3333-3333-3333-333333333333',
    635000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000098',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023CA0000000098',
    'DXB-1098',
    'ENG-AWA-900098',
    'CAR',
    'Audi',
    'RS Q8 4.0 TFSI Quattro Carbon Edition',
    2023,
    83540,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023ca0000000098.pdf',
    100098,
    'Dubai',
    'Dubai',
    'Nardo Grey',
    '2 Keys',
    510000.00,
    460000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000098',
    '10000000-0000-0000-0000-000000000098',
    460000.00,
    510000.00,
    5000.00,
    480000.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000098',
    '20000000-0000-0000-0000-000000000098',
    'c3333333-3333-3333-3333-333333333333',
    480000.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000099',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2024CA0000000099',
    'AUH-1099',
    'ENG-AWA-900099',
    'CAR',
    'Cadillac',
    'Escalade Sport Platinum 6.2L V8',
    2024,
    84270,
    'PETROL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2024ca0000000099.pdf',
    100099,
    'Sharjah',
    'Sharjah',
    'Crystal White',
    '2 Keys',
    495000.00,
    450000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000099',
    '10000000-0000-0000-0000-000000000099',
    450000.00,
    495000.00,
    2500.00,
    462500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000099',
    '20000000-0000-0000-0000-000000000099',
    'c3333333-3333-3333-3333-333333333333',
    462500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';


INSERT INTO vehicles (
    id, seller_id, vin, registration_number, engine_number, vehicle_type,
    make, model, manufacturing_year, odometer_reading_km, fuel_type,
    media_paths, inspection_report_url, lot_no, branch, location, color,
    no_of_keys, target_selling_price, minimum_selling_price, status, wf_activity_id
)
VALUES (
    '10000000-0000-0000-0000-000000000100',
    'b2222222-2222-2222-2222-222222222222',
    'AWA2023TR0000000100',
    'SHJ-1100',
    'ENG-AWA-900100',
    'TRUCK',
    'Isuzu',
    'Forward FVR 12-Ton Heavy Duty Flatbed',
    2023,
    85000,
    'DIESEL',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'],
    'https://inspection.alwataneya.ae/reports/awa2023tr0000000100.pdf',
    100100,
    'Dubai',
    'Dubai',
    'Polar White',
    '2 Keys',
    245000.00,
    210000.00,
    'APPROVED',
    'COMPLETED'
) ON CONFLICT (vin) DO UPDATE SET 
    model = EXCLUDED.model, 
    make = EXCLUDED.make,
    vehicle_type = EXCLUDED.vehicle_type,
    status = 'APPROVED',
    media_paths = EXCLUDED.media_paths,
    lot_no = EXCLUDED.lot_no,
    branch = EXCLUDED.branch;

INSERT INTO auctions (
    id, vehicle_id, start_price, reserve_price, min_bid_increment,
    current_highest_bid, highest_bidder_id, start_time, end_time,
    status, auction_type, version
)
VALUES (
    '20000000-0000-0000-0000-000000000100',
    '10000000-0000-0000-0000-000000000100',
    210000.00,
    245000.00,
    1500.00,
    211500.00,
    'c3333333-3333-3333-3333-333333333333',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'ACTIVE',
    'ONLINE',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET 
    status = 'ACTIVE',
    auction_type = 'ONLINE',
    start_time = CURRENT_TIMESTAMP - INTERVAL '1 hour',
    end_time = CURRENT_TIMESTAMP + INTERVAL '30 days',
    current_highest_bid = EXCLUDED.current_highest_bid,
    highest_bidder_id = EXCLUDED.highest_bidder_id,
    version = 1;

INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000100',
    '20000000-0000-0000-0000-000000000100',
    'c3333333-3333-3333-3333-333333333333',
    211500.00,
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET
    bid_amount = EXCLUDED.bid_amount,
    status = 'ACCEPTED';

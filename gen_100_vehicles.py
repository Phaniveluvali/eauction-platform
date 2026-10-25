import uuid
import random
from datetime import datetime, timedelta

# List of realistic high-demand vehicles in UAE & GCC auctions
MAKES_MODELS_CARS = [
    ("Toyota", "Land Cruiser 300 VXR 3.5L Twin Turbo", "PETROL", 2024, 340000, 390000, 2500, "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800"),
    ("Lexus", "LX600 VIP Edition 3.5L Turbo", "PETROL", 2024, 480000, 530000, 5000, "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"),
    ("Nissan", "Patrol Titanium 5.6L V8 4WD", "PETROL", 2023, 260000, 295000, 2000, "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"),
    ("Mercedes-Benz", "G63 AMG 4.0L V8 Biturbo Magno", "PETROL", 2024, 780000, 850000, 10000, "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800"),
    ("Porsche", "911 Carrera S PDK Sport Chrono", "PETROL", 2023, 490000, 540000, 5000, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"),
    ("BMW", "X7 xDrive40i M-Sport 7-Seater", "PETROL", 2024, 380000, 420000, 2500, "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800"),
    ("Land Rover", "Range Rover Autobiography LWB 4.4L V8", "PETROL", 2023, 620000, 680000, 5000, "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800"),
    ("Audi", "RS Q8 4.0 TFSI Quattro Carbon Edition", "PETROL", 2023, 460000, 510000, 5000, "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800"),
    ("Cadillac", "Escalade Sport Platinum 6.2L V8", "PETROL", 2024, 450000, 495000, 2500, "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"),
    ("Mercedes-Benz", "S580 4MATIC Long Maybach Styling", "HYBRID", 2023, 580000, 640000, 5000, "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800"),
    ("Toyota", "Camry Grande Hybrid 2.5L", "HYBRID", 2024, 115000, 130000, 1000, "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800"),
    ("Lexus", "ES 300h Premier Hybrid", "HYBRID", 2023, 175000, 198000, 1500, "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800"),
    ("Tesla", "Model X Plaid Tri-Motor AWD", "ELECTRIC", 2023, 330000, 370000, 2500, "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800"),
    ("Porsche", "Taycan Turbo S Electric Performance", "ELECTRIC", 2023, 440000, 490000, 5000, "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800"),
    ("Toyota", "Prado TX-L 2.8L Turbo Diesel", "DIESEL", 2024, 195000, 220000, 1500, "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"),
    ("Nissan", "Super Safari 4.8L Inline-6 Y61", "PETROL", 2023, 160000, 185000, 1000, "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"),
    ("Hyundai", "Tucson Ultimate AWD 1.6T", "PETROL", 2023, 95000, 110000, 1000, "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800"),
    ("Genesis", "GV80 Prestige 3.5L Twin Turbo", "PETROL", 2024, 275000, 310000, 2000, "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800")
]

MAKES_MODELS_TRUCKS = [
    ("Tata Motors", "Signa 4825.TK Heavy Commercial Tipper 16-Wheeler", "DIESEL", 2023, 310000, 360000, 2500, "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"),
    ("Ashok Leyland", "Ecomet 1615 HE Intercity Cargo Freighter", "DIESEL", 2022, 195000, 230000, 1500, "https://images.unsplash.com/photo-1586191582056-a6f9f528a7e0?auto=format&fit=crop&q=80&w=800"),
    ("BharatBenz", "2823R Multi-Axle Rigid Cargo Hauler", "DIESEL", 2023, 280000, 320000, 2000, "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"),
    ("Isuzu", "Forward FVR 12-Ton Heavy Duty Flatbed", "DIESEL", 2023, 210000, 245000, 1500, "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"),
    ("Volvo Trucks", "FH16 750 Heavy Haulage Prime Mover 6x4", "DIESEL", 2024, 520000, 590000, 5000, "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800"),
    ("Scania", "R500 V8 Streamline Long-Haul Tractor", "DIESEL", 2023, 460000, 525000, 5000, "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800")
]

SELLER_ID = "b2222222-2222-2222-2222-222222222222"
BUYER_ID = "c3333333-3333-3333-3333-333333333333"

sql_lines = []
sql_lines.append("-- =============================================================================")
sql_lines.append("-- 100 REALISTIC ONLINE AUCTION VEHICLES & SCHEDULED AUCTIONS SEED")
sql_lines.append("-- =============================================================================")

# Ensure seeded users with bcrypt Welcome@123
sql_lines.append("""
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
""")

cities = ['DXB', 'AUH', 'SHJ', 'RAK', 'AJM', 'MH12', 'DL01', 'KA05', 'TS09', 'TN01']

for i in range(1, 101):
    v_id = f"10000000-0000-0000-0000-{i:012d}"
    a_id = f"20000000-0000-0000-0000-{i:012d}"
    b_id = f"30000000-0000-0000-0000-{i:012d}"

    is_truck = (i % 5 == 0)
    pool = MAKES_MODELS_TRUCKS if is_truck else MAKES_MODELS_CARS
    tmpl = pool[(i - 1) % len(pool)]

    make, model, fuel, year, start_p, res_p, inc_p, img_url = tmpl
    v_type = 'TRUCK' if is_truck else 'CAR'
    vin = f"AWA{year}{v_type[:2]}{i:010d}"
    reg_prefix = cities[(i - 1) % len(cities)]
    reg_no = f"{reg_prefix}-{1000 + i}"
    eng_no = f"ENG-AWA-{900000 + i}"
    odo = round(12000 + (i * 730) % 95000, 2)
    rep_url = f"https://inspection.alwataneya.ae/reports/{vin.lower()}.pdf"

    # Status distribution:
    # i <= 60: ACTIVE (Currently live bidding)
    # 61 <= i <= 85: PENDING (Upcoming auctions starting in 1h-24h)
    # 86 <= i <= 100: ENDED (Historical/Concluded)
    if i <= 60:
        status = 'ACTIVE'
        start_time = f"CURRENT_TIMESTAMP - INTERVAL '{1 + (i % 12)} hours'"
        end_time = f"CURRENT_TIMESTAMP + INTERVAL '{12 + (i % 60)} hours'"
        num_bids = 1 + (i % 6)
        curr_bid = start_p + (num_bids * inc_p)
    elif i <= 85:
        status = 'PENDING'
        start_time = f"CURRENT_TIMESTAMP + INTERVAL '{1 + (i % 24)} hours'"
        end_time = f"CURRENT_TIMESTAMP + INTERVAL '{48 + (i % 24)} hours'"
        curr_bid = start_p
        num_bids = 0
    else:
        status = 'ENDED'
        start_time = f"CURRENT_TIMESTAMP - INTERVAL '{72 + (i % 24)} hours'"
        end_time = f"CURRENT_TIMESTAMP - INTERVAL '{1 + (i % 12)} hours'"
        curr_bid = res_p + (inc_p * 2)
        num_bids = 3

    sql_lines.append(f"""
INSERT INTO vehicles (id, seller_id, vin, registration_number, engine_number, vehicle_type, make, model, manufacturing_year, odometer_reading_km, fuel_type, media_paths, inspection_report_url)
VALUES (
    '{v_id}',
    '{SELLER_ID}',
    '{vin}',
    '{reg_no}',
    '{eng_no}',
    '{v_type}',
    '{make}',
    '{model}',
    {year},
    {odo},
    '{fuel}',
    ARRAY['{img_url}'],
    '{rep_url}'
) ON CONFLICT (vin) DO UPDATE SET model = EXCLUDED.model, make = EXCLUDED.make;

INSERT INTO auctions (id, vehicle_id, start_price, reserve_price, min_bid_increment, current_highest_bid, highest_bidder_id, start_time, end_time, status, version)
VALUES (
    '{a_id}',
    '{v_id}',
    {start_p:.2f},
    {res_p:.2f},
    {inc_p:.2f},
    {curr_bid:.2f},
    '{BUYER_ID}',
    {start_time},
    {end_time},
    '{status}',
    1
) ON CONFLICT (vehicle_id) DO UPDATE SET status = EXCLUDED.status, current_highest_bid = EXCLUDED.current_highest_bid;
""")

    if num_bids > 0:
        sql_lines.append(f"""
INSERT INTO bids (id, auction_id, bidder_id, bid_amount, status, created_at)
VALUES (
    '{b_id}',
    '{a_id}',
    '{BUYER_ID}',
    {curr_bid:.2f},
    'ACCEPTED',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
) ON CONFLICT (id) DO NOTHING;
""")

with open('seed_100_vehicles.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines))

print("seed_100_vehicles.sql generated successfully with 100 vehicles and auctions!")

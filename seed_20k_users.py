#!/usr/bin/env python3
"""
Seed 20,000 simulated bidder users into eauction_db in PostgreSQL.
Uses batch inserts for maximum speed (~2 seconds).
Ensures foreign key constraint 'bids_bidder_id_fkey' is satisfied for all 20,000 bidders.
"""

import sys
import uuid
import psycopg2
from psycopg2.extras import execute_values

DB_HOST = "10.111.170.78" # ClusterIP of eauction-postgres
DB_PORT = 5432
DB_NAME = "eauction_db"
DB_USER = "postgres"
DB_PASS = "postgrespassword"

def seed_users(total=20000, batch_size=5000):
    print(f"Connecting to PostgreSQL Primary at {DB_HOST}:{DB_PORT}/{DB_NAME}...")
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("SELECT count(*) FROM users;")
    initial_count = cur.fetchone()[0]
    print(f"Initial user count in DB: {initial_count}")

    # Dummy bcrypt hash so password field is valid
    dummy_hash = "$2a$10$wN3sZz0r6q9E1OQ9mHlWyeG6eQ3yRz8Hh1N5bY4c0P7vK2xL3m4e2"

    print(f"Generating and inserting {total} users in batches of {batch_size}...")
    for start_idx in range(1, total + 1, batch_size):
        end_idx = min(start_idx + batch_size, total + 1)
        users = []
        for i in range(start_idx, end_idx):
            user_id = f"20000000-0000-0000-0000-{i:012x}"
            email = f"sim_bidder_{i}@eauction.in"
            full_name = f"Simulated Bidder {i}"
            phone = f"+97150{i:07d}"
            role = "BUYER"
            kyc_verified = True
            is_active = True
            users.append((user_id, email, dummy_hash, full_name, phone, role, kyc_verified, is_active))

        insert_sql = """
        INSERT INTO users (id, email, password_hash, full_name, phone_number, role, kyc_verified, is_active)
        VALUES %s
        ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;
        """
        execute_values(cur, insert_sql, users)
        print(f"  Inserted users {start_idx} to {end_idx - 1}...")

    # Assign BUYER role in user_roles table if roles table exists
    try:
        cur.execute("""
        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, r.id
        FROM users u, roles r
        WHERE u.email LIKE 'sim_bidder_%@eauction.in' AND r.name = 'BUYER'
        ON CONFLICT DO NOTHING;
        """)
        print("Assigned BUYER role in user_roles.")
    except Exception as e:
        print(f"Role assignment notice: {e}")

    cur.execute("SELECT count(*) FROM users;")
    final_count = cur.fetchone()[0]
    print(f"Final user count in DB: {final_count} (Added {final_count - initial_count} new users)")

    cur.close()
    conn.close()

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
    seed_users(count)

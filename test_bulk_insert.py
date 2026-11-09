import subprocess
import random

FIRST_NAMES = [
    "Mohammed", "Ahmed", "Rashid", "Sultan", "Khalid", "Fatima", "Maryam", "Zayed", "Hamad", "Saeed",
    "Abdullah", "Mansoor", "Omar", "Ali", "Humaid", "Nasser", "Salem", "Tariq", "Hassan", "Yousef",
    "Rajesh", "Vikram", "Suresh", "Priya", "Ananya", "David", "Michael", "Sarah", "Elena", "Arthur"
]
LAST_NAMES = [
    "Al Nuaimi", "Al Mansoori", "Al Zaabi", "Al Shamsi", "Al Mazrouei", "Al Falasi", "Al Maktoum", "Al Nahyan",
    "Al Qasimi", "Al Suwaidi", "Sharma", "Verma", "Patel", "Khan", "Choudhury", "Smith", "Johnson", "Al Ketbi"
]
CITIES = ["Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Ajman, UAE", "Ras Al Khaimah, UAE", "Fujairah, UAE", "Riyadh, KSA"]
DEVICES = ["Desktop", "Mobile", "Tablet"]
SCREENS = ["Live Auction Room", "Vehicle Catalog", "Watchlist", "Live Bidding Room", "Vehicle Inspection", "Active Auctions"]

POD_A = "eauction-bidding-engine-9d9cb8cf4-479z9"
POD_B = "eauction-bidding-engine-9d9cb8cf4-kgtcj"
POD_C = "eauction-bidding-engine-9d9cb8cf4-qttrc"

values = []
for i in range(1, 1001):
    uid = f"usr-buyer-{i:04d}"
    dev = DEVICES[i % len(DEVICES)]
    sid = f"sess-{uid}-{dev.lower()}"
    fname = FIRST_NAMES[(i * 7) % len(FIRST_NAMES)]
    lname = LAST_NAMES[(i * 13) % len(LAST_NAMES)]
    name = f"{fname} {lname}"
    email = f"buyer{i:04d}@alwataneya.ae"
    loc = CITIES[i % len(CITIES)]
    screen = SCREENS[i % len(SCREENS)]
    
    if i <= 400:
        pod = POD_A
    elif i <= 750:
        pod = POD_B
    else:
        pod = POD_C
        
    dep = random.choice([5000, 10000, 20000, 50000, 100000])
    limit = dep * 200
    used = random.randint(0, int(limit * 0.35))
    bids = random.randint(0, 15)
    proto = "WSS" if bids > 0 else "HTTPS"
    pub_ip = f"202.153.{random.randint(10, 250)}.{random.randint(2, 254)}"
    priv_ip = f"192.168.{(i % 8) + 1}.{(i % 240) + 10}"
    ping = round(random.uniform(0.8, 3.5), 1)
    
    values.append(f"('{sid}', '{uid}', '{name}', '{email}', 'BUYER', '{pub_ip}', '{loc}', 'AE', '{dev}', 'Chrome 124.0', 'Windows 11', '{proto}', '{pod}', '172.16.138.78', '{screen}', {dep}, {limit}, {used}, {bids}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, {ping}, 'ONLINE', '{priv_ip}')")

# Write SQL to a temp file and execute it with psql -f
with open("/home/nodejs/eauction-workspace/bulk_sessions.sql", "w") as f:
    f.write("INSERT INTO user_sessions (id, user_id, user_name, email, role, ip_address, location, country_code, device_type, browser, os, protocol, pod_name, pod_ip, current_screen, security_deposit, bidding_limit, used_bidding_limit, bids_placed_in_session, login_time, last_heartbeat, ping_ms, status, client_ip) VALUES \n")
    f.write(",\n".join(values))
    f.write("\nON CONFLICT (user_id, device_type) DO UPDATE SET pod_name = EXCLUDED.pod_name, last_heartbeat = CURRENT_TIMESTAMP, status = 'ONLINE';\n")

print("Wrote bulk_sessions.sql with", len(values), "rows.")

# Copy into postgres pod and execute
subprocess.run(["kubectl", "cp", "/home/nodejs/eauction-workspace/bulk_sessions.sql", "eauction/eauction-postgres-0:/tmp/bulk_sessions.sql"], check=True)
res = subprocess.run(["kubectl", "exec", "eauction-postgres-0", "-n", "eauction", "--", "psql", "-U", "postgres", "-d", "eauction_db", "-f", "/tmp/bulk_sessions.sql"], capture_output=True, text=True)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout[-200:] if res.stdout else "none")
print("Stderr:", res.stderr if res.stderr else "none")

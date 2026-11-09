#!/usr/bin/env python3
"""
OmniTax / Al Wataneya E-Auction Platform
Continuous 1,000 Concurrent User Load & Session Swapping Generator
Maintains 1,000 live active buyer sessions distributed across Kubernetes Bidding Pods
"""

import time
import random
import json
import urllib.request
import urllib.error
import ssl
import subprocess
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://127.0.0.1:30443"
TOTAL_USERS = 1000

POD_A = "eauction-bidding-engine-9d9cb8cf4-479z9"
POD_B = "eauction-bidding-engine-9d9cb8cf4-kgtcj"
POD_C = "eauction-bidding-engine-9d9cb8cf4-qttrc"
ALL_PODS = [POD_A, POD_B, POD_C]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

SESSIONS = []

def load_sessions_from_db():
    global SESSIONS
    print("[INIT] Fetching 1,000 buyer sessions from PostgreSQL...")
    sql = """
        SELECT json_agg(t) FROM (
            SELECT 
                id as "sessionId", 
                user_id as "userId", 
                user_name as "userName", 
                email, 
                role, 
                device_type as "deviceType", 
                browser, 
                os, 
                protocol, 
                pod_name as "podName", 
                pod_ip as "podIp", 
                current_screen as "currentScreen", 
                security_deposit as "securityDeposit", 
                bidding_limit as "biddingLimit", 
                used_bidding_limit as "usedBiddingLimit", 
                bids_placed_in_session as "bidsPlacedInSession", 
                ip_address as "ipAddress", 
                client_ip as "clientIp",
                location,
                country_code as "countryCode"
            FROM user_sessions 
            WHERE user_id LIKE 'usr-buyer-%' 
            ORDER BY id
            LIMIT 1000
        ) t;
    """
    cmd = [
        "kubectl", "exec", "-i", "eauction-postgres-0", "-n", "eauction", "--",
        "psql", "-U", "postgres", "-d", "eauction_db", "-t", "-A", "-c", sql
    ]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode == 0 and p.stdout.strip():
        try:
            SESSIONS = json.loads(p.stdout.strip())
            print(f"[INIT] Successfully loaded {len(SESSIONS)} active buyer sessions from database.")
            return
        except Exception as e:
            print(f"[WARN] Failed to parse JSON from DB: {e}")
    
    print("[WARN] Falling back to programmatic generation...")
    # Deterministic fallback matching bulk_sessions.sql schema
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
    SCREENS = ["Live Auction Room", "Vehicle Catalog", "Watchlist", "Live Bidding Room", "Vehicle Inspection", "Active Auctions"]
    DEVS = ["Mobile", "Tablet", "Desktop"]

    SESSIONS = []
    for i in range(1, TOTAL_USERS + 1):
        uid = f"usr-buyer-{i:04d}"
        fname = FIRST_NAMES[(i * 7) % len(FIRST_NAMES)]
        lname = LAST_NAMES[(i * 13) % len(LAST_NAMES)]
        uname = f"{fname} {lname}"
        email = f"buyer{i:04d}@alwataneya.ae"
        
        if i <= 400:
            pod = POD_A
        elif i <= 750:
            pod = POD_B
        else:
            pod = POD_C
            
        dev_type = DEVS[(i - 1) % 3]
        sess_id = f"sess-{uid}-{dev_type.lower()}"
        
        browser = "Safari 17.4" if dev_type == "Mobile" else ("Chrome 124.0" if dev_type == "Tablet" else "Edge 123.0")
        os_name = "iOS 17" if dev_type == "Mobile" else ("Android 14" if dev_type == "Tablet" else "Windows 11")
        deposit = 5000 if i % 4 == 0 else (10000 if i % 4 == 1 else (20000 if i % 4 == 2 else 50000))
        bidding_limit = deposit * 200
        used_limit = int(bidding_limit * 0.25)
        bids_count = (i % 12) + 1
        
        SESSIONS.append({
            "id": sess_id, "sessionId": sess_id,
            "userId": uid,
            "userName": uname,
            "email": email,
            "role": "BUYER",
            "currentScreen": SCREENS[i % len(SCREENS)],
            "deviceType": dev_type,
            "browser": browser,
            "os": os_name,
            "protocol": "WSS",
            "location": CITIES[i % len(CITIES)],
            "countryCode": "AE",
            "podName": pod,
            "podIp": "172.16.138.78",
            "securityDeposit": deposit,
            "biddingLimit": bidding_limit,
            "usedBiddingLimit": used_limit,
            "bidsPlacedInSession": bids_count,
            "ipAddress": f"202.153.{100 + (i % 150)}.{(i % 250) + 2}",
            "clientIp": f"192.168.{(i % 8) + 1}.{(i % 240) + 10}"
        })
    print(f"[INIT] Generated fallback {len(SESSIONS)} sessions.")

def send_heartbeat(s):
    try:
        url = f"{BASE_URL}/api/v1/sessions/heartbeat"
        data = json.dumps(s).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "Host": "tecnics-internal.online"}, method="POST")
        with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
            return resp.status == 200
    except Exception:
        return False

def sync_active_pods():
    """Queries backend to detect any manual or bulk pod migrations done by admin"""
    try:
        url = f"{BASE_URL}/api/v1/sessions/live"
        req = urllib.request.Request(url, headers={"Accept": "application/json", "Host": "tecnics-internal.online"})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                live = data.get("sessions", [])
                pod_map = {item.get("id"): item.get("podName") for item in live if item.get("id")}
                swapped_count = 0
                for s in SESSIONS:
                    sid = s.get("sessionId")
                    if sid in pod_map and pod_map[sid] and pod_map[sid] != s["podName"]:
                        s["podName"] = pod_map[sid]
                        swapped_count += 1
                if swapped_count > 0:
                    print(f"[{time.strftime('%H:%M:%S')}] Detected and adopted {swapped_count} live pod migrations from Admin Console!")
    except Exception as e:
        pass

def main():
    load_sessions_from_db()
    
    print(f"[{time.strftime('%H:%M:%S')}] Starting continuous 1,000 Live User session loop...")
    cycle = 0
    with ThreadPoolExecutor(max_workers=50) as executor:
        while True:
            cycle += 1
            start = time.time()
            
            # Send heartbeat for all 1,000 users in parallel
            results = list(executor.map(send_heartbeat, SESSIONS))
            ok_count = sum(1 for r in results if r)
            duration = time.time() - start
            
            # Count current pod distribution
            pod_counts = {p: 0 for p in ALL_PODS}
            for s in SESSIONS:
                pname = s.get("podName")
                if pname in pod_counts:
                    pod_counts[pname] += 1
                else:
                    pod_counts[pname] = 1
            
            counts_str = " | ".join([f"{k.split('-')[-1]}: {v}" for k, v in pod_counts.items() if 'bidding-engine' in k])
            print(f"[{time.strftime('%H:%M:%S')}] Cycle #{cycle}: {ok_count}/1000 OK ({duration:.2f}s) | Pods: {counts_str}")
            
            # Synchronize active pod assignments so admin migrations persist across heartbeats
            sync_active_pods()
            
            # Sleep 8 seconds before next cycle (heartbeats expire after 120s, so 8s gives 100% active state)
            time.sleep(8)

if __name__ == "__main__":
    main()

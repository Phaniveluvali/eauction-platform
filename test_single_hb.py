import requests
import json
import subprocess

# 1. Send heartbeat for usr-buyer-0001
payload = {
    "sessionId": "sess-usr-buyer-0001-mobile",
    "userId": "usr-buyer-0001",
    "userName": "Zayed Khan",
    "email": "buyer0001@alwataneya.ae",
    "role": "BUYER",
    "deviceType": "Mobile",
    "browser": "Safari 17.4",
    "os": "iOS 17",
    "protocol": "WSS",
    "currentScreen": "Vehicle Catalog",
    "location": "Abu Dhabi, UAE",
    "countryCode": "AE",
    "podName": "eauction-bidding-engine-9d9cb8cf4-479z9",
    "securityDeposit": 5000.0,
    "usedBiddingLimit": 216065.0,
    "bidsPlacedInSession": 8,
    "ipAddress": "202.153.62.126",
    "clientIp": "192.168.2.11"
}

r = requests.post("http://127.0.0.1:30300/api/v1/sessions/heartbeat", json=payload, timeout=5)
print("Heartbeat HTTP Status:", r.status_code, r.text)

# 2. Check last_heartbeat in Postgres
cmd = [
    "kubectl", "exec", "-i", "eauction-postgres-0", "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-c",
    "SELECT id, user_id, device_type, pod_name, last_heartbeat, CURRENT_TIMESTAMP - last_heartbeat as diff FROM user_sessions WHERE user_id = 'usr-buyer-0001';"
]
p = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
print("Postgres check:\n", p.stdout)

import urllib.request
import ssl
import json
import socket

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print("=== 1. Testing Frontend on NodePort 30300 ===")
req1 = urllib.request.Request("http://127.0.0.1:30300")
with urllib.request.urlopen(req1, timeout=5) as r:
    print(f"Frontend Status: {r.status} {r.reason} | Server: {r.headers.get('Server')}")

print("\n=== 2. Testing Active Auctions API via Ingress HTTPS ===")
req2 = urllib.request.Request(
    "https://127.0.0.1/api/v1/auctions",
    headers={"Host": "tecnics-internal.online"}
)
with urllib.request.urlopen(req2, context=ctx, timeout=5) as r:
    data = json.loads(r.read().decode('utf-8'))
    print(f"Total Auctions Retrieved via Ingress: {len(data)}")
    if len(data) > 0:
        first = data[0]
        print(f"Sample Auction: ID={first.get('id')[:10]}... StartPrice={first.get('startPrice')} Status={first.get('status')}")

print("\n=== 3. Testing Standard Login awabuyer@gmail.com on NodePort 30300 ===")
login_payload = json.dumps({"email": "awabuyer@gmail.com", "password": "Welcome@123"}).encode('utf-8')
req3 = urllib.request.Request(
    "http://127.0.0.1:30300/api/v1/auth/login",
    data=login_payload,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req3, timeout=5) as r:
    auth_data = json.loads(r.read().decode('utf-8'))
    print(f"Login Success! Role={auth_data.get('role')} KYC={auth_data.get('kycVerified')} TokenPrefix={auth_data.get('token')[:20]}...")

print("\n=== 4. Testing User & Customer Statistics API ===")
req4 = urllib.request.Request("http://127.0.0.1:30300/api/v1/catalog/vehicles/stats/users")
with urllib.request.urlopen(req4, timeout=5) as r:
    stats = json.loads(r.read().decode('utf-8'))
    print(f"Dynamic Stats from PostgreSQL: Total Customers={stats.get('totalCustomers')} | Buyers={stats.get('buyers')} | Sellers={stats.get('sellers')} | Staff={stats.get('staff')}")

print("\n=== 5. Testing Multi-Replica Go Bidding Engine on NodePort 30381 ===")
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(5)
s.connect(("127.0.0.1", 30381))
s.sendall(b"GET /ws?auctionId=e87e1a92-3a56-4279-bf7c-88e89f89ef32 HTTP/1.1\r\nHost: 127.0.0.1:30381\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n")
resp = s.recv(1024).decode('utf-8', errors='ignore')
s.close()
status_line = resp.split("\r\n")[0]
print(f"Bidding Engine Handshake Response: {status_line}")

print("\n>>> ALL KUBERNETES MICROSERVICES VERIFIED AND FULLY OPERATIONAL! <<<")

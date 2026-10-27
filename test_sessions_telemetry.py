import requests
import json
import time

payload = {
    'userId': 'vmxadmin@tecnics.com',
    'userName': 'VMX Super Administrator',
    'email': 'vmxadmin@tecnics.com',
    'role': 'ADMIN',
    'deviceType': 'Desktop',
    'browser': 'Chrome (Windows)',
    'os': 'Windows 11',
    'protocol': 'HTTPS',
    'location': 'Dubai, UAE',
    'ipAddress': '49.43.222.164',
    'clientIp': '192.168.1.105',
    'clientPrivateIp': '192.168.1.105',
    'currentScreen': 'Admin > Operations'
}

t0 = time.time()
hb_res = requests.post('http://10.104.0.119:8080/api/v1/sessions/heartbeat', json=payload)
hb_time = (time.time() - t0) * 1000
print(f'Heartbeat Response ({hb_time:.2f}ms): {hb_res.json()}')

t1 = time.time()
live_res = requests.get('http://10.104.0.119:8080/api/v1/sessions/live')
live_time = (time.time() - t1) * 1000
data = live_res.json()
print(f'Get Live Sessions Response ({live_time:.2f}ms): totalUsers={data.get( totalUsers)}')

for s in data.get('sessions', []):
    print(f'User: {s.get(userName)}, WAN IP: {s.get(ipAddress)}, CLIENT LAN IP: {s.get(clientIp)}, Heartbeat: {s.get(lastHeartbeat)}')

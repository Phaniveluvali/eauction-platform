import requests
import json

try:
    r = requests.get('http://127.0.0.1:30300/api/v1/sessions/live', timeout=10)
    print("Status code:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        print("totalUsers:", data.get('totalUsers'))
        print("activeBidders:", data.get('activeBidders'))
        print("bidsPlaced:", data.get('bidsPlaced'))
        print("totalVolumeUSD:", data.get('totalVolumeUSD'))
        print("podDistribution:", data.get('podDistribution'))
        sessions = data.get('sessions', [])
        print("sessions count:", len(sessions))
        if sessions:
            print("First session:", sessions[0])
            print("Last session:", sessions[-1])
    else:
        print("Response:", r.text[:300])
except Exception as e:
    print("Error:", e)

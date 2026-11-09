import requests
import urllib3
urllib3.disable_warnings()

headers = {"Host": "tecnics-internal.online"}
r_active = requests.get("https://127.0.0.1:30443/api/v1/ai/marketing/active-promo", headers=headers, verify=False)
print("Active Promo HTTP Status:", r_active.status_code)
print("Active Promo JSON:\n", r_active.json())

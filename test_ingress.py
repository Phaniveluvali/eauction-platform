import requests

url = "http://127.0.0.1:30080/api/v1/ai/marketing/broadcast"
headers = {
    "Host": "tecnics-internal.online",
    "Content-Type": "application/json"
}

payload = {
    "title_en": "Weekend Flash Promotion",
    "title_ar": "عرض خاطف لنهاية الأسبوع",
    "body_en": "50% discount on buyer platform fees for all SUVs in Sharjah and Dubai auctions.",
    "body_ar": "خصم 50% على عمولة المشتري لجميع سيارات الدفع الرباعي في مزادات دبي والشارقة.",
    "cta_en": "Bid Now",
    "cta_ar": "زايد الآن",
    "discount_pct": 50,
    "badge_en": "LIMITED OFFER",
    "badge_ar": "عرض محدود",
    "duration_minutes": 1440,
    "target_audience": "ALL_ACTIVE_BUYERS"
}

r = requests.post(url, headers=headers, json=payload, timeout=10)
print("Broadcast via Ingress (30080) Status:", r.status_code)
print("Response JSON:\n", r.json())

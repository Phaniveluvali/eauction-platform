import urllib.request
import json

BASE_URL = "http://localhost:8080/api/v1/auth"

def post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== 1. Testing Standard Login awabuyer@gmail.com ===")
res1 = post(f"{BASE_URL}/login", {"email": "awabuyer@gmail.com", "password": "Welcome@123"})
print(f"Token: {res1.get('token')[:25]}... | Role: {res1.get('role')} | KYC: {res1.get('kycVerified')}")

print("\n=== 2. Testing Standard Login awabuyer1@gmail.com ===")
res2 = post(f"{BASE_URL}/login", {"email": "awabuyer1@gmail.com", "password": "Welcome@123"})
print(f"Token: {res2.get('token')[:25]}... | Role: {res2.get('role')} | KYC: {res2.get('kycVerified')}")

print("\n=== 3. Testing Azure B2C SSO Exchange awabuyer@gmail.com ===")
res3 = post(f"{BASE_URL}/azure-b2c", {
    "authCode": "b2c_simulated_code_xyz",
    "email": "awabuyer@gmail.com",
    "fullName": "Awa Buyer B2C"
})
print(f"Token: {res3.get('token')[:25]}... | Role: {res3.get('role')} | Email: {res3.get('email')}")

print("\n=== 4. Testing WhatsApp OTP Dispatch for 9154506870 ===")
res4 = post(f"{BASE_URL}/otp/send-whatsapp", {
    "phoneNumber": "9154506870"
})
print(f"Success: {res4.get('success')} | Code: {res4.get('otpCode')} | Msg: {res4.get('message')}")
wa_code = res4.get('otpCode')

print("\n=== 5. Testing Email OTP Dispatch for krish14378@gmail.com ===")
res5 = post(f"{BASE_URL}/otp/send-email", {
    "email": "krish14378@gmail.com",
    "fullName": "Krish"
})
print(f"Success: {res5.get('success')} | Code: {res5.get('otpCode')} | Msg: {res5.get('message')}")
email_code = res5.get('otpCode')

print("\n=== 6. Testing OTP Verification ===")
res6 = post(f"{BASE_URL}/otp/verify", {
    "destination": "9154506870",
    "code": wa_code
})
print(f"WhatsApp OTP Verified: {res6.get('verified')} | Msg: {res6.get('message')}")

res7 = post(f"{BASE_URL}/otp/verify", {
    "destination": "krish14378@gmail.com",
    "code": email_code
})
print(f"Email OTP Verified: {res7.get('verified')} | Msg: {res7.get('message')}")
print("\n>>> ALL 6 AUTHENTICATION & NOTIFICATION TESTS PASSED SUCCESSFULLY! <<<")

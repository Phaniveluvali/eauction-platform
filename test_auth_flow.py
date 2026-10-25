import json
import urllib.request

def post_json(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body

print("--- 1. Testing Standard Login: awabuyer@gmail.com ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/login', {
    'email': 'awabuyer@gmail.com',
    'password': 'Welcome@123'
})
print(f"Status: {code} | Email: {resp.get('email')} | Role: {resp.get('role')} | KYC: {resp.get('kycVerified')} | Token Length: {len(resp.get('token', ''))}")

print("\n--- 2. Testing Azure B2C SSO Exchange: awabuyer@gmail.com ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/azure-b2c', {
    'email': 'awabuyer@gmail.com',
    'fullName': 'AWA Azure B2C Buyer',
    'b2cObjectId': 'b2c_awabuyer_obj_id'
})
print(f"Status: {code} | Email: {resp.get('email')} | Roles: {resp.get('roles')} | SuperAdmin: {resp.get('superAdmin')}")

print("\n--- 3. Testing WhatsApp OTP: +919154506870 ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/otp/send-whatsapp', {
    'phoneNumber': '+919154506870'
})
print(f"Status: {code} | otpCode: {resp.get('otpCode')} | Message: {resp.get('message')}")

print("\n--- 4. Testing Email OTP: krish14378@gmail.com ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/otp/send-email', {
    'email': 'krish14378@gmail.com',
    'fullName': 'Krish'
})
email_otp = resp.get('otpCode')
print(f"Status: {code} | otpCode: {email_otp} | Message: {resp.get('message')}")

print("\n--- 5. Testing OTP Verification: krish14378@gmail.com ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/otp/verify', {
    'destination': 'krish14378@gmail.com',
    'code': email_otp
})
print(f"Status: {code} | Verified: {resp.get('verified')} | Message: {resp.get('message')}")

print("\n--- 6. Testing Standard Login: krish14378@gmail.com ---")
code, resp = post_json('http://localhost:8080/api/v1/auth/login', {
    'email': 'krish14378@gmail.com',
    'password': 'Welcome@123'
})
print(f"Status: {code} | Email: {resp.get('email')} | Role: {resp.get('role')}")

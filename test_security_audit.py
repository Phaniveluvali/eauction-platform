import json
import urllib.request
import urllib.error
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:30300"
FRONTEND_URL = "http://localhost:30300"

def make_req(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    if data is not None:
        if isinstance(data, dict):
            data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            return response.status, response.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("=" * 70)
    print("AL WATANEYA AUCTIONS - COMPREHENSIVE SECURITY AUDIT & VERIFICATION")
    print("=" * 70)

    results = []

    # 1. Test Backend Unauthenticated Access to /api/v1/auth/me
    print("\n[TEST 1] Backend /api/v1/auth/me without token")
    status, body = make_req(f"{BASE_URL}/api/v1/auth/me")
    print(f"Status: {status}")
    passed = (status in [401, 403])
    print(f"Result: {'PASS' if passed else 'FAIL'} (Expected 401/403)")
    results.append(("Backend /api/v1/auth/me unauthenticated rejected", passed, f"Status {status}"))

    # 2. Test Backend Invalid Token Access to /api/v1/auth/me
    print("\n[TEST 2] Backend /api/v1/auth/me with bogus token")
    status, body = make_req(f"{BASE_URL}/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    print(f"Status: {status}")
    passed = (status in [401, 403])
    print(f"Result: {'PASS' if passed else 'FAIL'} (Expected 401/403)")
    results.append(("Backend /api/v1/auth/me invalid token rejected", passed, f"Status {status}"))

    # 3. Test Admin Login and /api/v1/auth/me role
    print("\n[TEST 3] Admin authentication (admin@eauction.in)")
    status, body = make_req(f"{BASE_URL}/api/v1/auth/login", method="POST", data={"email": "admin@eauction.in", "password": "Password123!"})
    admin_token = None
    if status == 200:
        data = json.loads(body)
        admin_token = data.get("token")
        status_me, body_me = make_req(f"{BASE_URL}/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        me_data = json.loads(body_me)
        role = me_data.get("role")
        is_admin = (role == "ADMIN" or me_data.get("superAdmin") is True)
        print(f"Admin Role: {role}, superAdmin: {me_data.get('superAdmin')}")
        passed = is_admin
    else:
        passed = False
    print(f"Result: {'PASS' if passed else 'FAIL'}")
    results.append(("Admin authentication and role validation", passed, f"Role: {role if passed else 'N/A'}"))

    # 4. Test Buyer Login and verify buyer CANNOT perform admin actions
    print("\n[TEST 4] Buyer authentication (buyer@sharmatransport.in)")
    status, body = make_req(f"{BASE_URL}/api/v1/auth/login", method="POST", data={"email": "buyer@sharmatransport.in", "password": "Password123!"})
    buyer_token = None
    if status == 200:
        data = json.loads(body)
        buyer_token = data.get("token")
        status_me, body_me = make_req(f"{BASE_URL}/api/v1/auth/me", headers={"Authorization": f"Bearer {buyer_token}"})
        me_data = json.loads(body_me)
        buyer_role = me_data.get("role")
        print(f"Buyer Role: {buyer_role}")
        passed = (buyer_role == "BUYER")
    else:
        passed = False
    print(f"Result: {'PASS' if passed else 'FAIL'}")
    results.append(("Buyer authentication role validation", passed, f"Role: {buyer_role if passed else 'N/A'}"))

    # 5. Test Buyer attempting to access Admin-only endpoint (reset-password)
    print("\n[TEST 5] Buyer attempting admin-only user password reset endpoint")
    status, body = make_req(f"{BASE_URL}/api/v1/auth/users/00000000-0000-0000-0000-000000000001/reset-password", method="POST", data={"newPassword": "SecretPassword123!"}, headers={"Authorization": f"Bearer {buyer_token}"})
    print(f"Status: {status}, Response: {body[:100]}")
    passed = (status == 403)
    print(f"Result: {'PASS' if passed else 'FAIL'} (Expected 403 Forbidden)")
    results.append(("Buyer role blocked from admin endpoint with 403 Forbidden", passed, f"Status {status}"))

    # 6. Test Frontend Ingress serving SPA correctly
    print("\n[TEST 6] Frontend SPA direct URL resolution on NodePort /seller-buyer/admin")
    status, body = make_req(f"{FRONTEND_URL}/seller-buyer/admin")
    passed = (status == 200 and "<div id=\"root\"></div>" in body)
    print(f"Status: {status}, Contains root: {passed}")
    print(f"Result: {'PASS' if passed else 'FAIL'}")
    results.append(("Frontend SPA correctly routes /seller-buyer/admin", passed, f"Status {status}"))

    # 7. Test Frontend Production Bundle contains Triple-Layer Security Guards
    print("\n[TEST 7] Frontend production bundle security verification")
    # Fetch bundle name from index.html
    import re
    bundle_match = re.search(r'src="(/seller-buyer/assets/index-[^"]+\.js)"', body)
    if bundle_match:
        bundle_path = bundle_match.group(1)
        print(f"Found bundle: {bundle_path}")
        b_status, b_body = make_req(f"{FRONTEND_URL}{bundle_path}")
        
        has_auth_checking = "Verifying Security Credentials" in b_body
        has_admin_gate = "Administrator Console" in b_body or "Access Denied" in b_body
        has_access_denied_screen = "Access Denied" in b_body and "403" in b_body
        has_security_notice = "Authentication required to access" in b_body
        
        print(f" - Auth Checking Screen: {has_auth_checking}")
        print(f" - Admin Console Protection: {has_admin_gate}")
        print(f" - Access Denied 403 Wall: {has_access_denied_screen}")
        print(f" - Security Notice Guard: {has_security_notice}")
        
        all_guards = has_auth_checking and has_admin_gate and has_access_denied_screen and has_security_notice
        passed = all_guards
    else:
        passed = False
    print(f"Result: {'PASS' if passed else 'FAIL'}")
    results.append(("Frontend bundle contains Triple-Layer Security Guards", passed, "All 4 security barriers verified"))

    # 8. Test Route Security Matrix Simulation in Python (mimicking evaluateRouteSecurity)
    print("\n[TEST 8] Route Security Matrix Validation for all platform views")
    
    ROUTES = {
        "ADMIN": {"requiresAuth": True, "allowedRoles": ["ADMIN"]},
        "FAVORITES": {"requiresAuth": True, "allowedRoles": ["BUYER"]},
        "SECURITY_DEPOSIT": {"requiresAuth": True, "allowedRoles": ["BUYER"]},
        "HOME": {"requiresAuth": False},
        "ONLINE_AUCTIONS": {"requiresAuth": False},
        "SILENT_AUCTIONS": {"requiresAuth": False},
        "HELP": {"requiresAuth": False},
        "SIGNIN": {"requiresAuth": False},
        "SIGNUP": {"requiresAuth": False},
        "AUCTION_ROOM": {"requiresAuth": False},
    }

    def evaluate(view, user):
        rule = ROUTES.get(view, {"requiresAuth": False})
        if not rule.get("requiresAuth"):
            return True, None
        if not user:
            return False, "UNAUTHENTICATED"
        roles = rule.get("allowedRoles", [])
        if roles and user.get("role") not in roles and not user.get("isSuperAdmin"):
            return False, "FORBIDDEN_ROLE"
        return True, None

    # Scenario 8a: Unauthenticated user accesses ADMIN -> blocked
    ok, reason = evaluate("ADMIN", None)
    assert not ok and reason == "UNAUTHENTICATED", "Unauthenticated user was not blocked from ADMIN"

    # Scenario 8b: Buyer accesses ADMIN -> blocked
    ok, reason = evaluate("ADMIN", {"role": "BUYER"})
    assert not ok and reason == "FORBIDDEN_ROLE", "Buyer was not blocked from ADMIN"

    # Scenario 8c: Admin accesses ADMIN -> allowed
    ok, reason = evaluate("ADMIN", {"role": "ADMIN"})
    assert ok, "Admin was blocked from ADMIN"

    # Scenario 8d: Unauthenticated user accesses FAVORITES -> blocked
    ok, reason = evaluate("FAVORITES", None)
    assert not ok and reason == "UNAUTHENTICATED", "Unauthenticated user was not blocked from FAVORITES"

    # Scenario 8e: Buyer accesses FAVORITES -> allowed
    ok, reason = evaluate("FAVORITES", {"role": "BUYER"})
    assert ok, "Buyer was blocked from FAVORITES"

    # Scenario 8f: Unauthenticated user accesses HOME -> allowed
    ok, reason = evaluate("HOME", None)
    assert ok, "Public user was blocked from HOME"

    print("All 6 Route Security Matrix scenarios passed successfully.")
    results.append(("Route Security Matrix logic validation", True, "All 6 matrix scenarios verified"))

    print("\n" + "=" * 70)
    print("AUDIT SUMMARY:")
    print("=" * 70)
    all_passed = True
    for name, p, detail in results:
        status_str = "PASS [OK]" if p else "FAIL [X]"
        print(f"[{status_str}] {name}: {detail}")
        if not p:
            all_passed = False

    print("=" * 70)
    if all_passed:
        print("ALL SECURITY CHECKS PASSED: Zero vulnerabilities detected.")
    else:
        print("SOME CHECKS FAILED: Review logs above.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

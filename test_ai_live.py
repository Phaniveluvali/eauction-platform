import urllib.request
import json
import time

def test_health():
    print("\n--- 1. Testing AI Health ---")
    req = urllib.request.Request("http://10.111.224.28:8000/api/v1/ai/health")
    with urllib.request.urlopen(req, timeout=10) as r:
        print(f"Health Response: {r.read().decode('utf-8')}")

def test_finance_overview():
    print("\n--- 2. Testing Financial Overview (Read Replica DB) ---")
    t0 = time.time()
    req = urllib.request.Request("http://10.111.224.28:8000/api/v1/ai/finance/overview?fiscal_year=2026")
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        print(f"Elapsed: {time.time()-t0:.2f}s")
        print(f"Fiscal Year: {data.get('fiscal_year')}")
        print(f"Total GMV: AED {data.get('summary', {}).get('total_gmv', 0):,.2f}")
        print(f"Gross Revenue: AED {data.get('summary', {}).get('gross_revenue', 0):,.2f}")
        print(f"Net Profit: AED {data.get('summary', {}).get('net_profit', 0):,.2f} ({data.get('summary', {}).get('net_profit_margin_pct', 0)}% margin)")

def test_failed_transactions():
    print("\n--- 3. Testing Failed Transactions Intelligence ---")
    t0 = time.time()
    req = urllib.request.Request("http://10.111.224.28:8000/api/v1/ai/finance/failed-transactions")
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode('utf-8'))
        print(f"Elapsed: {time.time()-t0:.2f}s")
        print(f"Revenue at Risk: AED {data.get('total_revenue_at_risk_aed', 0):,.2f}")
        print(f"Recovery Rate: {data.get('recovery_success_rate_pct')}%")
        print(f"Failed Count: {len(data.get('recent_failed_transactions', []))}")

def test_concierge_chat():
    print("\n--- 4. Testing 24/7 Universal Customer Concierge Chat ---")
    t0 = time.time()
    payload = {
        "messages": [
            {"role": "user", "content": "How does the security deposit work for bidding on an SUV?"}
        ],
        "user_context": {"role": "BUYER", "security_deposit": 5000}
    }
    req = urllib.request.Request(
        "http://10.111.224.28:8000/api/v1/ai/concierge/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.loads(r.read().decode("utf-8"))
        print(f"Elapsed: {time.time()-t0:.2f}s")
        print(f"Concierge Reply:\n{data.get('reply', '')}")
        print(f"Suggested Actions: {data.get('suggested_actions', [])}")
        print(f"Embedded Vehicles Count: {len(data.get('embedded_vehicles', []))}")

def test_boardroom_report():
    print("\n--- 5. Testing Executive Boardroom Report Generation (Qwen-2.5) ---")
    t0 = time.time()
    req = urllib.request.Request(
        "http://10.111.224.28:8000/api/v1/ai/finance/generate-boardroom-report",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode("utf-8"))
        print(f"Elapsed: {time.time()-t0:.2f}s")
        print("Boardroom Report Preview (first 600 chars):")
        print(data.get("report_markdown", "")[:600])

if __name__ == "__main__":
    test_health()
    test_finance_overview()
    test_failed_transactions()
    test_concierge_chat()
    test_boardroom_report()

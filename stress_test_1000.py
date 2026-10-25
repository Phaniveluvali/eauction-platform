import asyncio
import json
import math
import os
import ssl
import sys
import time
import jwt
import websockets
import aiohttp

JWT_SECRET = "eauction_secret_jwt_signing_key_32bytes_minimum_length_production_ready_value!"
AUCTION_ID = "20000000-0000-0000-0000-000000000005"
BASE_HTTP_URL = "http://127.0.0.1:30300"      # NodePort 30300 (Frontend / API reverse proxy)
BASE_WS_URL = "ws://127.0.0.1:30381"        # NodePort 30381 (Go Bidding Engine)
CONCURRENT_USERS = 1000

def generate_tokens(count):
    """Pre-generate JWT tokens for distinct users with valid claims"""
    print(f"Generating {count} unique JWT tokens for simulated bidders...")
    tokens = []
    now = int(time.time())
    for i in range(1, count + 1):
        user_id = f"user-sim-{i:04d}"
        payload = {
            "sub": user_id,
            "userId": user_id,
            "email": f"buyer_{i}@eauction.ae",
            "role": "BUYER",
            "roles": ["ROLE_BUYER"],
            "iat": now,
            "exp": now + 86400
        }
        tok = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        tokens.append((user_id, tok))
    return tokens

def calculate_percentiles(latencies):
    if not latencies:
        return {"count": 0, "mean": 0, "p50": 0, "p90": 0, "p95": 0, "p99": 0, "min": 0, "max": 0}
    sorted_l = sorted(latencies)
    n = len(sorted_l)
    return {
        "count": n,
        "mean": sum(sorted_l) / n,
        "p50": sorted_l[int(n * 0.50)],
        "p90": sorted_l[int(n * 0.90)],
        "p95": sorted_l[int(n * 0.95)],
        "p99": sorted_l[int(n * 0.99)],
        "min": sorted_l[0],
        "max": sorted_l[-1]
    }

async def phase1_concurrent_login_test(session, num_users=1000):
    """Phase 1: Stress test HTTP auth endpoint under 1000 concurrent login attempts"""
    print(f"\n==================================================================")
    print(f"PHASE 1: STRESS TESTING AUTHENTICATION (1,000 Concurrent Logins)")
    print(f"==================================================================")
    print("Testing Tomcat thread pool (max: 400) & HikariCP pool (max: 50)...")

    login_url = f"{BASE_HTTP_URL}/api/v1/auth/login"
    login_payload = json.dumps({"email": "awabuyer1@gmail.com", "password": "Welcome@123"})

    latencies = []
    errors = 0
    success = 0

    async def single_login(idx):
        nonlocal errors, success
        t0 = time.time()
        try:
            async with session.post(login_url, data=login_payload, headers={"Content-Type": "application/json"}, timeout=15) as resp:
                elapsed = (time.time() - t0) * 1000
                if resp.status == 200:
                    success += 1
                    latencies.append(elapsed)
                else:
                    errors += 1
        except Exception as e:
            errors += 1

    start_all = time.time()
    # Batch in parallel coroutines to simulate sudden burst
    batch_size = 200
    for b in range(0, num_users, batch_size):
        tasks = [single_login(i) for i in range(b, min(b + batch_size, num_users))]
        await asyncio.gather(*tasks)
    total_time = time.time() - start_all

    stats = calculate_percentiles(latencies)
    rps = success / total_time if total_time > 0 else 0
    print(f"-> Total Attempted: {num_users} | Successful: {success} | Failed/Timeout: {errors}")
    print(f"-> Total Time: {total_time:.2f}s | Throughput: {rps:.1f} req/sec")
    print(f"-> Latency: Mean={stats['mean']:.1f}ms | P50={stats['p50']:.1f}ms | P95={stats['p95']:.1f}ms | P99={stats['p99']:.1f}ms | Max={stats['max']:.1f}ms")
    return stats

async def phase2_websocket_connection_ramp(user_tokens):
    """Phase 2: Establish 1,000 concurrent persistent WebSocket connections"""
    print(f"\n==================================================================")
    print(f"PHASE 2: 1,000 CONCURRENT WEBSOCKET CONNECTIONS RAMP-UP")
    print(f"==================================================================")
    print("Connecting 1,000 concurrent bidders to Go Bidding Engine...")

    ws_conns = []
    connect_latencies = []
    connect_errors = 0

    async def connect_client(user_id, token):
        nonlocal connect_errors
        ws_url = f"{BASE_WS_URL}/ws/auction/{AUCTION_ID}?token={token}"
        t0 = time.time()
        try:
            ws = await websockets.connect(ws_url, ping_interval=30, ping_timeout=10, max_size=8192)
            elapsed = (time.time() - t0) * 1000
            connect_latencies.append(elapsed)
            ws_conns.append((user_id, ws))
        except Exception as e:
            connect_errors += 1

    t_start = time.time()
    # Concurrently connect in chunks of 100 to avoid OS ephemeral port lock contention
    chunk_size = 100
    for i in range(0, len(user_tokens), chunk_size):
        chunk = user_tokens[i:i + chunk_size]
        await asyncio.gather(*[connect_client(uid, tok) for uid, tok in chunk])
        await asyncio.sleep(0.05)

    total_ramp_time = time.time() - t_start
    c_stats = calculate_percentiles(connect_latencies)
    print(f"-> Active WebSocket Connections Established: {len(ws_conns)} / {len(user_tokens)}")
    print(f"-> Connection Errors: {connect_errors}")
    print(f"-> Ramp-Up Duration: {total_ramp_time:.2f}s (Rate: {len(ws_conns)/total_ramp_time:.1f} conns/sec)")
    print(f"-> Handshake Latency: Mean={c_stats['mean']:.1f}ms | P50={c_stats['p50']:.1f}ms | P95={c_stats['p95']:.1f}ms | P99={c_stats['p99']:.1f}ms")
    return ws_conns

async def phase3_simultaneous_bidding_burst(ws_conns):
    """Phase 3: All 1,000 users fire simultaneous bids at the EXACT SAME TIME"""
    print(f"\n==================================================================")
    print(f"PHASE 3: SIMULTANEOUS 1,000-USER BIDDING BLAST (LOCK CONTENTION)")
    print(f"==================================================================")
    print(f"Triggering simultaneous bids from {len(ws_conns)} concurrent bidders...")

    # We fetch current price from Redis first
    base_bid = 560000.00
    bid_results = []
    roundtrip_latencies = []
    accepted_count = 0
    rejected_count = 0
    fanout_count = 0

    barrier = asyncio.Event()

    async def bidder_task(index, user_id, ws):
        nonlocal accepted_count, rejected_count, fanout_count
        # Stagger bids slightly so some are incremental, some identical to test race conditions
        # Users submit bids between 565,000 and 650,000 AED
        proposed_bid = base_bid + (index * 100.0)
        payload = json.dumps({
            "auctionId": AUCTION_ID,
            "bidAmount": proposed_bid
        })

        await barrier.wait() # Wait for simultaneous release
        t0 = time.time()
        try:
            await ws.send(payload)
            # Listen for reply
            reply_raw = await asyncio.wait_for(ws.recv(), timeout=6.0)
            elapsed = (time.time() - t0) * 1000
            roundtrip_latencies.append(elapsed)
            reply = json.loads(reply_raw)
            status = reply.get("status") or reply.get("type")
            if status in ["SUCCESS", "ACCEPTED"]:
                accepted_count += 1
            else:
                rejected_count += 1
            bid_results.append((user_id, status, elapsed))
        except Exception as e:
            rejected_count += 1

    # Spawn all bidder tasks
    tasks = [asyncio.create_task(bidder_task(i, uid, ws)) for i, (uid, ws) in enumerate(ws_conns)]
    await asyncio.sleep(0.5)

    print("-> 🚀 RELEASING BARRIER: ALL 1,000 BIDS SENT SIMULTANEOUSLY!")
    t_burst_start = time.time()
    barrier.set()
    await asyncio.gather(*tasks, return_exceptions=True)
    t_burst_duration = time.time() - t_burst_start

    stats = calculate_percentiles(roundtrip_latencies)
    print(f"-> Total Bids Processed: {len(roundtrip_latencies)} in {t_burst_duration:.3f} seconds")
    print(f"-> Throughput: {len(roundtrip_latencies)/t_burst_duration:.1f} bids/second under extreme contention")
    print(f"-> Bids Accepted into State: {accepted_count} | Bids Rejected by Atomic Bounds: {rejected_count}")
    print(f"-> Bidding Roundtrip: Mean={stats['mean']:.1f}ms | P50={stats['p50']:.1f}ms | P95={stats['p95']:.1f}ms | P99={stats['p99']:.1f}ms | Min={stats['min']:.1f}ms | Max={stats['max']:.1f}ms")
    return stats, t_burst_duration

async def phase4_high_frequency_burst(ws_conns, bursts=5):
    """Phase 4: High-frequency multi-round saturation burst (Breaking Point Analysis)"""
    print(f"\n==================================================================")
    print(f"PHASE 4: MULTI-ROUND SATURATION BURST ({bursts} Rounds x 1,000 Users = {bursts*len(ws_conns):,} Bids)")
    print(f"==================================================================")
    
    total_bids = 0
    all_latencies = []
    t_start = time.time()

    for r in range(1, bursts + 1):
        r_start = time.time()
        round_bid = 700000.00 + (r * 10000.0)
        
        async def send_burst(i, ws):
            t0 = time.time()
            try:
                payload = json.dumps({"auctionId": AUCTION_ID, "bidAmount": round_bid + (i * 10)})
                await ws.send(payload)
                msg = await asyncio.wait_for(ws.recv(), timeout=4.0)
                all_latencies.append((time.time() - t0) * 1000)
                return True
            except:
                return False

        results = await asyncio.gather(*[send_burst(i, ws) for i, (_, ws) in enumerate(ws_conns)])
        success_in_round = sum(1 for res in results if res)
        total_bids += success_in_round
        r_elapsed = time.time() - r_start
        print(f" -> Round {r}/{bursts}: {success_in_round} bids processed in {r_elapsed:.2f}s ({success_in_round/r_elapsed:.0f} bids/s)")
        await asyncio.sleep(0.2)

    total_duration = time.time() - t_start
    b_stats = calculate_percentiles(all_latencies)
    print(f"\n-> Saturation Summary: {total_bids:,} total bids evaluated in {total_duration:.2f}s")
    print(f"-> Overall Throughput: {total_bids/total_duration:.1f} bids/second sustained across 1,000 clients")
    print(f"-> Latency: P50={b_stats['p50']:.1f}ms | P95={b_stats['p95']:.1f}ms | P99={b_stats['p99']:.1f}ms | Max={b_stats['max']:.1f}ms")
    return b_stats, total_duration

async def main():
    tokens = generate_tokens(CONCURRENT_USERS)
    
    # Phase 1: HTTP Concurrency
    connector = aiohttp.TCPConnector(limit=500, ttl_dns_cache=300)
    async with aiohttp.ClientSession(connector=connector) as session:
        auth_stats = await phase1_concurrent_login_test(session, num_users=CONCURRENT_USERS)

    # Phase 2: WebSockets Ramp
    ws_conns = await phase2_websocket_connection_ramp(tokens)

    # Phase 3: Simultaneous 1000-User Bidding Blast
    blast_stats, blast_dur = await phase3_simultaneous_bidding_burst(ws_conns)

    # Phase 4: Multi-Round Breaking Point Analysis
    sat_stats, sat_dur = await phase4_high_frequency_burst(ws_conns, bursts=5)

    # Clean disconnect
    print("\nGracefully closing 1,000 WebSocket connections...")
    for _, ws in ws_conns:
        try:
            await ws.close()
        except:
            pass

    # Save Results to JSON for Reporting
    report_data = {
        "timestamp": int(time.time()),
        "concurrent_users": CONCURRENT_USERS,
        "auth_stress": auth_stats,
        "websocket_connections": len(ws_conns),
        "blast_stats": blast_stats,
        "blast_duration": blast_dur,
        "saturation_stats": sat_stats,
        "saturation_duration": sat_dur
    }
    with open("stress_test_report.json", "w") as f:
        json.dump(report_data, f, indent=2)
    print("\nResults successfully saved to stress_test_report.json!")

if __name__ == "__main__":
    asyncio.run(main())

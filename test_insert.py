import subprocess

sql = "INSERT INTO user_sessions (id, user_id, user_name, email, role, pod_name, status) VALUES ('sess-test-999', 'usr-test-999', 'Test User', 'test@test.com', 'BUYER', 'eauction-bidding-engine-9d9cb8cf4-479z9', 'ONLINE') ON CONFLICT (user_id, device_type) DO UPDATE SET pod_name = EXCLUDED.pod_name, last_heartbeat = CURRENT_TIMESTAMP;"
cmd = ["kubectl", "exec", "eauction-postgres-0", "-n", "eauction", "--", "psql", "-U", "postgres", "-d", "eauction_db", "-c", sql]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)

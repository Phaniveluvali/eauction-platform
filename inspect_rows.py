import subprocess

cmd = [
    "kubectl", "exec", "-i", "eauction-postgres-0", "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-c", "SELECT id, user_id, device_type, pod_name, last_heartbeat FROM user_sessions ORDER BY id LIMIT 5; SELECT id, user_id, device_type, pod_name, last_heartbeat FROM user_sessions ORDER BY id DESC LIMIT 5;"
]

p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print("STDOUT:\n", p.stdout)

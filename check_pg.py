import subprocess

p1 = subprocess.run(["kubectl", "get", "pods", "-n", "eauction", "-l", "app=eauction-postgres", "-o", "jsonpath={.items[0].metadata.name}"], stdout=subprocess.PIPE, text=True)
pod_name = p1.stdout.strip()
print("Postgres Pod:", pod_name)

sql = "SELECT count(*) as total, count(*) FILTER (WHERE last_heartbeat >= CURRENT_TIMESTAMP - INTERVAL '120 SECONDS') as active_120s FROM user_sessions; SELECT pod_name, count(*) FROM user_sessions GROUP BY pod_name;"

cmd = [
    "kubectl", "exec", "-i", pod_name, "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-c", sql
]

p2 = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print("STDOUT:\n", p2.stdout)
print("STDERR:\n", p2.stderr)

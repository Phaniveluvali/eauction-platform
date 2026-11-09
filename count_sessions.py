import subprocess

cmd = ["kubectl", "exec", "eauction-postgres-0", "-n", "eauction", "--", "psql", "-U", "postgres", "-d", "eauction_db", "-t", "-A", "-c", "SELECT count(*), pod_name FROM user_sessions GROUP BY pod_name;"]
res = subprocess.run(cmd, capture_output=True, text=True)
print("PostgreSQL User Sessions:")
print(res.stdout)

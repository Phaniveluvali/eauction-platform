import subprocess

cmd = [
    "kubectl", "exec", "-i", "eauction-postgres-0", "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-c", "\\d user_sessions"
]

p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print("STDOUT:\n", p.stdout)
print("STDERR:\n", p.stderr)

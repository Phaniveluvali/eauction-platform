import subprocess

cmd = ["kubectl", "exec", "eauction-postgres-0", "-n", "eauction", "--", "psql", "-U", "postgres", "-d", "eauction_db", "-c", "SELECT conname, contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'user_sessions'::regclass;"]
res = subprocess.run(cmd, capture_output=True, text=True)
print(res.stdout)

import subprocess

p1 = subprocess.run(["sudo", "kubectl", "get", "pods", "-n", "eauction", "-l", "app=eauction-postgres", "-o", "jsonpath={.items[0].metadata.name}"], stdout=subprocess.PIPE, text=True)
pod_name = p1.stdout.strip()
print("Postgres Pod:", pod_name)

sql = "SELECT id, email, full_name, role, is_active FROM users WHERE email ILIKE '%admin%' OR email ILIKE '%vmx%' OR email ILIKE '%buyer%';"

cmd = [
    "sudo", "kubectl", "exec", "-i", pod_name, "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-c", sql
]

p2 = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print("STDOUT:\n", p2.stdout)
print("STDERR:\n", p2.stderr)

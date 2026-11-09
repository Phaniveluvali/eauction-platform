import subprocess

p1 = subprocess.run(["sudo", "kubectl", "get", "pods", "-n", "eauction", "-l", "app=eauction-postgres", "-o", "jsonpath={.items[0].metadata.name}"], stdout=subprocess.PIPE, text=True)
pod_name = p1.stdout.strip()

sql = "SELECT id, username, email, enabled FROM user_entity;"

cmd = [
    "sudo", "kubectl", "exec", "-i", pod_name, "-n", "eauction", "--",
    "psql", "-U", "postgres", "-d", "keycloak_db", "-c", sql
]

p2 = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print("STDOUT:\n", p2.stdout)

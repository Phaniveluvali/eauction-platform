import subprocess
import time

print("Fetching all active auctions from Kubernetes PostgreSQL...")
cmd_pg = [
    "sudo", "kubectl", "exec", "-i", "-n", "eauction", "pod/eauction-postgres-0", "--",
    "psql", "-U", "postgres", "-d", "eauction_db", "-t", "-A", "-F", ",",
    "-c", "SELECT id, status, start_price, reserve_price, min_bid_increment, current_highest_bid, COALESCE(highest_bidder_id::text, '') FROM auctions WHERE status = 'ACTIVE';"
]

output = subprocess.check_output(cmd_pg, text=True)
lines = [l.strip() for l in output.strip().split("\n") if l.strip()]
print(f"Found {len(lines)} active auctions in PostgreSQL.")

now_ts = str(int(time.time() * 1000))
redis_commands = []

for line in lines:
    parts = line.split(",")
    if len(parts) >= 7:
        a_id, status, start_p, res_p, inc_p, curr_p, bidder_id = parts[:7]
        redis_commands.append(
            f'HSET "auction:{a_id}:state" "status" "{status}" "start_price" "{start_p}" "reserve_price" "{res_p}" "min_increment" "{inc_p}" "current_highest_bid" "{curr_p}" "highest_bidder_id" "{bidder_id}" "last_bid_timestamp" "{now_ts}"'
        )

# Write redis commands to a temporary file
redis_file = "/tmp/redis_commands_ha.txt"
with open(redis_file, "w") as f:
    f.write("\n".join(redis_commands) + "\n")

print(f"Pipelining {len(redis_commands)} HSET commands into Redis...")
cmd_redis_pipe = f"sudo kubectl exec -i -n eauction pod/eauction-redis-0 -- redis-cli < {redis_file} > /dev/null"
subprocess.check_call(cmd_redis_pipe, shell=True)

# Verify count of primed keys on master and replica
cmd_check_m = "sudo kubectl exec -i -n eauction pod/eauction-redis-0 -- redis-cli keys 'auction:*:state' | wc -l"
keys_count_m = subprocess.check_output(cmd_check_m, shell=True, text=True).strip()
print(f"Verified Redis Master active auction keys: {keys_count_m}")

cmd_check_r = "sudo kubectl exec -i -n eauction pod/eauction-redis-1 -- redis-cli keys 'auction:*:state' | wc -l"
keys_count_r = subprocess.check_output(cmd_check_r, shell=True, text=True).strip()
print(f"Verified Redis Standby Replica active auction keys: {keys_count_r}")

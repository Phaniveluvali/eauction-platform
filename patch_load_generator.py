path = "/home/nodejs/eauction-workspace/run_1000_live_sessions_load.py"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    'BASE_URL = "http://localhost:30300"',
    'BASE_URL = "https://127.0.0.1:30443"'
)

code = code.replace(
    'headers={"Content-Type": "application/json"}',
    'headers={"Content-Type": "application/json", "Host": "tecnics-internal.online"}'
)

code = code.replace(
    'headers={"Accept": "application/json"}',
    'headers={"Accept": "application/json", "Host": "tecnics-internal.online"}'
)

code = code.replace(
    '"sessionId": sess_id,',
    '"id": sess_id, "sessionId": sess_id,'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("Load generator patched successfully")

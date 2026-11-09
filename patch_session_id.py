path = '/home/nodejs/eauction-workspace/catalog-identity-service/src/main/java/com/eauction/core/identity/controller/UserSessionController.java'
with open(path, 'r') as f:
    c = f.read()

target1 = 'String podName = System.getenv().getOrDefault("HOSTNAME", "eauction-catalog-identity-78f898c76f");'
replacement1 = 'String podName = (String) payload.getOrDefault("podName", System.getenv().getOrDefault("HOSTNAME", "eauction-catalog-identity-78f898c76f"));'

target2 = 'String sessId = "sess-" + (userId.length() > 6 ? userId.substring(0, 6) : userId) + "-" + deviceType.toLowerCase();'
replacement2 = 'String sessId = (String) payload.getOrDefault("sessionId", "sess-" + userId + "-" + deviceType.toLowerCase());'

if target1 in c:
    c = c.replace(target1, replacement1)
    print("Patched target1 (podName)")
else:
    print("target1 not found")

if target2 in c:
    c = c.replace(target2, replacement2)
    print("Patched target2 (sessId)")
else:
    print("target2 not found")

with open(path, 'w') as f:
    f.write(c)

print("Done patching UserSessionController.java")

path = "/home/nodejs/eauction-workspace/frontend/src/services/api.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = "if (!res.ok) throw new Error('Failed to broadcast promo');"
replacement = """if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const detail = errData.detail || 'Failed to broadcast promo';
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("api.ts patched successfully!")
else:
    print("Already patched or target not found.")

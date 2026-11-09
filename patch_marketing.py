import re

path = "/home/nodejs/eauction-workspace/ai-service/services/marketing_service.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = '"campaign_id": campaign_id,'
replacement = '"campaign_id": campaign_id,\n            "campaign": campaign_payload,'

if target in content and '"campaign": campaign_payload' not in content:
    content = content.replace(target, replacement, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("marketing_service.py patched successfully!")
else:
    print("Already patched or target not found.")

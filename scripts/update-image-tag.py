#!/usr/bin/env python3
import sys

if len(sys.argv) < 3:
    print("Usage: python3 update-image-tag.py <serviceKey> <newTag> [valuesPath]")
    sys.exit(1)

service = sys.argv[1]
tag = sys.argv[2]
path = sys.argv[3] if len(sys.argv) > 3 else 'helm/eauction-platform/values.yaml'

with open(path, 'r') as f:
    lines = f.readlines()

in_service = False
in_image = False
updated = False

for i, line in enumerate(lines):
    # Skip empty lines
    if not line.strip():
        continue

    # Top-level service block match (e.g. "frontend:")
    if line.startswith(f"{service}:"):
        in_service = True
        in_image = False
        continue
    elif in_service and not line.startswith(' ') and not line.startswith('#'):
        # Next top-level block started
        in_service = False
        in_image = False
        continue

    stripped = line.strip()
    if stripped.startswith('#'):
        continue

    if in_service and (stripped == 'image:' or stripped.startswith('image:')):
        in_image = True
        continue

    if in_service and in_image and stripped.startswith('tag:'):
        indent = len(line) - len(line.lstrip())
        lines[i] = f"{' ' * indent}tag: \"{tag}\"\n"
        updated = True
        break

if not updated:
    print(f"Error: Could not locate tag under {service}.image in {path}")
    sys.exit(1)

with open(path, 'w') as f:
    f.writelines(lines)

print(f"Successfully updated {service}.image.tag to '{tag}' in {path}")

#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace
echo "=== Building React Frontend Image ==="
docker build -t eauction-frontend:latest -t krishnaveluvali/eauction-frontend:v2.0.0-enterprise-layout ./frontend

echo "=== Updating Image in containerd ==="
echo Welcome@123 | sudo -S ctr -n k8s.io images rm docker.io/krishnaveluvali/eauction-frontend:v2.0.0-enterprise-layout 2>/dev/null || true
echo Welcome@123 | sudo -S ctr -n k8s.io images rm docker.io/library/eauction-frontend:latest 2>/dev/null || true
echo Welcome@123 | sudo -S sh -c "docker save krishnaveluvali/eauction-frontend:v2.0.0-enterprise-layout | ctr -n k8s.io images import -"
echo Welcome@123 | sudo -S sh -c "docker save eauction-frontend:latest | ctr -n k8s.io images import -"

echo "=== Restarting Frontend Deployment ==="
kubectl rollout restart deployment/eauction-frontend -n eauction
kubectl rollout status deployment/eauction-frontend -n eauction --timeout=180s
echo "=== Frontend Deployment Complete! ==="

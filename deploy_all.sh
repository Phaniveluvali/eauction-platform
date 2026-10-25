#!/bin/bash
set -e
cd /home/nodejs/eauction-workspace

echo "=== 1. Building catalog-identity-service image ==="
docker build -t eauction-catalog-identity:latest ./catalog-identity-service
echo Welcome@123 | sudo -S sh -c "docker save eauction-catalog-identity:latest | ctr -n k8s.io images import -"

echo "=== 2. Building frontend image ==="
docker build -t eauction-frontend:latest ./frontend
echo Welcome@123 | sudo -S sh -c "docker save eauction-frontend:latest | ctr -n k8s.io images import -"

echo "=== 3. Rolling out deployments in Kubernetes ==="
echo Welcome@123 | sudo -S kubectl rollout restart deployment/eauction-catalog-identity deployment/eauction-frontend -n eauction
echo Welcome@123 | sudo -S kubectl rollout status deployment/eauction-catalog-identity -n eauction --timeout=180s
echo Welcome@123 | sudo -S kubectl rollout status deployment/eauction-frontend -n eauction --timeout=180s

echo "=== 4. Deployment Complete! ==="

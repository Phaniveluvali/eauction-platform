#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace
echo "=== Building React Frontend Image ==="
docker build -t eauction-frontend:latest ./frontend
echo "=== Importing Image into containerd ==="
echo Welcome@123 | sudo -S sh -c "docker save eauction-frontend:latest | ctr -n k8s.io images import -"
echo "=== Restarting Frontend Deployment ==="
kubectl rollout restart deployment/eauction-frontend -n eauction
kubectl rollout status deployment/eauction-frontend -n eauction --timeout=180s
echo "=== Frontend Deployment Complete! ==="

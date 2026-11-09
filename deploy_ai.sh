#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace/ai-service
docker build -t eauction-ai-service:latest .
echo Welcome@123 | sudo -S sh -c "docker save eauction-ai-service:latest | ctr -n k8s.io images import -"
kubectl rollout restart deployment/eauction-ai-service -n eauction
kubectl rollout status deployment/eauction-ai-service -n eauction --timeout=120s
echo "AI Service deployed successfully!"

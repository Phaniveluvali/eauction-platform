#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace
echo "=== Step 1: Building Go Bidding Engine Image ==="
docker build -t eauction-bidding-engine:latest ./bidding-engine

echo "=== Step 2: Building Payment Broker Image ==="
docker build -t eauction-payment-broker:latest ./payment-broker

echo "=== Step 3: Building React Frontend Portal Image ==="
docker build -t eauction-frontend:latest ./frontend

echo "=== Step 4: Building Java Catalog & Identity Service Image ==="
docker build -t eauction-catalog-identity:latest ./catalog-identity-service

echo "=== Step 5: Pulling Infrastructure Images ==="
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull confluentinc/cp-kafka:7.5.0

echo "=== Step 6: Importing Images into Kubernetes containerd Runtime ==="
for img in \
  eauction-bidding-engine:latest \
  eauction-payment-broker:latest \
  eauction-frontend:latest \
  eauction-catalog-identity:latest \
  postgres:16-alpine \
  redis:7-alpine \
  confluentinc/cp-zookeeper:7.5.0 \
  confluentinc/cp-kafka:7.5.0; do
    echo "Importing $img..."
    echo Welcome@123 | sudo -S sh -c "docker save $img | ctr -n k8s.io images import -"
done

echo "=== Step 7: Preparing Kubernetes Namespace & Database Init ConfigMap ==="
echo Welcome@123 | sudo -S kubectl apply -f k8s/00-namespace.yaml
echo Welcome@123 | sudo -S kubectl create configmap postgres-init-script \
  --from-file=01-schema.sql=/home/nodejs/eauction-workspace/production_schema.sql \
  -n eauction --dry-run=client -o yaml | echo Welcome@123 | sudo -S kubectl apply -f -

echo "=== Step 8: Deploying All Production Workloads via Kustomize ==="
echo Welcome@123 | sudo -S kubectl apply -k k8s/

echo "=== Step 9: Verifying Pods in 'eauction' Namespace ==="
echo Welcome@123 | sudo -S kubectl get pods,svc,pvc,ingress -n eauction -o wide
echo "=== DEPLOYMENT COMPLETE! ==="

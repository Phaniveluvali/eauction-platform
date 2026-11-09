#!/bin/bash
set -e
cd /home/nodejs/eauction-workspace
docker build -t eauction-bidding-engine:latest ./bidding-engine
echo Welcome@123 | sudo -S sh -c "docker save eauction-bidding-engine:latest | ctr -n k8s.io images import -"
kubectl rollout restart deployment eauction-bidding-engine -n eauction
kubectl rollout status deployment eauction-bidding-engine -n eauction
echo "Bidding engine service successfully deployed"

#!/bin/bash
set -e

echo '==================================================='
echo '   E-AUCTION EMERGENCY ROLLBACK TO PRE-BUGFIX     '
echo '==================================================='
echo 'Restoring Git baseline tag v1.0.0-pre-bugfix-20261120_235013...'
cd /home/nodejs/eauction-workspace
git checkout -f v1.0.0-pre-bugfix-20261120_235013

echo 'Restoring Kubernetes Deployment Images to Baseline...'
kubectl set image deployment/eauction-frontend frontend=krishnaveluvali/eauction-frontend:1a53cc4 -n eauction
kubectl set image deployment/eauction-catalog-identity catalog-identity=krishnaveluvali/eauction-catalog-identity:1a53cc4 -n eauction
kubectl set image deployment/eauction-bidding-engine bidding-engine=krishnaveluvali/eauction-bidding-engine:latest -n eauction
kubectl set image deployment/eauction-payment-broker payment-broker=krishnaveluvali/eauction-payment-broker:latest -n eauction

echo 'Waiting for baseline rollouts to stabilize...'
kubectl rollout status deployment/eauction-frontend -n eauction --timeout=120s
kubectl rollout status deployment/eauction-catalog-identity -n eauction --timeout=120s
kubectl rollout status deployment/eauction-bidding-engine -n eauction --timeout=120s

echo 'Optionally restore Database if needed (run manually if DB data corrupted):'
echo '  cat /home/nodejs/backups/eauction_db_20261120_235013.sql | kubectl exec -i -n eauction eauction-postgres-0 -- psql -U postgres eauction_db'
echo '==================================================='
echo '   ROLLBACK TO BASELINE SUCCESSFULLY COMPLETED     '
echo '==================================================='

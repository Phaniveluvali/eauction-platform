#!/bin/bash
set -e

echo "=== 1. Creating 'monitoring' namespace ==="
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/00-namespace.yaml

echo "=== 2. Pulling lightweight images into containerd (k8s.io) ==="
IMAGES=(
  "docker.io/prom/node-exporter:v1.7.0"
  "docker.io/prom/prometheus:v2.45.0"
  "docker.io/prom/alertmanager:v0.26.0"
  "docker.io/bitnami/kube-state-metrics:2.10.1"
  "docker.io/grafana/loki:2.9.2"
  "docker.io/grafana/promtail:2.9.2"
  "docker.io/grafana/grafana:10.2.0"
  "docker.io/amir20/dozzle:v5.11.13"
)

for img in "${IMAGES[@]}"; do
  echo "Pulling $img..."
  echo Welcome@123 | sudo -S ctr -n k8s.io images pull "$img" || true
done

echo "=== 3. Applying Monitoring Stack Manifests ==="
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/01-rbac.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/02-node-exporter.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/03-kube-state-metrics.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/04-alertmanager.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/05-prometheus.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/06-loki.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/07-promtail.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/08-grafana.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/09-dozzle.yaml
kubectl apply -f /home/nodejs/eauction-workspace/monitoring/10-monitoring-ingress.yaml

echo "=== 4. Waiting for Rollouts ==="
kubectl rollout status daemonset/node-exporter -n monitoring --timeout=120s || true
kubectl rollout status deployment/kube-state-metrics -n monitoring --timeout=120s || true
kubectl rollout status deployment/alertmanager -n monitoring --timeout=120s || true
kubectl rollout status deployment/prometheus -n monitoring --timeout=120s || true
kubectl rollout status deployment/loki -n monitoring --timeout=120s || true
kubectl rollout status daemonset/promtail -n monitoring --timeout=120s || true
kubectl rollout status deployment/grafana -n monitoring --timeout=120s || true
kubectl rollout status deployment/dozzle -n monitoring --timeout=120s || true

echo "=== 5. Final Pod Status in 'monitoring' ==="
kubectl get pods,svc,ingress -n monitoring

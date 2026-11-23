#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace/catalog-identity-service

cat << 'EOF' > Dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF

cd /home/nodejs/eauction-workspace
docker build -t eauction-catalog-identity:latest -t krishnaveluvali/eauction-catalog-identity:v1.2.0-db-optimized ./catalog-identity-service

echo Welcome@123 | sudo -S ctr -n k8s.io images rm docker.io/krishnaveluvali/eauction-catalog-identity:v1.2.0-db-optimized 2>/dev/null || true
echo Welcome@123 | sudo -S ctr -n k8s.io images rm docker.io/library/eauction-catalog-identity:latest 2>/dev/null || true

echo Welcome@123 | sudo -S sh -c "docker save krishnaveluvali/eauction-catalog-identity:v1.2.0-db-optimized | ctr -n k8s.io images import -"
echo Welcome@123 | sudo -S sh -c "docker save eauction-catalog-identity:latest | ctr -n k8s.io images import -"

kubectl rollout restart deployment eauction-catalog-identity -n eauction
kubectl rollout status deployment eauction-catalog-identity -n eauction --timeout=180s
echo "Catalog identity service successfully deployed"

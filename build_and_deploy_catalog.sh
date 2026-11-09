#!/bin/bash
set -e

cd /home/nodejs/eauction-workspace/catalog-identity-service
echo "=== Building JAR via Maven ==="
mvn clean package -DskipTests

cat << 'EOF' > Dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF

cd /home/nodejs/eauction-workspace
echo "=== Building Docker Image ==="
docker build -t eauction-catalog-identity:latest ./catalog-identity-service
echo "=== Importing to containerd ==="
echo Welcome@123 | sudo -S sh -c "docker save eauction-catalog-identity:latest | ctr -n k8s.io images import -"
echo "=== Restarting Deployment ==="
kubectl rollout restart deployment eauction-catalog-identity -n eauction
kubectl rollout status deployment eauction-catalog-identity -n eauction
echo "=== Catalog identity service successfully deployed! ==="

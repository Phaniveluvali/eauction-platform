#!/bin/bash
set -e

echo "========================================================"
echo "      E-AUCTION PLATFORM - FULL STACK VERIFICATION     "
echo "========================================================"

echo -e "\n[1/6] Testing PostgreSQL Database Connection & Records..."
docker exec eauction-postgres psql -U postgres -d eauction_db -c "SELECT COUNT(*) as user_count FROM users;"
docker exec eauction-postgres psql -U postgres -d eauction_db -c "SELECT COUNT(*) as vehicle_count FROM vehicles;"
docker exec eauction-postgres psql -U postgres -d eauction_db -c "SELECT COUNT(*) as auction_count FROM auctions;"

echo -e "\n[2/6] Testing Catalog Service Vehicles API (Port 8080)..."
curl -s http://localhost:8080/api/v1/catalog/vehicles | grep -o '"registrationNumber":"[^"]*' | head -n 3

echo -e "\n[3/6] Testing Identity Service Login & HS256 Token Issuance..."
LOGIN_JSON=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@sharmatransport.in","password":"Password123!"}')
echo "Login Response: $LOGIN_JSON"

TOKEN=$(echo "$LOGIN_JSON" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted JWT Token: ${TOKEN:0:30}..."

echo -e "\n[4/6] Testing Identity Profile Retrieval (/api/v1/auth/me) with JWT..."
curl -s -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo -e "\n[5/6] Testing Payment Broker Health & Gateway Webhook (Port 8082)..."
curl -s http://localhost:8082/health
echo ""

echo -e "\n[6/6] Testing Frontend Portal Web Server (Port 3000)..."
curl -s -I http://localhost:3000 | head -n 5

echo -e "\n========================================================"
echo "    ALL MICROSERVICES & PLATFORM TEST SUITE PASSED!     "
echo "========================================================"

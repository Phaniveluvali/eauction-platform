# E-Auction Platform: Operations & Microservices Standard Operating Procedure (SOP)

This document serves as the comprehensive operational guide for managing, starting, stopping, rebuilding, and verifying the **Al Wataneya (AWA) E-Auction Microservices Platform** running on Windows with WSL2 and Docker.

---

## 1. What Happened After Your System Restart (Root Cause Analysis)

### The Failure Cascade
When Windows restarted abruptly, the following sequence occurred:
1. **ZooKeeper Ephemeral Node Lock:** ZooKeeper was abruptly frozen or restarted before Kafka could cleanly dereference its session. ZooKeeper still held an ephemeral registration for `/brokers/ids/1`.
2. **Kafka Startup Crash (`KeeperErrorCode = NodeExists`):** When Kafka attempted to initialize, it received:
   ```
   org.apache.zookeeper.KeeperException$NodeExistsException: KeeperErrorCode = NodeExists
       at kafka.zk.KafkaZkClient.registerBroker(KafkaZkClient.scala:106)
   [KafkaServer id=1] ERROR Exiting Kafka due to fatal exception during startup.
   ```
   Kafka exited with code `1`.
3. **Healthcheck Blocking Dependent Services:** In `docker-compose.yml`, `catalog-identity-service`, `bidding-engine`, and `payment-broker` declare:
   ```yaml
   depends_on:
     kafka:
       condition: service_healthy
   ```
   Because Kafka never reached a `healthy` state, Docker Compose refused to start or keep the dependent backend microservices running, which in turn kept `frontend` offline.

### How It Was Resolved
1. Restarted ZooKeeper (`docker restart eauction-zookeeper`), which purged stale ephemeral sessions.
2. Started Kafka (`docker start eauction-kafka`), allowing it to cleanly register broker ID `1` and achieve `(healthy)` status.
3. Executed `docker compose up -d` to bring all microservices and the frontend online.

---

## 2. Architecture & Service Port Map

| Container Name | Service | Technology | Internal Port | Host Port | Purpose |
|---|---|---|---|---|---|
| `eauction-frontend` | Frontend | React 18, Vite, Tailwind, Nginx | 80 | **3000** | Marketplace & Admin Portal |
| `eauction-catalog-identity` | Catalog & Identity | Java 17, Spring Boot 3.3, JPA | 8080 | **8080** | Auth, RBAC, Vehicle Catalog, Workflows |
| `eauction-bidding-engine` | Bidding Engine | Go 1.22, Gorilla WebSockets | 8081 | **8081** | Low-latency live auction bidding |
| `eauction-payment-broker` | Payment Broker | Node.js 20, TypeScript, Express | 8082 | **8082** | Razorpay / Stripe deposits & escrow |
| `eauction-postgres` | Database | PostgreSQL 16 Alpine | 5432 | **5432** | Persistent ledger & 504 seed users |
| `eauction-redis` | Cache & Lua | Redis 7 Alpine | 6379 | **6379** | In-memory bids & atomic auction cache |
| `eauction-kafka` | Event Stream | Confluent Kafka 7.5.0 | 29092 | **9092** | Bid events & transaction streaming |
| `eauction-zookeeper` | Coordinator | Confluent ZooKeeper 7.5.0 | 2181 | **2181** | Kafka cluster leader election |

---

## 3. Platform Lifecycle Commands (Start, Stop, Restart)

> **Important:** Always execute these commands inside your project directory:  
> `cd C:\Users\Phani_veluvali\.gemini\antigravity\scratch\e-auction-workspace`  
> In PowerShell, you can use `wsl -e docker compose ...` or directly `docker compose ...` if Docker Desktop integration is active.

### A. Starting the Entire Platform
To start all 8 services in correct dependency order:
```powershell
# From Windows PowerShell:
wsl -e docker compose up -d
```
Expected output:
```text
Container eauction-zookeeper Running
Container eauction-redis Running
Container eauction-postgres Healthy
Container eauction-kafka Healthy
Container eauction-catalog-identity Started
Container eauction-bidding-engine Started
Container eauction-payment-broker Started
Container eauction-frontend Started
```

### B. Stopping the Platform Cleanly
To gracefully shut down all services without losing PostgreSQL or Redis data:
```powershell
wsl -e docker compose down
```

### C. Clean Platform Restart (Recommended after Windows Reboots)
If you ever restart your PC and get connection errors:
```powershell
wsl -e docker compose down
wsl -e docker compose up -d
```

### D. Checking Live Service Status
```powershell
wsl -e docker ps
```
Ensure all containers show status `Up` or `Up (healthy)`.

---

## 4. How to Rebuild Specific Microservices

Whenever you edit source code for a specific service, you do **not** need to restart the entire platform. You can rebuild only that specific service:

### 1. Catalog & Identity Service (Java Spring Boot)
Used for backend REST APIs, workflows, and database entities:
```powershell
# Step 1: Rebuild Docker image
wsl -e docker compose build catalog-identity-service

# Step 2: Recreate and restart container
wsl -e docker compose up -d --no-deps catalog-identity-service
```

### 2. Frontend (React 18 + Vite UI)
Used for Admin Portal, Marketplace, and auction rooms:
```powershell
# Step 1: Rebuild Docker image
wsl -e docker compose build frontend

# Step 2: Recreate and restart container
wsl -e docker compose up -d --no-deps frontend
```

### 3. Bidding Engine (Go 1.22)
Used for real-time WebSocket bidding:
```powershell
# Step 1: Rebuild Docker image
wsl -e docker compose build bidding-engine

# Step 2: Recreate and restart container
wsl -e docker compose up -d --no-deps bidding-engine
```

### 4. Payment Broker (Node.js Express)
Used for payment webhooks and security deposits:
```powershell
# Step 1: Rebuild Docker image
wsl -e docker compose build payment-broker

# Step 2: Recreate and restart container
wsl -e docker compose up -d --no-deps payment-broker
```

---

## 5. Live Logs & Debugging

To view live output streams from any container:

```powershell
# View logs from all services combined:
wsl -e docker compose logs -f

# View logs from a specific microservice:
wsl -e docker compose logs -f catalog-identity-service
wsl -e docker compose logs -f bidding-engine
wsl -e docker compose logs -f payment-broker
wsl -e docker compose logs -f frontend

# View the last 50 lines of a container:
wsl -e docker logs --tail 50 eauction-catalog-identity
wsl -e docker logs --tail 50 eauction-kafka
```

---

## 6. Complete End-to-End Verification SOP

Run this rapid verification procedure after starting the platform:

### Step 1: Automated Health Checks
Run these four quick commands in PowerShell:

```powershell
# 1. Frontend Check (Port 3000) -> Should return HTTP 200 OK
wsl -e curl -sI http://localhost:3000

# 2. Catalog Service Check (Port 8080) -> Should return JSON array of vehicles
wsl -e curl -s http://localhost:8080/api/v1/catalog/vehicles

# 3. Bidding Engine Check (Port 8081) -> Should return HTTP 200 OK
wsl -e curl -sI http://localhost:8081/health

# 4. Payment Broker Check (Port 8082) -> Should return HTTP 200 OK
wsl -e curl -sI http://localhost:8082/health
```

### Step 2: Accessing the Web Application
Open your browser to:
- **Marketplace & Home:** `http://localhost:3000`
- **Admin & Operations Portal:** `http://localhost:3000` (Click `Admin` link in header)
- **Technical Inspection Certificate:** `http://localhost:3000/reports/technical-report-sample.html`

### Step 3: Default Credentials for Manual Testing
All accounts use the standard test password: `Password123!`

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Super Admin** | `admin@eauction.in` | `Password123!` | Full Operations, Management, Sellers, Technical Test |
| **Seller** | `seller1@eauction.in` | `Password123!` | Sellers tab only, Add New Car, My Vehicles |
| **Buyer** | `buyer1@eauction.in` | `Password123!` | Bidding, Deposit Escrow, Auction Rooms |

*(You can also use the **1-Click Login** directory inside the Admin Portal to switch between any of the 504 accounts instantly without re-typing passwords).*

---

## 7. Troubleshooting Guide (Common Reboot Issues)

### Issue A: `KeeperErrorCode = NodeExists` on Kafka
- **Symptom:** `eauction-kafka` exits with status `Exited (1)`.
- **Cause:** ZooKeeper holds stale session information from previous run.
- **Fix:**
  ```powershell
  wsl -e docker restart eauction-zookeeper
  wsl -e docker start eauction-kafka
  wsl -e docker compose up -d
  ```

### Issue B: "Docker daemon is not running" / "Cannot connect to docker daemon"
- **Symptom:** `docker ps` returns an error about daemon socket.
- **Cause:** Docker Desktop was not launched after Windows booted, or WSL integration is disabled.
- **Fix:**
  1. Open the **Docker Desktop** application from your Windows Start Menu.
  2. Wait until the whale icon in the Windows taskbar stays solid green ("Engine running").
  3. Re-run `wsl -e docker ps`.

### Issue C: Port Conflicts (e.g., `bind: address already in use :5432`)
- **Symptom:** Container fails to start because host port is busy.
- **Cause:** A local Windows service (such as local PostgreSQL, Redis, or Apache) is using port 5432 or 8080.
- **Fix:** Stop the Windows service:
  ```powershell
  # Check which process is using the port (e.g. 5432):
  Get-NetTCPConnection -LocalPort 5432
  # Stop local Windows Postgres if installed:
  Stop-Service postgresql* -Force
  ```

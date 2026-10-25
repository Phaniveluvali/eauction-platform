# Vehicle E-Auction Platform (India) - Production Microservices Workspace

An enterprise-grade, event-driven, distributed microservices platform engineered for high-volume commercial vehicle auctions (cars, trucks, tippers, and multi-axle trailers) in India. Built with **Clean Architecture / Domain-Driven Design (DDD)** principles across React 18, Java 17 + Spring Boot 3.3+, Go 1.22, and Node.js 20 + TypeScript.

---

## 1. System Architecture & Topology

```
                  +-------------------------------------------------------------+
                  |                      Frontend Portal                        |
                  |           (React 18 + Vite + Tailwind CSS on :3000)         |
                  +---------------+-----------------------------+---------------+
                                  |                             |
                       HTTP / JWT (HS256)             WebSocket / JWT (HS256)
                                  |                             |
                                  v                             v
+-----------------------------------+     +-----------------------------------------+
|     Catalog & Identity Service    |     |             Bidding Engine              |
|   (Java 17 + Spring Boot on :8080)|     |            (Go 1.22 on :8081)           |
|  - RBAC (BUYER, SELLER, ADMIN)    |     |  - Gorilla WebSocket Connection Pool    |
|  - KYC, PAN & GST Verification    |     |  - Synchronous Cache Check (Redis Lua)  |
|  - Car & Truck Fleet Inventory    |     +--------------------+--------------------+
+-----------------+-----------------+                          |
                  |                                            |
                  |                                            | Publishes Validated
                  |                                            | Bids ("vehicle-bids-topic")
                  |                                            v
                  |                         +---------------------------------------+
                  |                         |            Apache Kafka (:9092)       |
                  |                         |       Topics:                         |
                  |                         |        - vehicle-bids-topic           |
                  |                         |        - vehicle-payments-topic       |
                  |                         +-------------------+-------------------+
                  |                                             ^
                  | Listens to "vehicle-bids-topic"             | Publishes Reconciled
                  |  - SELECT ... FOR UPDATE Lock               | Payments
                  |  - SERIALIZABLE Isolation Ledger            |
                  v                                             |
+-----------------------------------+     +---------------------+-------------------+
|         PostgreSQL 16 (:5432)     |     |           Payment Broker                |
|  - users, vehicles, auctions      |     |     (Node.js + TypeScript on :8082)     |
|  - bids (immutable ledger)        |     |  - HMAC-SHA256 Signature Webhooks       |
|  - payments (escrow settlement)   |     |    (Razorpay, Cashfree)                 |
+-----------------------------------+     +-----------------------------------------+
```

---

## 2. Directory Layout Contract

```
e-auction-workspace/
├── schema.sql                             # PostgreSQL DDL Schema & Automatic Seed Data
├── docker-compose.yml                     # Unified multi-service deployment orchestrator
├── verify-pipeline.ps1                    # End-to-end integration test runner
│
├── frontend/                              # Client Web Portal (React 18 + Vite + Tailwind)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── nginx.conf                         # Reverse proxy for APIs & WebSockets
│   ├── Dockerfile
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                        # Catalog browsing & auction view switcher
│       ├── types/index.ts                 # Full domain typings
│       ├── services/
│       │   ├── api.ts                     # REST client for Java & Node.js backends
│       │   └── websocket.ts               # Resilient WebSocket client for Go engine
│       └── components/
│           ├── Navbar.tsx                 # Branding, user status, 1-click test logins
│           ├── AuthModal.tsx              # Login/Register with Indian PAN & GST KYC
│           ├── VehicleCard.tsx            # Car/Truck spec badges & price preview
│           ├── AuctionRoom.tsx            # Live bidding pad, countdown, & audit ledger
│           ├── PaymentModal.tsx           # Escrow deposit with Razorpay/Cashfree
│           └── CreateVehicleModal.tsx     # Seller fleet listing modal
│
├── catalog-identity-service/              # Java 17 + Spring Boot 3.3+
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── resources/application.properties
│       │   └── java/com/eauction/core/
│       │       ├── CatalogIdentityApplication.java
│       │       ├── shared/dto/
│       │       │   ├── BidEventPayload.java
│       │       │   └── PaymentEventPayload.java
│       │       ├── identity/
│       │       │   ├── config/SecurityConfig.java
│       │       │   ├── controller/AuthController.java
│       │       │   ├── model/User.java
│       │       │   ├── repository/UserRepository.java
│       │       │   └── service/AuthService.java
│       │       ├── catalog/
│       │       │   ├── controller/VehicleCatalogController.java
│       │       │   ├── model/Vehicle.java
│       │       │   └── repository/VehicleRepository.java
│       │       └── auction/
│       │           ├── controller/AuctionController.java
│       │           ├── kafka/BidKafkaConsumer.java
│       │           ├── model/Auction.java
│       │           ├── model/Bid.java
│       │           ├── repository/AuctionRepository.java
│       │           └── repository/BidRepository.java
│       └── test/java/com/eauction/core/
│           ├── auction/kafka/BidKafkaConsumerTest.java
│           └── identity/service/AuthServiceTest.java
│
├── bidding-engine/                        # Go 1.22 Low-Latency Core
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   ├── cmd/server/main.go
│   └── internal/
│       ├── config/config.go
│       ├── models/bid.go
│       └── auction/
│           ├── handler/websocket_handler.go
│           └── repository/
│               ├── redis_lua_repo.go
│               └── redis_lua_repo_test.go
│
└── payment-broker/                        # Node.js 20 + TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── Dockerfile
    └── src/
        ├── app.ts
        ├── config/kafka.ts
        └── webhooks/
            ├── controller/gateway_controller.ts
            └── services/event_publisher.ts
```

---

## 3. Zero-Configuration Automatic Startup

The entire system starts automatically with a single command:

```powershell
cd C:\Users\Phani_veluvali\.gemini\antigravity\scratch\e-auction-workspace
docker-compose up --build -d
```

### What happens automatically:
1. **PostgreSQL 16 (`:5432`)**: Boots and automatically executes `schema.sql` via `/docker-entrypoint-initdb.d/`, generating:
   - All tables, constraints, indices, and triggers.
   - Seed users (Verified Admin, Verified Buyer, Verified Seller with Indian PAN & GST).
   - Seed vehicles (Tata Motors Signa Heavy Truck, Ashok Leyland Tipper, Mahindra XUV700).
   - Seed live active auctions with countdown clocks.
2. **Redis 7 (`:6379`) & `redis-init`**: Boots up and the `redis-init` container automatically primes active auction keys (`auction:{id}:state`) with starting bids, minimum increments, and status `ACTIVE`.
3. **Kafka (`:9092`) & Zookeeper (`:2181`)**: Boots up with auto-topic creation for `vehicle-bids-topic` and `vehicle-payments-topic`.
4. **Catalog Identity Service (`:8080`)**: Boots and connects to PostgreSQL and Kafka.
5. **Bidding Engine (`:8081`)**: Boots and connects to Redis and Kafka.
6. **Payment Broker (`:8082`)**: Boots and establishes idempotent Kafka producer connection.
7. **Frontend Portal (`:3000`)**: Nginx serves the React 18 SPA at `http://localhost:3000` with instant access to live vehicles, 1-click test logins, and WebSocket bidding.

---

## 4. Default Seed Credentials (1-Click in Frontend)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@sharmatransport.in` | `Password123!` | Sharma Transport Logistics (PAN: `ABCDE1234F`) |
| **Seller** | `seller@tatafleet.in` | `Password123!` | Tata Fleet Logistics (GST: `27AAACT1234F1Z5`) |
| **Admin** | `admin@eauction.in` | `Password123!` | System Administrator |

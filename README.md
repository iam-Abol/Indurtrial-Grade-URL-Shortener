<div align="center">

# 🚀 Industrial-Grade URL Shortener

A production-oriented URL shortening service built with **NestJS**, designed with scalability, security, and performance in mind.

It goes beyond simply generating short URLs by incorporating intelligent caching, asynchronous analytics, background jobs, rate limiting, SSRF protection, Bloom Filters, and production-ready architecture.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)
![BullMQ](https://img.shields.io/badge/BullMQ-Queue-orange)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

# ✨ Features

## Core Features

- 🔗 URL Shortening
- 🔐 JWT Authentication
- 👤 User Management
- 📋 User Dashboard (My URLs)
- 🗑 Soft Delete URLs
- ⏳ Expiring URLs
- 🎯 Base62 Short Code Generation
- 📊 Click Counter
- 📈 Click Analytics
- 🤖 Bot Detection

---

## Performance Features

- ⚡ Redis Cache
- 🔥 Hot URL Cache
- 🚫 Negative Cache
- 🌸 Bloom Filter Lookup
- 📬 Async Analytics Queue (BullMQ)
- 📉 Cache TTL Jitter
- 📈 Optimized Database Indexes

---

## Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- SSRF Protection
- URL Validation
- Login Rate Limiting
- Redirect Rate Limiting
- URL Creation Rate Limiting
- Request Correlation ID
- Global Exception Handling
- Privacy-friendly IP Hashing

---

## Production Features

- Dockerized Deployment
- PostgreSQL Migrations
- Redis Integration
- Daily Cleanup Cron Job
- Structured Logging (Pino)
- Automatic Retry Queue
- Graceful Redis Failure Handling
- Testcontainers Integration
- k6 Load Testing

---

# 🏗 High Level Architecture

```text
                ┌───────────────┐
                │    Client     │
                └───────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │   NestJS API      │
              └───────┬───────────┘
                      │
        ┌─────────────┼───────────────┐
        ▼             ▼               ▼
   PostgreSQL      Redis         BullMQ Queue
        │             │               │
        │             │               ▼
        │             │      Analytics Worker
        │             │               │
        └─────────────┴───────────────┘
                      │
                      ▼
                Click Analytics
```

---

# 🧱 System Components

| Component    | Responsibility                       |
| ------------ | ------------------------------------ |
| NestJS       | REST API & Business Logic            |
| PostgreSQL   | Persistent Storage                   |
| Redis        | Cache, Rate Limiter, Hot URLs, Locks |
| BullMQ       | Asynchronous Analytics               |
| Bloom Filter | Fast URL Existence Lookup            |
| Cron Jobs    | Expired URL Cleanup                  |
| Pino         | Structured Logging                   |

---

# 🏛 Project Architecture

```mermaid
flowchart LR

Client --> Controller

Controller --> AuthService
Controller --> UrlService

UrlService --> BloomFilter
UrlService --> Redis
UrlService --> PostgreSQL

UrlService --> AnalyticsProducer

AnalyticsProducer --> BullMQ

BullMQ --> AnalyticsWorker

AnalyticsWorker --> PostgreSQL

Cron --> PostgreSQL
Cron --> Redis

Redis --> Cache
Redis --> RateLimiter
Redis --> Locks
```

---

# ⚙️ Technology Stack

| Category            | Technology       |
| ------------------- | ---------------- |
| Language            | TypeScript       |
| Framework           | NestJS           |
| Database            | PostgreSQL       |
| ORM                 | TypeORM          |
| Cache               | Redis            |
| Queue               | BullMQ           |
| Authentication      | JWT              |
| Password Hashing    | bcrypt           |
| Validation          | class-validator  |
| Logging             | Pino             |
| Testing             | Jest + Supertest |
| Integration Testing | Testcontainers   |
| Load Testing        | k6               |
| Containerization    | Docker           |

---

# 🔄 URL Shortening Flow

```mermaid
sequenceDiagram

Client->>API: POST /shorten

API->>Validator: Validate URL

Validator->>Security: SSRF Check

Security-->>API: Safe

API->>PostgreSQL: Insert URL

PostgreSQL-->>API: URL ID

API->>Base62: Encode(ID)

Base62-->>API: Short Code

API->>PostgreSQL: Update Short Code

API->>Bloom Filter: Add Code

API-->>Client: Short URL
```

---

# 🔀 Redirect Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Redis
    participant "Bloom Filter" as Bloom
    participant PostgreSQL
    participant Queue

    Client->>API: GET /:code
    API->>Redis: Rate Limit
    API->>Bloom: Exists?

    alt Definitely Not
        API-->>Client: 404
    else Maybe Exists
        API->>Redis: Negative Cache

        alt Cached Missing
            Redis-->>Client: 404
        else Continue
            API->>Redis: Hot Cache

            alt Cache Hit
                Redis-->>API: Long URL
                API->>Queue: Publish Analytics
                API-->>Client: 302 Redirect
            else Cache Miss
                API->>PostgreSQL: Lookup URL
                PostgreSQL-->>API: URL
                API->>Redis: Cache Hot URL
                API->>Queue: Publish Analytics
                API-->>Client: 302 Redirect
            end
        end
    end
```

---

# 📊 Analytics Flow

```mermaid
sequenceDiagram

Redirect Endpoint->>BullMQ: Publish Click Event

BullMQ->>Analytics Worker: Consume Event

Analytics Worker->>Analytics Service: Process Event

Analytics Service->>PostgreSQL: Save Analytics
```

---

# 🌸 Bloom Filter Strategy

Instead of querying PostgreSQL for every incoming short code, the application first checks a Bloom Filter.

```
Incoming Request

↓

Bloom Filter

↓

Definitely Missing
↓

404 immediately

OR

↓

Possibly Exists

↓

Continue lookup
```

This significantly reduces unnecessary database queries caused by invalid or random URL requests.

---

# 🚀 Multi-Level Cache Strategy

The redirect endpoint uses multiple caching layers:

```
Request

↓

Bloom Filter

↓

Negative Cache

↓

Hot Cache

↓

PostgreSQL
```

Each layer removes unnecessary work before reaching the database.

---

# 📈 Performance Optimizations

- Bloom Filter lookup
- Negative Cache
- Hot URL Cache
- Redis TTL Jitter
- Optimized Database Indexes
- Async Analytics
- Batched Cleanup Jobs
- Distributed Cron Lock
- Graceful Redis Degradation

---

# 🛡 Security Overview

- JWT Authentication
- bcrypt Password Hashing
- SSRF Protection
- URL Validation
- Rate Limiting
- Request ID Tracking
- Structured Logging
- IP Hashing
- Soft Delete
- Exception Filtering

---

# 📂 Project Structure

```text
src
├── common
│   ├── filters
│   ├── middleware
│   └── utils
│
├── database
│
├── modules
│   ├── auth
│   ├── analytics
│   ├── bloom-filter
│   ├── url
│   └── user
│
├── queue
│   ├── analytics
│   └── events
│
├── redis
│
├── migrations
│
└── main.ts
```

The project follows a **modular architecture**, where each business capability is isolated into its own NestJS module. This keeps responsibilities separated, simplifies testing, and makes the codebase easier to scale and maintain.

---

# 🧩 Module Overview

| Module       | Responsibility           |
| ------------ | ------------------------ |
| Auth         | Authentication & JWT     |
| User         | User Management          |
| URL          | URL Creation & Redirect  |
| Analytics    | Click Tracking           |
| Redis        | Cache & Rate Limiting    |
| Queue        | Background Jobs          |
| Bloom Filter | Fast URL Lookup          |
| Database     | PostgreSQL Configuration |
| Common       | Shared Utilities         |

---

# 💾 Database Schema

```mermaid
erDiagram

USER ||--o{ URL : owns

URL ||--o{ CLICK_ANALYTICS : has

USER {
    int id PK
    string email
    string password_hash
    datetime created_at
    datetime updated_at
    datetime deleted_at
}

URL {
    int id PK
    int user_id FK
    string shortCode
    string longUrl
    string customAlias
    datetime created_at
    datetime expire_at
    datetime deleted_at
    int click_count
}

CLICK_ANALYTICS {
    int id PK
    int url_id FK
    string ip_hash
    datetime timestamp
    string browser
    string os
    string device_type
    string referer_domain
    bool is_bot
}
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/url_shortener

REDIS_URL=redis://localhost:6379

SHORTENER_DOMAIN=http://localhost:3000

NODE_ENV=development

ENABLE_RATE_LIMIT=true
```

---

# 🐳 Docker

Run everything with Docker Compose.

```bash
docker compose up --build
```

Services started:

- NestJS API
- PostgreSQL
- Redis

The application automatically executes database migrations before startup.

---

# 📦 Installation

## Clone

```bash
git clone https://github.com/yourusername/url-shortener.git

cd url-shortener

cd app
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

```bash
cp .env.example .env
```

---

## Run Database Migrations

```bash
npm run migration:run
```

---

## Start Development Server

```bash
npm run start:dev
```

---

# 🚀 Production

```bash
npm run build

npm run migration:run

node dist/main.js
```

---

# 🐳 Docker Architecture

```mermaid
flowchart LR

Docker

Docker --> NestJS

Docker --> PostgreSQL

Docker --> Redis

NestJS --> PostgreSQL

NestJS --> Redis

Redis --> BullMQ
```

---

# 🔑 Authentication

The API uses **JWT Bearer Authentication**.

Workflow:

```
Signup

↓

Login

↓

Receive JWT

↓

Authorization Header

↓

Protected Endpoints
```

Protected endpoints include:

- POST /shorten
- GET /urls/my
- DELETE /urls/:id

---

# 🌐 REST API

## Authentication

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| POST   | /auth/signup | Register User |
| POST   | /auth/login  | Login         |

---

## URL

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| POST   | /shorten  | Create Short URL |
| GET    | /:code    | Redirect         |
| GET    | /urls/my  | User URLs        |
| DELETE | /urls/:id | Delete URL       |

---

## Analytics

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /analytics/url/:id/clicks |

---

# 🔄 Redirect Pipeline

The redirect endpoint is optimized to minimize unnecessary work.

```text
Incoming Request

↓

Rate Limiter

↓

Bloom Filter

↓

Negative Cache

↓

Redis Cache

↓

PostgreSQL

↓

Queue Analytics

↓

302 Redirect
```

---

# 🔥 Redis Responsibilities

Redis is used for much more than simple caching.

| Feature          | Usage                     |
| ---------------- | ------------------------- |
| URL Cache        | Hot URLs                  |
| Negative Cache   | Missing URLs              |
| Rate Limiter     | Login / Redirect / Create |
| Hit Counter      | Hot URL Detection         |
| Distributed Lock | Cron Job                  |
| BullMQ Backend   | Queue Storage             |

---

# ⏰ Background Jobs

A scheduled cleanup job runs every day.

Responsibilities:

- Find expired URLs
- Soft delete expired records
- Process in batches
- Prevent duplicate execution using Redis distributed lock

Cron Schedule:

```text
Every day at 01:00 AM
```

---

# 📬 Asynchronous Processing

Analytics collection never blocks redirects.

```mermaid
flowchart LR
    A["Redirect API"] --> B["Producer"]
    B --> C["BullMQ"]
    C --> D["Consumer"]
    D --> E["Analytics Service"]
    E --> F[("PostgreSQL")]
```

This ensures that redirect latency remains low even under heavy traffic.

---

# 📊 Logging

The application uses **Pino** for structured logging.

Features:

- Request ID
- Pretty logs in development
- JSON logs in production
- Authorization header redaction
- Cookie redaction
- Automatic request logging

---

# 🛡 Error Handling

A global exception filter provides consistent error responses.

Example:

```json
{
  "statusCode": 404,
  "timestamp": "2026-06-27T12:00:00Z",
  "path": "/abc123",
  "message": "Url not found"
}
```

---

# 🔍 Request Correlation

Each request receives a unique

```
X-Request-Id
```

This identifier propagates through logs, making debugging distributed requests significantly easier.

---


# 🧠 Security Deep Dive

This project was designed with **production-grade security considerations**, not just a simple demo.

---

## 🔒 URL Safety Validation

Every submitted URL is validated before persistence:

- Only `http` and `https` allowed
- Blocks:
  - `localhost`
  - Private IP ranges (`10.x`, `192.168.x`, `172.16-31.x`)
  - Link-local addresses
- DNS resolution is enforced to prevent:
  - SSRF attacks
  - Internal network probing

```ts
assertUrlIsSafe()
```

---

## 🛡 SSRF Protection Layer

Even if a user bypasses frontend validation:

- DNS lookup is performed server-side
- IP is checked against private ranges
- Requests to internal infrastructure are blocked

---

## 🚦 Rate Limiting

Implemented using Redis:

| Action | Limit |
|--------|------|
| Login | 5 / min per IP |
| Create URL | 100 / min per user |
| Redirect | 30 / min per IP |

Additionally:

- Graceful degradation option (`failOpen`)
- Redis failure fallback mode

---

## 🔐 Authentication Security

- JWT authentication (Passport strategy)
- Password hashing using `bcrypt (saltRounds=12)`
- Unauthorized access strictly blocked via guards

---

## 🧱 Bloom Filter Protection

To reduce DB load:

- Prevents unnecessary DB hits for invalid short codes
- Memory-efficient probabilistic lookup
- Eliminates large % of cache misses

---

# ⚡ Performance Engineering

This system is optimized for **high read-heavy traffic**.

---

## 🚀 Redirect Optimization Pipeline

```text
Bloom Filter → Redis Cache → DB → Response
```

Key optimizations:

- Hot path cached in Redis
- Negative caching for missing URLs
- Hit counter in Redis
- Batch analytics via queue

---

## 🔥 Hot URL Detection

A URL becomes "hot" after:

```
10 hits in 30 minutes
```

Then:

- Cached in Redis
- Served directly from memory layer

---

## 🧠 Redis Optimizations

- TTL-based caching
- Negative caching
- Hit counter with expiration
- Distributed lock for cron jobs
- Incremental counters instead of DB writes

---

## 🧵 Async Analytics Pipeline

Click tracking is fully async:

- No blocking on redirect path
- BullMQ queue for ingestion
- Worker processes analytics independently

---

# 📊 Benchmark Results (k6)

Load testing performed using **k6** under stress conditions.

---

## Test Scenario

```ts
stages: [
  { duration: '30s', target: 100 },
  { duration: '1m', target: 300 },
  { duration: '1m', target: 500 },
  { duration: '30s', target: 0 },
];
```

---

## Results

| Metric | Value |
|--------|------|
| Throughput | 668 RPS |
| Avg Latency | 374 ms |
| P95 Latency | 683 ms |
| Error Rate | 0% |

---

## Bottleneck Analysis

| Layer | Status |
|------|--------|
| Redis | ❄️ Not saturated |
| PostgreSQL | ❄️ Not saturated |
| Node.js App | 🔥 Bottleneck |

---

## Key Observations

- Console logging increased CPU usage
- Rate limiting caused artificial bottlenecks in multi-VU simulation
- DB was not the limiting factor
- Redis remained stable under load

---

# 🧪 Testing Strategy

## Unit Tests

- Base62 encoding/decoding

---

## Integration Tests

- Auth flow
- URL shortening flow
- CRUD operations

---

## E2E Tests

Using:

- NestJS TestingModule
- Supertest
- Testcontainers (PostgreSQL)

Coverage:

- Signup → Login → Shorten → Redirect → Delete

---

# 📈 Observability

## Logging

- Pino structured logging
- Request ID tracing
- Redacted sensitive headers

## Metrics (potential extension)

System is ready for:

- Prometheus
- Grafana dashboards
- OpenTelemetry tracing

---

# 🚀 Future Improvements

## Performance

- [ ] Redis Lua scripting for atomic counters
- [ ] Redis pipelining in analytics
- [ ] Read replicas for PostgreSQL
- [ ] CDN integration for redirect layer

## Scalability

- [ ] Multi-region deployment
- [ ] Sharded analytics storage
- [ ] Kafka instead of BullMQ (optional scale upgrade)

## Reliability

- [ ] Retry strategy improvements

---

# 🎯 Why This Project?

This is not a simple URL shortener.

It demonstrates:

- High-performance backend design
- Scalable caching strategies
- Async event-driven architecture
- Real-world production patterns
- Security-first engineering

---

# 🧾 Final Architecture Summary

```text
Client
  ↓
NestJS API
  ↓
Bloom Filter
  ↓
Redis (Cache + Rate Limit + Hits)
  ↓
PostgreSQL
  ↓
BullMQ (Analytics)
  ↓
Worker
```

---

# 🏁 Conclusion

This system is designed to handle:

- High traffic redirects
- Write-heavy analytics workloads
- Secure URL validation
- Low-latency responses

while maintaining **clean modular architecture and production readiness**.
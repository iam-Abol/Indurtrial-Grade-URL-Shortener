# Day 19 - Load Testing Report

## Objective

Evaluate the performance of the URL Shortener redirect endpoint under concurrent load and identify performance bottlenecks.

---

## Environment

* Framework: NestJS
* Database: PostgreSQL
* Cache: Redis
* Load Testing Tool: k6
* Test Type: Redirect Endpoint Stress Test

---

## Test Scenario

```javascript
stages = [
  { duration: '30s', target: 100 },
  { duration: '1m', target: 300 },
  { duration: '1m', target: 500 },
  { duration: '30s', target: 0 },
]
```

Target endpoint:

```
GET /:code
```

---

## Initial Findings

During the first benchmark almost every request returned **HTTP 429**.

Root cause:

The redirect endpoint is protected by an IP-based Redis rate limiter.

Since all k6 virtual users originate from the same IP address, the rate limiter blocked nearly all requests.

---

## Benchmark Configuration

For benchmarking purposes only, the rate limiter was disabled using an environment variable.

```env
ENABLE_RATE_LIMIT=false
```

Production deployments keep rate limiting enabled.

---

## Benchmark Results

| Metric              | Result      |
| ------------------- | ----------- |
| Requests/sec        | **668 RPS** |
| Successful Requests | **100%**    |
| Failed Requests     | **0%**      |
| Average Latency     | **374 ms**  |
| P95 Latency         | **683 ms**  |
| Max VUs             | **500**     |

---

## Infrastructure Observation

Docker resource monitoring during the benchmark:

| Service    | Observation          |
| ---------- | -------------------- |
| NestJS App | High CPU utilization |
| PostgreSQL | Minimal CPU usage    |
| Redis      | Minimal CPU usage    |

Conclusion:

The Node.js application layer becomes the primary bottleneck before PostgreSQL or Redis.

---

## Performance Investigation

The benchmark also revealed:

* Console logging increased CPU usage.
* Removing runtime logs reduced CPU and memory consumption.
* PostgreSQL was not saturated.
* Redis was not saturated.
* Rate limiting behaved correctly under heavy traffic.

---

## Conclusion

The application successfully sustained approximately **668 requests per second** with **0% error rate** under benchmark mode.

Load testing also identified the application layer as the primary performance bottleneck, providing a clear direction for future optimization work.

---

## Future Optimization Tasks

* Reduce synchronous work inside the redirect path.
* Redis pipelining.
* Lua Script for hit counting

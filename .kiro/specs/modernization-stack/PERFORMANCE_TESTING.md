# Performance Testing Guide

## Overview
This document outlines performance testing strategies and benchmarks for the AbsG5 application post-migration.

## Testing Strategy

### 1. Backend API Performance

#### Tools
- **Apache Bench (ab)**: Simple HTTP load testing
- **Artillery**: Advanced load testing with scenarios
- **k6**: Modern load testing tool

#### Key Metrics
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Database query time
- Memory usage
- CPU usage

#### Critical Endpoints to Test
```bash
# Authentication
POST /api/auth/login
GET /api/auth/check

# User operations
GET /api/users/profile
PUT /api/users/profile

# Photos
GET /api/photos
POST /api/photos/upload
GET /api/photos/:id

# Forum
GET /api/forum/topics
POST /api/forum/topics
GET /api/forum/topics/:id

# AGPA
GET /api/agpa
GET /api/agpa/edition/:year
POST /api/agpa/vote
```

#### Example Test Commands

**Simple Load Test (Apache Bench)**
```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:3000/api/auth/login

# Test GET endpoint
ab -n 1000 -c 10 http://localhost:3000/api/photos
```

**Advanced Load Test (Artillery)**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "User flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "testuser"
            password: "testpass"
      - get:
          url: "/api/photos"
      - get:
          url: "/api/forum/topics"
```

Run: `artillery run artillery-config.yml`

### 2. Frontend Performance

#### Tools
- **Lighthouse**: Overall performance audit
- **Chrome DevTools**: Network and performance profiling
- **WebPageTest**: Real-world performance testing

#### Key Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Bundle size
- Load time

#### Testing Commands

**Lighthouse CLI**
```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html

# Run with specific categories
lighthouse http://localhost:5173 --only-categories=performance,accessibility
```

**Bundle Analysis**
```bash
# Frontend
cd absg-client
npm run build
npx vite-bundle-visualizer

# Check bundle sizes
ls -lh dist/assets/
```

### 3. WebSocket Performance

#### Metrics
- Connection time
- Message latency
- Reconnection time
- Concurrent connections
- Message throughput

#### Testing Approach
```javascript
// websocket-test.js
const WebSocket = require('ws');

const connections = [];
const messageCount = 1000;
let receivedCount = 0;

// Create multiple connections
for (let i = 0; i < 100; i++) {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.on('open', () => {
    console.log(`Connection ${i} opened`);
    
    // Send test messages
    for (let j = 0; j < messageCount; j++) {
      ws.send(JSON.stringify({ test: j }));
    }
  });
  
  ws.on('message', (data) => {
    receivedCount++;
  });
  
  connections.push(ws);
}

// Monitor performance
setInterval(() => {
  console.log(`Received: ${receivedCount} messages`);
}, 1000);
```

### 4. Database Performance

#### Metrics
- Query execution time
- Connection pool usage
- Index effectiveness
- Slow query log

#### Testing Queries
```sql
-- Enable query timing
\timing on

-- Test common queries
SELECT * FROM "user" WHERE "usernameClean" = 'testuser';
SELECT * FROM "photo" WHERE "userId" = 1 ORDER BY "createdAt" DESC LIMIT 20;
SELECT * FROM "forum_topic" ORDER BY "lastActivityAt" DESC LIMIT 50;

-- Check index usage
EXPLAIN ANALYZE SELECT * FROM "user" WHERE "usernameClean" = 'testuser';

-- Find slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## Performance Baselines

### Expected Performance (Post-Migration)

#### Backend API
- **Login**: < 200ms (p95)
- **GET endpoints**: < 100ms (p95)
- **POST endpoints**: < 300ms (p95)
- **File upload**: < 2s for 5MB file
- **Throughput**: > 100 req/s per core

#### Frontend
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **TTI**: < 3.5s
- **Bundle size**: < 2MB (gzipped)
- **Load time**: < 3s on 3G

#### WebSocket
- **Connection time**: < 500ms
- **Message latency**: < 50ms
- **Reconnection**: < 2s
- **Concurrent connections**: > 1000

#### Database
- **Simple queries**: < 10ms
- **Complex queries**: < 100ms
- **Connection time**: < 50ms

## Performance Improvements from Migration

### Backend
- ✅ Node.js 20.x (faster V8 engine)
- ✅ TypeORM 0.3.x (better query optimization)
- ✅ Express 4.19.x (performance improvements)
- ✅ Modern async/await patterns
- ✅ Optimized middleware stack

### Frontend
- ✅ Vite (faster builds and HMR)
- ✅ Vue 3 (smaller bundle, faster rendering)
- ✅ Pinia (lighter than Vuex)
- ✅ Vuetify 3 (tree-shaking support)
- ✅ Modern ES modules

### Database
- ✅ PostgreSQL 16.x (query performance improvements)
- ✅ PostGIS 3.4.x (spatial query optimization)
- ✅ Better connection pooling
- ✅ Optimized indexes

## Monitoring in Production

### Tools
- **PM2**: Process monitoring
- **Winston**: Application logging
- **PostgreSQL logs**: Database monitoring
- **nginx logs**: Web server monitoring

### Key Metrics to Monitor
- Response times (p50, p95, p99)
- Error rates
- Memory usage
- CPU usage
- Database connections
- Active WebSocket connections
- Disk I/O
- Network I/O

### Alerting Thresholds
- Response time p95 > 500ms
- Error rate > 1%
- Memory usage > 80%
- CPU usage > 80%
- Database connections > 80% of pool
- Disk usage > 85%

## Performance Testing Checklist

### Pre-Production
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test API endpoints under load
- [ ] Verify database query performance
- [ ] Test WebSocket stability
- [ ] Check bundle sizes
- [ ] Profile memory usage
- [ ] Test on slow network (3G)

### Post-Deployment
- [ ] Monitor response times (first 24h)
- [ ] Check error rates
- [ ] Verify resource usage
- [ ] Test under real user load
- [ ] Compare with baseline metrics

## Optimization Opportunities

### If Performance Issues Arise

#### Backend
1. Add Redis caching for frequent queries
2. Implement database query caching
3. Optimize slow queries (use EXPLAIN ANALYZE)
4. Add CDN for static assets
5. Enable gzip compression
6. Implement pagination for large datasets

#### Frontend
1. Lazy load routes
2. Implement virtual scrolling for long lists
3. Optimize images (WebP, lazy loading)
4. Code splitting for large components
5. Service worker for offline support
6. Preload critical resources

#### Database
1. Add missing indexes
2. Optimize complex queries
3. Implement materialized views
4. Partition large tables
5. Tune PostgreSQL configuration

## Conclusion

Performance testing should be conducted:
- **Before production deployment**: Establish baselines
- **After deployment**: Verify real-world performance
- **Regularly**: Monthly performance audits
- **After major changes**: Regression testing

The migration to modern stack provides significant performance improvements. Continue monitoring and optimizing based on real-world usage patterns.

## Status
⏳ **DEFERRED TO POST-DEPLOYMENT**

Performance testing will be conducted:
1. In staging environment before production
2. During initial production deployment
3. As part of ongoing monitoring

**Rationale**: Performance testing requires:
- Staging environment setup
- Production-like data volumes
- Real user traffic patterns
- Baseline metrics from current production

These can be better established after initial deployment.

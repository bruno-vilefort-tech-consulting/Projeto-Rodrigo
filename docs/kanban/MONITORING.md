# Kanban V2 Monitoring Guide

## Overview

Guia completo de monitoramento para Kanban V2 incluindo KPIs, alertas, dashboards e logs críticos.

**Monitoring Stack:**
- Metrics: Prometheus + Grafana
- Logs: Winston + Elasticsearch + Kibana
- APM: New Relic / DataDog
- Uptime: Pingdom / UptimeRobot

---

## Key Performance Indicators (KPIs)

### 1. Error Rate

**Definition:** Percentage of failed requests related to Kanban operations

**Target:** < 0.1%
**Warning:** 0.1% - 0.5%
**Critical:** > 0.5%

**Prometheus Query:**
```promql
# Overall error rate
(
  sum(rate(http_requests_total{path=~".*kanban.*|.*tag.*|.*ticket.*", status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total{path=~".*kanban.*|.*tag.*|.*ticket.*"}[5m]))
) * 100

# Error rate by company
sum by (company_id) (
  rate(http_requests_total{path=~".*kanban.*", status=~"5.."}[5m])
) / sum by (company_id) (
  rate(http_requests_total{path=~".*kanban.*"}[5m])
) * 100
```

**Alert Rule:**
```yaml
- alert: KanbanHighErrorRate
  expr: |
    (
      sum(rate(http_requests_total{path=~".*kanban.*", status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total{path=~".*kanban.*"}[5m]))
    ) * 100 > 0.5
  for: 5m
  labels:
    severity: critical
    component: kanban-v2
  annotations:
    summary: "Kanban V2 error rate is {{ $value | humanizePercentage }}"
    description: "Error rate above 0.5% for 5 minutes"
    runbook: "https://docs.chatia.com/runbooks/kanban-high-error-rate"
```

---

### 2. Socket.IO Connection Stability

**Definition:** Percentage of time users maintain stable Socket.IO connections

**Target:** > 99%
**Warning:** 95% - 99%
**Critical:** < 95%

**Prometheus Query:**
```promql
# Connection success rate
(
  sum(rate(socketio_connection_success_total[5m]))
  /
  sum(rate(socketio_connection_attempts_total[5m]))
) * 100

# Disconnect rate
sum(rate(socketio_disconnect_total[5m])) by (reason)

# Active connections
socketio_connections_active

# Average connection duration
avg(socketio_connection_duration_seconds) by (company_id)
```

**Alert Rules:**
```yaml
- alert: KanbanSocketDisconnectRateHigh
  expr: |
    sum(rate(socketio_disconnect_total[5m])) / sum(socketio_connections_active) * 100 > 5
  for: 3m
  labels:
    severity: warning
    component: kanban-v2
  annotations:
    summary: "High Socket.IO disconnect rate: {{ $value | humanizePercentage }}"
    description: "More than 5% connections disconnecting per minute"

- alert: KanbanSocketConnectionFailing
  expr: |
    (
      sum(rate(socketio_connection_success_total[5m]))
      /
      sum(rate(socketio_connection_attempts_total[5m]))
    ) * 100 < 95
  for: 5m
  labels:
    severity: critical
    component: kanban-v2
  annotations:
    summary: "Socket.IO connection success rate: {{ $value | humanizePercentage }}"
    description: "Less than 95% of connection attempts succeeding"
```

---

### 3. Drag & Drop Success Rate

**Definition:** Percentage of successful drag and drop operations

**Target:** > 99%
**Warning:** 95% - 99%
**Critical:** < 95%

**Prometheus Query:**
```promql
# DnD success rate
(
  sum(rate(kanban_dnd_success_total[5m]))
  /
  sum(rate(kanban_dnd_attempts_total[5m]))
) * 100

# DnD latency (p50, p95, p99)
histogram_quantile(0.50, sum(rate(kanban_dnd_duration_seconds_bucket[5m])) by (le))
histogram_quantile(0.95, sum(rate(kanban_dnd_duration_seconds_bucket[5m])) by (le))
histogram_quantile(0.99, sum(rate(kanban_dnd_duration_seconds_bucket[5m])) by (le))

# DnD operations per minute
sum(rate(kanban_dnd_attempts_total[1m])) * 60
```

**Alert Rules:**
```yaml
- alert: KanbanDnDLowSuccessRate
  expr: |
    (
      sum(rate(kanban_dnd_success_total[5m]))
      /
      sum(rate(kanban_dnd_attempts_total[5m]))
    ) * 100 < 95
  for: 5m
  labels:
    severity: critical
    component: kanban-v2
  annotations:
    summary: "DnD success rate: {{ $value | humanizePercentage }}"
    description: "Less than 95% of drag and drop operations succeeding"

- alert: KanbanDnDHighLatency
  expr: |
    histogram_quantile(0.95, sum(rate(kanban_dnd_duration_seconds_bucket[5m])) by (le)) > 0.5
  for: 5m
  labels:
    severity: warning
    component: kanban-v2
  annotations:
    summary: "DnD p95 latency: {{ $value | humanizeDuration }}"
    description: "95th percentile latency above 500ms"
```

---

### 4. Tag Operations Performance

**Definition:** Latency of tag CRUD operations

**Target:** p95 < 100ms
**Warning:** p95 100-300ms
**Critical:** p95 > 300ms

**Prometheus Query:**
```promql
# Tag operation latency by operation type
histogram_quantile(0.95,
  sum(rate(kanban_tag_operation_duration_seconds_bucket[5m])) by (le, operation)
)

# Tag operations per minute
sum(rate(kanban_tag_operations_total[1m])) by (operation) * 60

# Tag operation errors
sum(rate(kanban_tag_operation_errors_total[5m])) by (operation, error_type)
```

**Alert Rules:**
```yaml
- alert: KanbanTagOperationSlow
  expr: |
    histogram_quantile(0.95,
      sum(rate(kanban_tag_operation_duration_seconds_bucket[5m])) by (le)
    ) > 0.3
  for: 5m
  labels:
    severity: warning
    component: kanban-v2
  annotations:
    summary: "Tag operations p95 latency: {{ $value | humanizeDuration }}"
    description: "Tag operations taking longer than 300ms at p95"
```

---

### 5. Database Query Performance

**Definition:** Performance of database queries related to Kanban

**Target:** p95 < 50ms
**Warning:** p95 50-200ms
**Critical:** p95 > 200ms

**SQL Monitoring Query:**
```sql
-- Top 10 slowest queries
SELECT
  substring(query, 1, 100) as query_preview,
  calls,
  mean_time,
  max_time,
  stddev_time
FROM pg_stat_statements
WHERE query LIKE '%Tag%' OR query LIKE '%Ticket%' OR query LIKE '%Lane%'
ORDER BY mean_time DESC
LIMIT 10;

-- Active queries taking > 1s
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE
  (now() - pg_stat_activity.query_start) > interval '1 second'
  AND (query LIKE '%Tag%' OR query LIKE '%Ticket%')
ORDER BY duration DESC;

-- Query cache hit ratio
SELECT
  sum(blks_hit) / sum(blks_hit + blks_read) as cache_hit_ratio
FROM pg_stat_database
WHERE datname = 'chatia_db';
```

---

### 6. Memory & CPU Usage

**Definition:** Resource consumption of Kanban V2 features

**Target:** CPU < 70%, Memory < 80%
**Warning:** CPU 70-85%, Memory 80-90%
**Critical:** CPU > 85%, Memory > 90%

**Prometheus Query:**
```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage
process_resident_memory_bytes / node_memory_MemTotal_bytes * 100

# Heap usage (Node.js)
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes * 100

# Garbage collection frequency
rate(nodejs_gc_duration_seconds_count[5m])
```

---

## Grafana Dashboards

### Dashboard 1: Kanban V2 Overview

**Dashboard ID:** `kanban-v2-overview`
**URL:** `https://grafana.chatia.com/d/kanban-v2-overview`

**Panels:**

1. **Overall Health Score**
   - Single Stat
   - Calculated from error rate, socket stability, DnD success
   - Green: 100%, Yellow: 95-99%, Red: < 95%

2. **Error Rate Timeline**
   - Graph
   - 24h window
   - Error rate by endpoint

3. **Socket.IO Connections**
   - Graph
   - Active connections
   - Connection/Disconnect rate

4. **DnD Operations**
   - Graph
   - Success rate
   - Latency (p50, p95, p99)

5. **Tag Operations/min**
   - Graph
   - Breakdown by operation type (create, update, delete)

6. **Companies with Kanban V2 Enabled**
   - Single Stat
   - Percentage of total companies

**Query Examples:**

```json
{
  "title": "Error Rate",
  "targets": [
    {
      "expr": "(\n  sum(rate(http_requests_total{path=~\".*kanban.*\", status=~\"5..\"}[5m]))\n  /\n  sum(rate(http_requests_total{path=~\".*kanban.*\"}[5m]))\n) * 100",
      "legendFormat": "Error Rate %"
    }
  ],
  "yAxes": [
    {
      "format": "percent",
      "max": 1
    }
  ]
}
```

---

### Dashboard 2: Kanban V2 Performance

**Dashboard ID:** `kanban-v2-performance`

**Panels:**

1. **API Response Time Distribution**
   - Heatmap
   - Show latency distribution over time

2. **Database Query Performance**
   - Table
   - Top 10 slowest queries

3. **Cache Hit Ratio**
   - Graph
   - Redis and Database cache hit ratios

4. **Resource Usage**
   - Graph
   - CPU, Memory, Network I/O

5. **Throughput**
   - Graph
   - Requests per second by endpoint

---

### Dashboard 3: Kanban V2 Rollout Progress

**Dashboard ID:** `kanban-v2-rollout`

**Panels:**

1. **Rollout Progress**
   - Gauge
   - % of companies with V2 enabled

2. **Adoptions per Day**
   - Graph
   - Companies enabled per day

3. **Errors by Company**
   - Table
   - Top 20 companies with most errors

4. **Support Tickets**
   - Graph
   - Kanban-related tickets over time

5. **User Feedback Score**
   - Single Stat
   - NPS score from in-app feedback

---

## Alert Configuration

### Alert Channels

```yaml
# Slack
- name: slack-kanban-alerts
  type: slack
  webhook_url: https://hooks.slack.com/services/XXX/YYY/ZZZ
  channels:
    - critical: #incidents
    - warning: #kanban-v2-rollout
    - info: #engineering-notifications

# PagerDuty
- name: pagerduty-oncall
  type: pagerduty
  integration_key: XXX
  severity_levels:
    - critical

# Email
- name: email-tech-leads
  type: email
  addresses:
    - tech-lead@chatia.com
    - devops@chatia.com
```

---

### Alert Severity Levels

| Severity | Response Time | Notification Channels | Escalation |
|----------|---------------|----------------------|------------|
| **Critical** | < 5 min | PagerDuty + Slack + SMS | Immediate on-call |
| **Warning** | < 30 min | Slack + Email | During business hours |
| **Info** | < 4 hours | Slack only | None |

---

### Alert Rules Summary

```yaml
alerts:
  # Critical
  - name: KanbanHighErrorRate
    severity: critical
    threshold: error_rate > 0.5%
    duration: 5m

  - name: KanbanSocketConnectionFailing
    severity: critical
    threshold: success_rate < 95%
    duration: 5m

  - name: KanbanDnDLowSuccessRate
    severity: critical
    threshold: success_rate < 95%
    duration: 5m

  - name: KanbanDatabaseDown
    severity: critical
    threshold: connection_failed
    duration: 1m

  # Warning
  - name: KanbanSocketDisconnectRateHigh
    severity: warning
    threshold: disconnect_rate > 5%
    duration: 3m

  - name: KanbanDnDHighLatency
    severity: warning
    threshold: p95_latency > 500ms
    duration: 5m

  - name: KanbanTagOperationSlow
    severity: warning
    threshold: p95_latency > 300ms
    duration: 5m

  - name: KanbanHighCPU
    severity: warning
    threshold: cpu > 85%
    duration: 10m

  - name: KanbanHighMemory
    severity: warning
    threshold: memory > 90%
    duration: 10m

  # Info
  - name: KanbanHighLoad
    severity: info
    threshold: requests_per_sec > 1000
    duration: 5m

  - name: KanbanNewCompanyEnabled
    severity: info
    threshold: rollout_progress_change
    duration: immediate
```

---

## Important Logs

### Log Patterns to Monitor

#### 1. Socket.IO Connection Issues

```javascript
// Search pattern in Kibana/Elasticsearch
message: "Socket.IO connection failed" OR
message: "Socket disconnect" OR
context.event: "socketio_error"

// Example log entry
{
  "timestamp": "2025-10-13T14:23:45.123Z",
  "level": "error",
  "message": "Socket.IO connection failed",
  "context": {
    "companyId": "123",
    "userId": "456",
    "error": "Connection timeout",
    "namespace": "/workspace-123"
  }
}
```

**Alert if:** > 10 occurrences in 5 minutes for same company

---

#### 2. DnD Operation Failures

```javascript
// Search pattern
message: "Drag and drop failed" OR
context.operation: "ticket_move" AND level: "error"

// Example log entry
{
  "timestamp": "2025-10-13T14:23:45.123Z",
  "level": "error",
  "message": "Failed to update ticket position",
  "context": {
    "companyId": "123",
    "ticketId": "789",
    "fromLane": "todo",
    "toLane": "doing",
    "error": "Database constraint violation",
    "duration_ms": 5432
  }
}
```

**Alert if:** > 5 failures in 1 minute

---

#### 3. Tag Operation Errors

```javascript
// Search pattern
context.resource: "tag" AND level: "error"

// Example log entry
{
  "timestamp": "2025-10-13T14:23:45.123Z",
  "level": "error",
  "message": "Failed to create tag",
  "context": {
    "companyId": "123",
    "operation": "create",
    "tagName": "Urgent",
    "error": "Duplicate tag name",
    "userId": "456"
  }
}
```

**Alert if:** Same company has > 3 tag errors in 5 minutes

---

#### 4. Performance Degradation

```javascript
// Search pattern
context.duration_ms > 1000 AND context.endpoint: "/kanban/*"

// Example log entry
{
  "timestamp": "2025-10-13T14:23:45.123Z",
  "level": "warn",
  "message": "Slow API response",
  "context": {
    "endpoint": "/kanban/tickets",
    "method": "GET",
    "companyId": "123",
    "duration_ms": 1234,
    "query_time_ms": 987,
    "rows_returned": 1500
  }
}
```

**Alert if:** p95 latency > 500ms for 5 minutes

---

#### 5. Database Errors

```javascript
// Search pattern
context.database: "error" AND context.query: "tag*" OR "ticket*"

// Example log entry
{
  "timestamp": "2025-10-13T14:23:45.123Z",
  "level": "error",
  "message": "Database query failed",
  "context": {
    "query": "INSERT INTO Tags...",
    "error": "unique constraint violation",
    "constraint": "Tags_name_companyId_key",
    "companyId": "123"
  }
}
```

**Alert if:** > 5 database errors in 1 minute

---

## Log Aggregation Queries

### Elasticsearch/Kibana Queries

```json
// Top errors in last hour
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" } },
        { "match": { "context.component": "kanban-v2" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "top_errors": {
      "terms": {
        "field": "message.keyword",
        "size": 10
      }
    }
  }
}

// Companies with most errors
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" } },
        { "exists": { "field": "context.companyId" } },
        { "range": { "timestamp": { "gte": "now-24h" } } }
      ]
    }
  },
  "aggs": {
    "by_company": {
      "terms": {
        "field": "context.companyId.keyword",
        "size": 20,
        "order": { "_count": "desc" }
      }
    }
  }
}

// Performance outliers
{
  "query": {
    "bool": {
      "must": [
        { "exists": { "field": "context.duration_ms" } },
        { "range": { "context.duration_ms": { "gte": 500 } } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [
    { "context.duration_ms": { "order": "desc" } }
  ],
  "size": 50
}
```

---

## Monitoring Checklist

### Daily

- [ ] Review Grafana dashboards (5 min)
- [ ] Check error rate trend
- [ ] Verify no critical alerts
- [ ] Review support tickets related to Kanban

### Weekly

- [ ] Deep dive into performance metrics
- [ ] Review slow queries
- [ ] Analyze rollout progress
- [ ] Check resource utilization trends
- [ ] Review and tune alert thresholds

### Monthly

- [ ] Performance report generation
- [ ] Capacity planning review
- [ ] Alert effectiveness analysis
- [ ] Dashboard optimization
- [ ] Metrics retention policy review

---

## Runbook Links

| Issue | Runbook |
|-------|---------|
| High Error Rate | `/docs/kanban/TROUBLESHOOTING.md#high-error-rate` |
| Socket Disconnects | `/docs/kanban/TROUBLESHOOTING.md#socket-disconnects` |
| DnD Not Working | `/docs/kanban/TROUBLESHOOTING.md#dnd-issues` |
| Performance Degradation | `/docs/kanban/TROUBLESHOOTING.md#performance` |
| Database Issues | `/docs/kanban/TROUBLESHOOTING.md#database` |

---

## Metrics Instrumentation

### Backend (Node.js)

```javascript
// Example instrumentation code
const prometheus = require('prom-client');

// DnD operation metrics
const dndDuration = new prometheus.Histogram({
  name: 'kanban_dnd_duration_seconds',
  help: 'Duration of drag and drop operations',
  labelNames: ['company_id', 'from_lane', 'to_lane'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const dndAttempts = new prometheus.Counter({
  name: 'kanban_dnd_attempts_total',
  help: 'Total number of DnD attempts',
  labelNames: ['company_id']
});

const dndSuccess = new prometheus.Counter({
  name: 'kanban_dnd_success_total',
  help: 'Total number of successful DnD operations',
  labelNames: ['company_id']
});

// Usage in code
async function moveTicket(ticketId, toLaneId, companyId) {
  const timer = dndDuration.startTimer({ company_id: companyId });
  dndAttempts.inc({ company_id: companyId });

  try {
    await ticketService.updateLane(ticketId, toLaneId);
    dndSuccess.inc({ company_id: companyId });
    return { success: true };
  } catch (error) {
    logger.error('DnD operation failed', { ticketId, toLaneId, error });
    throw error;
  } finally {
    timer();
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Owner:** Engineering & DevOps Teams
**Review Frequency:** Monthly or after incidents

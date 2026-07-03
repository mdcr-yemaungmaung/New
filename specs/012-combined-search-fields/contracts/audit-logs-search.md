# API Contract: Audit Log Search

**Endpoint**: `GET /api/admin/audit-logs`
**Auth**: JWT Bearer token (Admin role required)

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | string | No | — | Combined search term. Matches request_number OR actor_name (case-insensitive, partial match). Max 100 chars. |
| requestNumber | string | No | — | Legacy: search by request number only. Ignored when `search` is provided. |
| actorName | string | No | — | Legacy: search by actor name only. Ignored when `search` is provided. |
| startDate | string | No | — | ISO 8601 date — filter logs from this date |
| endDate | string | No | — | ISO 8601 date — filter logs up to this date |
| actionTypeId | int | No | — | Filter by action type ID |
| page | int | No | 1 | Page number (min 1) |
| pageSize | int | No | 50 | Items per page (min 1, max 100) |

### Example

```
GET /api/admin/audit-logs?search=PRF-001&page=1&pageSize=50
```

## Response

### 200 OK

```json
{
  "data": [
    {
      "approvalLogId": "uuid",
      "paymentRequestId": 10,
      "requestNumber": "PRF-001",
      "actionTakenByUserId": 1,
      "actorName": "田中太郎",
      "actionTypeId": 3,
      "previousStatusId": null,
      "newStatusId": 2,
      "comment": null,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0",
      "timestamp": "2026-07-01T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (not Admin role) |
| 400 | Bad Request (invalid query parameters) |

## Behavior

- When `search` is provided: OR logic across `request_number` (joined) and `actor_name` (joined)
- When `search` is not provided: individual params (`requestNumber`, `actorName`) work as before
- `search` takes precedence over individual params when both are provided
- Date range and action type filters work independently of search
- Search is case-insensitive and matches substrings

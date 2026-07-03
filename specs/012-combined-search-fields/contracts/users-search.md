# API Contract: User Search

**Endpoint**: `GET /api/admin/users`
**Auth**: JWT Bearer token (Admin role required)

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | string | No | — | Combined search term. Matches employee_number OR full_name (case-insensitive, partial match). Max 100 chars. |
| employeeNumber | string | No | — | Legacy: search by employee number only. Ignored when `search` is provided. |
| employeeName | string | No | — | Legacy: search by employee name only. Ignored when `search` is provided. |
| roleId | int | No | — | Filter by role ID |
| isActive | string | No | — | Filter by active status ("true" or "false") |
| page | int | No | 1 | Page number (min 1) |
| pageSize | int | No | 20 | Items per page (min 1, max 100) |

### Example

```
GET /api/admin/users?search=tanaka&page=1&pageSize=20
```

## Response

### 200 OK

```json
{
  "data": [
    {
      "userId": 1,
      "employeeNumber": "EMP-001",
      "fullName": "田中太郎",
      "email": "tanaka@example.com",
      "branch": "Tokyo",
      "roleId": 1,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
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

- When `search` is provided: OR logic across `employee_number` and `full_name`
- When `search` is not provided: individual params (`employeeNumber`, `employeeName`) work as before
- `search` takes precedence over individual params when both are provided
- Search is case-insensitive and matches substrings

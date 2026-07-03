# Data Model: Combined Search Fields

**Date**: 2026-07-02
**Feature**: 012-combined-search-fields

## Entities

No new entities are introduced. This feature modifies query behavior on existing entities.

### User (existing)

| Field | Type | Notes |
|-------|------|-------|
| employee_number | varchar | Indexed, format: `EMP-XXXXX` |
| full_name | varchar | Indexed, case-insensitive search target |
| email | varchar | |
| branch | varchar | |
| role_id | int | FK → Role |
| is_active | boolean | |

**Search behavior**: `search` parameter matches against `employee_number` OR `full_name` using ILIKE `%term%`

### ApprovalLog (existing)

| Field | Type | Notes |
|-------|------|-------|
| approval_log_id | uuid | PK |
| payment_request_id | int | FK → PaymentRequest |
| action_taken_by_user_id | int | FK → User |
| action_type_id | int | FK → ActionType |
| timestamp | timestamp | |

**Joined tables for search**:
- `PaymentRequest.request_number` — search target
- `User.fullName` (via `action_taken_by_user_id`) — search target

**Search behavior**: `search` parameter matches against `PaymentRequest.request_number` OR `User.fullName` using ILIKE `%term%`

## Query Patterns

### User Search (GET /api/admin/users?search=term)

```sql
SELECT * FROM users u
WHERE (u.employee_number ILIKE '%term%' OR u.full_name ILIKE '%term%')
  AND u.role_id = :roleId        -- optional
  AND u.is_active = :isActive    -- optional
ORDER BY u.employee_number ASC
LIMIT :pageSize OFFSET :offset
```

### Audit Log Search (GET /api/admin/audit-logs?search=term)

```sql
SELECT log.*, pr.request_number, u.full_name AS actor_name
FROM approval_logs log
LEFT JOIN payment_requests pr ON log.payment_request_id = pr.id
LEFT JOIN users u ON log.action_taken_by_user_id = u.user_id
WHERE (pr.request_number ILIKE '%term%' OR u.full_name ILIKE '%term%')
  AND log.timestamp >= :startDate  -- optional
  AND log.timestamp <= :endDate    -- optional
  AND log.action_type_id = :actionTypeId  -- optional
ORDER BY log.timestamp DESC
LIMIT :pageSize OFFSET :offset
```

## Validation Rules

| Parameter | Type | Max Length | Validation |
|-----------|------|------------|------------|
| search | string | 100 | Optional, trimmed, no special validation needed (ILIKE handles safely via parameterized queries) |

# Quickstart Validation Guide: Combined Search Fields

**Date**: 2026-07-02
**Feature**: 012-combined-search-fields

## Prerequisites

- Backend running on `http://localhost:3005`
- Frontend running on `http://localhost:5173`
- Admin user logged in
- Database seeded with test data (users + audit logs)

## Validation Scenarios

### V1: User Management — Combined Search by Name

1. Navigate to Admin Console → User Management
2. Verify the search area shows a single "Search" text box (not separate Employee Number and Employee Name fields)
3. Type "Tanaka" in the Search box
4. Click the Search button
5. **Expected**: Users with "Tanaka" in their employee name are displayed
6. Clear the search
7. **Expected**: All users are displayed again

### V2: User Management — Combined Search by Employee Number

1. In the Search box, type "001"
2. Click Search
3. **Expected**: Users with "EMP-001" in their employee number are displayed (partial match)

### V3: User Management — Search with Existing Filters

1. Select "Manager" from the Role dropdown
2. Type "Tokyo" in the Search box
3. Click Search
4. **Expected**: Only Manager users in Tokyo branch are displayed (AND logic between search and dropdown)

### V4: Audit Logs — Combined Search by Request Number

1. Navigate to Admin Console → Audit Logs
2. Verify the search area shows a single "Search" text box (not separate Request Number and Actor fields)
3. Type "PRF-001" in the Search box
4. Click Search
5. **Expected**: Audit log entries for request PRF-001 are displayed

### V5: Audit Logs — Combined Search by Actor Name

1. Clear the search
2. Type "田中" in the Search box
3. Click Search
4. **Expected**: Audit log entries where the actor name contains "田中" are displayed

### V6: Audit Logs — Search with Date Range

1. Set a date range (start and end dates)
2. Type "tanaka" in the Search box
3. Click Search
4. **Expected**: Only audit logs within the date range AND matching "tanaka" are displayed

### V7: Empty Search

1. Leave the Search box empty
2. Click Search (or Clear Filters)
3. **Expected**: All records are displayed (no filter applied)

### V8: Case-Insensitive Search

1. Type "TANAKA" (uppercase) in the Search box
2. Click Search
3. **Expected**: Users/actors containing "tanaka" (lowercase) are also matched

### V9: Backend API — Direct Test

```bash
# User search
curl -H "Authorization: Bearer <token>" "http://localhost:3005/api/admin/users?search=tanaka"

# Audit log search
curl -H "Authorization: Bearer <token>" "http://localhost:3005/api/admin/audit-logs?search=PRF-001"
```

**Expected**: Both return filtered results with OR logic applied.

## Regression Check

- Existing Role/Status dropdowns on User Management still work
- Existing Date Range/Action Type filters on Audit Logs still work
- Pagination still works correctly
- Sorting still works correctly
- Clear Filters button clears all fields including Search

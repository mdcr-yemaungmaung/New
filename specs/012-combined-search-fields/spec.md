# Feature Specification: Combined Search Fields

**Feature ID**: 012
**Short Name**: combined-search-fields
**Created**: 2026-07-02
**Status**: Draft

## Overview

Simplify the search experience in the Admin console by consolidating multiple search fields into a single unified search box on two screens: User Management and Audit Logs. Users currently must use separate fields to search by employee number/name or request number/actor, which is cumbersome. This change merges those into one "Search" text box that searches across all relevant fields simultaneously.

## User Scenarios & Testing

### Primary User Flow

**Scenario 1: User Management — Combined Search**

1. Admin navigates to the User Management screen
2. Admin sees a single text input labeled "Search" (replacing the separate "Employee Number" and "Employee Name" fields)
3. Admin types a search term (e.g., "EMP-001" or "田中" or "Tanaka")
4. Admin clicks the Search button (or presses Enter)
5. System returns users matching the search term in **either** employee number **or** employee name (OR logic)
6. Results display in the existing paginated table

**Scenario 2: Audit Logs — Combined Search**

1. Admin navigates to the Audit Logs screen
2. Admin sees a single text input labeled "Search" (replacing the separate "Request Number" and "Actor" fields)
3. Admin types a search term (e.g., "PRF-001" or "田中" or "Tanaka")
4. Admin clicks the Search button (or presses Enter)
5. System returns audit log entries matching the search term in **either** request number **or** actor name (OR logic)
6. Results display in the existing paginated table

**Scenario 3: Clearing the Combined Search**

1. Admin has entered a search term in the combined Search box
2. Admin clicks the Clear Filters button
3. The Search box is cleared and all results are shown

### Edge Cases

- Empty search term: Show all records (no filter applied)
- Search term with only whitespace: Treated as empty
- Partial match: Search should match substrings (e.g., "Tan" matches "Tanaka")
- Case-insensitive: Search should be case-insensitive
- Special characters: Search should handle special characters safely (no injection)

## Functional Requirements

### FR-01: User Management Combined Search

**Given** an admin is on the User Management screen
**When** they enter a search term in the "Search" text box
**Then** the system filters users where the employee number OR employee name contains the search term (case-insensitive, partial match)

**Acceptance Criteria**:
- The separate "Employee Number" and "Employee Name" fields are replaced by a single text input labeled "Search"
- The Search field accepts free text input
- The search is case-insensitive
- The search matches partial strings (ILIKE %term%)
- The search checks both `employee_number` and `full_name` columns
- When the search term looks like an employee number (starts with "EMP-" or is numeric), it also matches against the employee number field
- Empty search returns all users
- The existing Role and Status dropdown filters remain unchanged

### FR-02: Audit Logs Combined Search

**Given** an admin is on the Audit Logs screen
**When** they enter a search term in the "Search" text box
**Then** the system filters audit logs where the request number OR actor name contains the search term (case-insensitive, partial match)

**Acceptance Criteria**:
- The separate "Request Number" and "Actor" fields are replaced by a single text input labeled "Search"
- The Search field accepts free text input
- The search is case-insensitive
- The search matches partial strings (ILIKE %term%)
- The search checks both `request_number` (via joined payment_requests table) and `actor_name` (via joined users table)
- When the search term looks like a request number (starts with "PRF-" or is numeric), it also matches against the request number field
- Empty search returns all audit logs
- The existing Date Range and Action Type filters remain unchanged

### FR-03: Backend API — User Search Parameter

**Given** the frontend sends a request to `GET /api/admin/users`
**When** a `search` query parameter is provided
**Then** the backend filters users where `employee_number ILIKE %search%` OR `full_name ILIKE %search%`

**Acceptance Criteria**:
- The API accepts an optional `search` query parameter (string, max 100 characters)
- When `search` is provided, both `employeeNumber` and `employeeName` individual parameters are ignored
- When `search` is provided, the backend applies OR logic across both fields
- The existing `employeeNumber`, `employeeName`, `roleId`, `isActive` parameters continue to work for backward compatibility
- The `search` parameter is sanitized against SQL injection (TypeORM parameterized queries)

### FR-04: Backend API — Audit Log Search Parameter

**Given** the frontend sends a request to `GET /api/admin/audit-logs`
**When** a `search` query parameter is provided
**Then** the backend filters audit logs where `request_number ILIKE %search%` OR `actor_name ILIKE %search%`

**Acceptance Criteria**:
- The API accepts an optional `search` query parameter (string, max 100 characters)
- When `search` is provided, both `requestNumber` and `actorName` individual parameters are ignored
- When `search` is provided, the backend applies OR logic across both fields
- The existing `requestNumber`, `actorName`, `startDate`, `endDate`, `actionTypeId` parameters continue to work for backward compatibility
- The `search` parameter is sanitized against SQL injection (TypeORM parameterized queries)

## Success Criteria

1. **Reduced Clicks**: Users can search by any text field with a single input instead of choosing between two fields
2. **No Regression**: Existing filters (Role, Status, Date Range, Action Type) continue to work identically
3. **Backward Compatibility**: Existing API consumers using `employeeNumber`/`employeeName` or `requestNumber`/`actorName` parameters are unaffected
4. **Performance**: Combined search performance is equivalent to individual field search (no noticeable degradation)

## Key Entities

- **User**: `employee_number`, `full_name`, `email`, `branch`, `role_id`, `is_active`
- **AuditLog**: `approval_log_id`, `payment_request_id`, `action_taken_by_user_id`, `action_type_id`, `timestamp`
- **PaymentRequest**: `request_number` (joined to AuditLog)
- **User (actor)**: `full_name` (joined to AuditLog via `action_taken_by_user_id`)

## Assumptions

1. The combined search uses OR logic (not AND) — matching either field is sufficient
2. The search is substring-based (ILIKE %term%) not exact match
3. The search is case-insensitive
4. The EMP- prefix stripping on the frontend is retained for employee number display
5. The PRF- prefix auto-prepending on the frontend is retained for request number display
6. The 300ms debounce from SearchFilterBar applies to the combined search field
7. The `search` parameter takes precedence over individual `employeeNumber`/`employeeName` or `requestNumber`/`actorName` when both are provided

## Scope

**In Scope**:
- Frontend: User Management screen — replace two text fields with one combined Search field
- Frontend: Audit Logs screen — replace two text fields with one combined Search field
- Backend: Admin controller and service — add `search` parameter support for both endpoints
- Backend: DTO validation for new `search` parameter
- i18n: Update locale files if filter labels change

**Out of Scope**:
- Changes to other screens (Applicant, Manager, Approver, Accounting)
- Changes to the SearchFilterBar shared component (the combined search is implemented at the page level)
- Full-text search or Elasticsearch integration
- Search history or saved searches

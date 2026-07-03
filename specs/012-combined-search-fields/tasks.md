# Tasks: Combined Search Fields

**Input**: Design documents from `/specs/012-combined-search-fields/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included — not explicitly requested in feature specification.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed — changes are modifications to existing files.

*No tasks in this phase.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend API changes that both user stories depend on

**⚠️ CRITICAL**: Frontend work depends on backend `search` parameter being available

- [X] T001 Add `search` field to AuditLogQueryDto in `src/modules/admin/dto/audit-log-query.dto.ts`
- [X] T002 Add `search` parameter to AdminController.getUsers() in `src/modules/admin/admin.controller.ts`
- [X] T003 Add OR logic for combined search in AdminService.getUsers() in `src/modules/admin/admin.service.ts`
- [X] T004 Add `search` parameter to AdminController.getAuditLogs() in `src/modules/admin/admin.controller.ts`
- [X] T005 Add OR logic for combined search in AdminService.getAuditLogs() in `src/modules/admin/admin.service.ts`

**Checkpoint**: Backend API supports `search` parameter on both endpoints — frontend can now consume it

---

## Phase 3: User Story 1 — User Management Combined Search (Priority: P1) 🎯 MVP

**Goal**: Admin sees a single "Search" text box on User Management screen that searches employee number OR employee name

**Independent Test**: Navigate to User Management, type in Search box, verify results match either employee number or employee name

### Implementation for User Story 1

- [X] T006 [US1] Replace `employeeNumber` and `employeeName` filter fields with single `search` field in `frontend/src/pages/admin/UserManagementWorkspace.tsx` filterFields array
- [X] T007 [US1] Update `handleApply` and `handleClear` in `frontend/src/pages/admin/UserManagementWorkspace.tsx` to use `search` parameter
- [X] T008 [US1] Update `fetchUsers` and `load` function in `frontend/src/pages/admin/UserManagementWorkspace.tsx` to send `search` parameter to backend API

**Checkpoint**: User Management screen shows single Search box, searches across employee number and name

---

## Phase 4: User Story 2 — Audit Logs Combined Search (Priority: P2)

**Goal**: Admin sees a single "Search" text box on Audit Logs screen that searches request number OR actor name

**Independent Test**: Navigate to Audit Logs, type in Search box, verify results match either request number or actor name

### Implementation for User Story 2

- [X] T009 [US2] Replace `requestNumber` and `actorName` filter fields with single `search` field in `frontend/src/pages/admin/AuditLogWorkspace.tsx` filterFields/draft state
- [X] T010 [US2] Update `handleSearch` and `handleClear` in `frontend/src/pages/admin/AuditLogWorkspace.tsx` to use `search` parameter
- [X] T011 [US2] Update `load` function in `frontend/src/pages/admin/AuditLogWorkspace.tsx` to send `search` parameter to backend API

**Checkpoint**: Audit Logs screen shows single Search box, searches across request number and actor name

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T012 Run `npm run lint` and fix any errors
- [X] T013 Run `npm run build` and verify no TypeScript errors
- [X] T014 Run `npm run test` and verify all tests pass
- [X] T015 Run quickstart.md validation scenarios V1–V9
- [X] T016 Verify backward compatibility — existing individual params still work via direct API call

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks — skipped
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (backend `search` param)
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (backend `search` param)
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on US2
- **US2 (P2)**: Can start after Phase 2 — no dependencies on US1
- US1 and US2 can be implemented in parallel

### Parallel Opportunities

- T001–T005 (backend): Sequential — same files
- T006–T008 (US1 frontend) and T009–T011 (US2 frontend): Can run in parallel (different files)
- T012–T016 (polish): Sequential — validation steps

---

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 2 completes, launch both frontend tasks in parallel:
Task T006-T008: "User Management combined search in UserManagementWorkspace.tsx"
Task T009-T011: "Audit Logs combined search in AuditLogWorkspace.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Backend search parameter
2. Complete Phase 3: User Management combined search
3. **STOP and VALIDATE**: Test User Management search independently
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 → Backend ready
2. Phase 3 → User Management search works (MVP!)
3. Phase 4 → Audit Logs search works
4. Phase 5 → Validation and polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

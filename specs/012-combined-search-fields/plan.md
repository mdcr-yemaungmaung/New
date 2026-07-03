# Implementation Plan: Combined Search Fields

**Branch**: `012-combined-search-fields` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-combined-search-fields/spec.md`

## Summary

Replace separate Employee Number/Employee Name and Request Number/Actor text fields with a single unified "Search" text box on User Management and Audit Logs screens. Backend adds a `search` query parameter that applies OR logic across both fields using ILIKE partial matching.

## Technical Context

**Language/Version**: TypeScript 5.7.3, Node.js 24.x

**Primary Dependencies**: NestJS 11, TypeORM (backend), React 19, Tailwind CSS (frontend)

**Storage**: PostgreSQL (existing)

**Testing**: Jest 29.7.0, ts-jest 29.4.11

**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (frontend + backend monorepo)

**Performance Goals**: No regression from current search performance (< 200ms API response)

**Constraints**: 300ms debounce on search inputs (per SearchFilterBar pattern)

**Scale/Scope**: Admin console — ~100-1000 users, ~10k audit log entries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Validated against Strict Naming Conventions, Type Safety & Documentation Standards (I)
  - camelCase variables/functions, PascalCase classes/components
  - Explicit return types on public methods
  - JSDoc on all public methods
- [x] Confirmed Module-Based Directory Isolation — internal structure & shared layer access control (II)
  - Changes confined to `admin` module (backend) and `admin` pages (frontend)
  - No cross-module imports
  - SearchFilterBar shared component is NOT modified (out of scope per spec)
- [x] Checked against Security, Auth, Error Handling & Audit Trail Standards (IV)
  - All admin endpoints require `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(RoleCode.ADMIN)`
  - SQL injection prevented via TypeORM parameterized queries
- [x] Ensured UI/UX Design System Compliance — colors, typography, accessibility (V)
  - Uses Tailwind tokens: `focus:ring-indigo-500`, `bg-blue-900`, `text-slate-900`
  - Consistent with existing SearchFilterBar input styling
- [x] Aligned with Detailed Design "Contract" & Architecture (VI) — tech stack, 4-layer model, path aliases
  - Backend: admin.controller.ts → admin.service.ts → repository (TypeORM)
  - Frontend: UserManagementWorkspace.tsx / AuditLogWorkspace.tsx → apiClient → backend
- [x] Verified Performance Targets, API Design & Environment Standards (VII)
  - API parameters validated via class-validator DTOs
  - Existing pagination and sorting unchanged
- [x] Confirmed Git Branching, Commit & PR Standards compliance (VIII)
  - Feature branch: `012-combined-search-fields`
  - Conventional commits

## Project Structure

### Documentation (this feature)

```text
specs/012-combined-search-fields/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
# Web application (frontend + backend)
src/modules/admin/
├── admin.controller.ts     # Add `search` query param to getUsers() and getAuditLogs()
├── admin.service.ts        # Add OR logic for combined search
└── dto/
    └── audit-log-query.dto.ts  # Add `search` field

frontend/src/pages/admin/
├── UserManagementWorkspace.tsx  # Replace employeeNumber+employeeName fields with single search
└── AuditLogWorkspace.tsx        # Replace requestNumber+actorName fields with single search

frontend/src/locales/
├── en.json    # No changes needed (common.search already exists)
├── ja.json    # No changes needed
└── my.json    # No changes needed
```

**Structure Decision**: Existing monorepo structure. Changes confined to admin module (backend) and admin pages (frontend). No new files needed — modifications to existing files only.

## Complexity Tracking

No constitution violations. This is a straightforward search consolidation with no architectural tradeoffs.

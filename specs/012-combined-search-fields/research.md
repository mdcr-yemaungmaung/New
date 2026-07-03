# Research: Combined Search Fields

**Date**: 2026-07-02
**Feature**: 012-combined-search-fields

## Decision Log

### D1: Backend Search Implementation Strategy

**Decision**: Add a `search` query parameter to both endpoints that applies OR logic across relevant fields using TypeORM QueryBuilder.

**Rationale**:
- TypeORM's QueryBuilder supports parameterized ILIKE queries natively (`qb.andWhere('column ILIKE :search', { search: `%${term}%` })`)
- OR logic is expressed with `qb.andWhere('(col1 ILIKE :search OR col2 ILIKE :search)', { search })`
- No new database indexes needed — existing indexes on `employee_number` and `full_name` suffice for current scale
- Parameterized queries prevent SQL injection

**Alternatives considered**:
- Database VIEW: Unnecessary complexity for two simple OR conditions
- Full-text search (PostgreSQL `tsvector`): Overkill for substring matching at current scale
- Application-level filtering: Inefficient for large datasets

### D2: Frontend Search Field Implementation

**Decision**: Replace the two separate FilterField entries with a single FilterField entry in the `filterFields` array, passing the combined search value to the backend `search` parameter.

**Rationale**:
- SearchFilterBar already supports dynamic field arrays — just change the fields passed
- The combined search field uses the same text input styling as existing fields
- No changes to SearchFilterBar component needed (out of scope per spec)
- The EMP-/PRF- prefix handling is moved to backend (ILIKE handles both prefixed and unprefixed)

**Alternatives considered**:
- Modify SearchFilterBar to support "combined" field type: Unnecessary coupling
- Keep frontend sending two params, combine in backend: Loses the simplified UX

### D3: Backward Compatibility Strategy

**Decision**: When `search` parameter is provided, ignore individual `employeeNumber`/`employeeName` or `requestNumber`/`actorName` parameters. When `search` is not provided, fall back to existing individual parameter behavior.

**Rationale**:
- Frontend will always send `search` after this change
- Existing API consumers (if any) continue to work with individual params
- Clear precedence rule avoids ambiguous behavior

**Alternatives considered**:
- Always apply both `search` AND individual params: Creates AND logic that users don't expect
- Deprecate individual params immediately: Breaking change for no benefit

### D4: i18n Label

**Decision**: Use existing `common.search` key for the "Search" label across all three locales.

**Rationale**:
- `common.search` already exists: en="Search", ja="検索", my="ရှာဖွေရန်"
- No new translation keys needed
- Consistent with existing search button label

**Alternatives considered**:
- Create new `admin.user_management.filters.search` key: Redundant
- Use different labels per screen: Confusing UX

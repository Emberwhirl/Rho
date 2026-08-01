# RA-RC1 Run Comparison Handoff

Status: accepted
Authorization date: 2026-07-31
Authorized by: project owner
Baseline for authorization: `bb31f16` (BH5 accepted)
Priority: P1 — Wave 3 entry gate

## Scope

RA-RC1 implements deterministic, read-only two-run comparison over existing
durable records. It consumes the evidence model built in BH1-BH5 and `0.3.x`
without adding a new database table, execution path, or mutation.

### Deliverables

- `compare_runs(left_run_id, right_run_id)` broker command
  - injects active normalized project root from broker state
  - verifies both runs belong to same project (rejects cross-project pairs)
  - resolves run details, Problems, environment snapshots, and artifact records
  - returns derived comparison response; no write to SQLite
- deterministic comparison across 5 sections:
  - Identity and execution (origin, request type, status, timestamps, revisions)
  - Source and request (path, document version, code digest, bounded text diff)
  - Environment (snapshot identity, R/Bioc versions, package adds/removals/drifts)
  - Outcome and Problems (messages, warnings, errors, linked Problems)
  - Artifacts (kind, path, media type, availability, provenance)
- each field returns `same | different | left_only | right_only | unknown | not_applicable`
- bounded response (2 MiB serialized), with per-section truncation
- project-scoped run selector UI in existing Runs workflow
- browser/mock parity handler in `desktop/dist/app.js`

### Rules

1. Missing is not equal: null field → `unknown`, never `same`.
2. Equal snapshot IDs prove recorded evidence equality only, not scientific equivalence.
3. Cross-project run pairs are rejected.
4. No comparison-result persistence. Response is recomputed on demand.
5. Frontend mock handler must be added in the same implementation package.
6. Existing test matrix must stay green.

## Out of scope

- RA-RC2 reproducibility audit (separate authorization after RA-RC1 accepted)
- executing or mutating project code, packages, files, or environments
- comparing environment-operation runs (different before/after semantics)
- comparing plot pixels, table contents, PDFs, HTML, or model objects
- Agent explanation, report export, or durable finding lifecycle
- claiming bit-for-bit reproducibility or scientific equivalence

## Implementation plan

### Phase A: Backend comparison engine

1. Add `compare_runs` method on `Store` (read-only aggregation over existing tables)
2. Implement 5 comparison sections with field-level state resolution
3. Add byte-budget enforcement and truncation reporting
4. Add rejection for cross-project, missing-run, and non-scientific runs

### Phase B: Tauri command and mock

5. Add `compare_runs` Tauri command in `desktop/src-tauri/src/`
6. Add mock handler in `desktop/dist/app.js`

### Phase C: UI

7. Add left/right run selector in Runs panel
8. Render comparison summary strip and 5 collapsible sections
9. Field-level `same`/`different`/`unknown` labels (not color alone)
10. Links to existing run detail, source, Problem, Environment, Artifact surfaces
11. Swap left/right without recomputing

### Phase D: Tests and verification

12. Store-layer tests: same, different, missing, cross-project, partial evidence
13. Byte-budget and truncation tests
14. No-write verification
15. Frontend state coverage (loading, complete, error, truncated, cancelled)
16. `1280x720`, `1440x900`, `1920x1080` screenshots

## Acceptance gate

> A user can select two runs from one project, identify recorded source,
> environment, outcome, Problem, and Artifact differences, see every missing or
> truncated field, and navigate to the underlying evidence without executing or
> mutating the project.

## Next mandatory stop

Stop after Phase A for backend review before adding UI. Do not begin Phase B
until the comparison engine and store tests pass.

## Version

This handoff is the first commit of the RA-RC1 cycle within `0.3.0-dev.x`. The
RA-RC1 implementation commits do not bump the minor version.

# BH3 Transactional Schema v8 Migration Handoff

Status: accepted

Authorization date: 2026-07-27
Authorized by: project owner
Owning direction:
`proposed-2026-07-26-implemented-baseline-hardening-plan.md`
Change/risk class: D3 / R3 safety-critical foundation
Baseline for authorization: `14b1434`

## Authorization And Program Position

BH3 was explicitly authorized as the only active Wave 2 product implementation
package. That authorization did not activate BH2, BH4-BH5, UX1, RA-RC1, WB1,
or any other proposed package.

Wave 1 is accepted and closed at the BH1 isolation gate. `0.3.x` milestone
manual acceptance and the independent `0.2.0-dev.12` / About-update acceptance
tracks remain open, but they do not block this bounded migration repair.

BH3 implementation, migration verification, and final review are now complete.
BH2 is not authorized by BH3 completion.

## Accepted Decisions

### Supported historical version

- BH3 V1 supports only `v7 -> v8`.
- Empty databases may bootstrap directly to v8.
- Historical schema versions other than v7 are not silently upgraded in BH3.
- A non-empty database without a supported schema version fails closed under a
  documented rule.

### Backup and failure recovery

- Before a supported historical migration starts, create a reopenable backup in
  the same directory as the active store.
- The migration itself runs as an ordered transactional version transition.
- If migration fails, the application must not continue into a half-migrated
  state.
- Failure diagnostics remain content-free and bounded; recovery relies on the
  untouched source database and/or the pre-migration backup.

### Legacy ownership

- Historical records without authoritative project identity remain explicitly
  `legacy_unscoped`.
- BH3 must not infer ownership from current UI state, current project root,
  source path, timestamp, filename, or neighboring records.
- `legacy_unscoped` records remain excluded from ordinary project endpoints,
  Agent context, retry, continuation, audit, and run comparison.

### Diagnostics boundary

- BH3 returns a bounded structured migration outcome for the current open
  attempt.
- The result may record version transition, backup availability, and
  `scoped` / `legacy_unscoped` / `rejected` counts.
- BH3 does not create a durable migration-history table or a new legacy-history
  browsing surface.

## Scope

BH3 implements:

- ordered schema migration functions with explicit version transitions and a
  final v8 schema assertion;
- v8 table definitions for project-owned history with explicit
  `legacy_unscoped` representation and reviewed nullability/index choices;
- a supported `v7 -> v8` migration path for project-owned durable history;
- same-directory recoverable backup creation before supported migration;
- fail-closed rejection for unsupported historical versions and malformed
  version/ownership metadata;
- bounded migration diagnostics suitable for startup/recovery reporting;
- migration fixtures and tests for success, rollback, reopen, and rejection.

BH3 may amend only the store, narrow startup/opening call sites, and the
documents/tests required to keep the migration contract truthful.

## Non-Goals

BH3 does not authorize:

- the BH2 project-switch state machine;
- installed-app recovery UI or a dedicated recovery workflow surface;
- a legacy-history diagnostic UI;
- retention, prune, hide, delete, or artifact-lifecycle policy changes;
- RA-RC1, evidence workspace, Workbench Protocol, Git, jobs, or editor work;
- a second audit database, migration-history store, or project database;
- guessed repair of malformed ownership metadata.

## Required Invariants

1. Supported v7 databases either migrate completely to v8 or fail without
   publishing mixed schema/data state.
2. A failed migration leaves a reopenable source database or recoverable backup
   in the same directory.
3. No record is silently assigned to the wrong project during migration.
4. Records without authoritative ownership become `legacy_unscoped`, not
   guessed-project data.
5. Unsupported versions and malformed metadata fail closed with a documented
   rule and bounded diagnostics.
6. New v8 admissions do not depend on the old incremental `ensure_column()`
   patch sequence for semantic migration correctness.

## Implementation Slices

### BH3-A: Versioned migration contract

- introduce explicit open/migration diagnostics and supported-version checks;
- separate empty-database bootstrap from historical migration;
- define v8 table shapes, indexes, and `legacy_unscoped` representation;
- stop for schema review before data-copy migration logic broadens.

### BH3-B: Transactional `v7 -> v8` migration and backup

- create the pre-migration same-directory recoverable backup;
- migrate project-owned history tables in one ordered transaction;
- preserve authoritative project roots and rewrite unowned records to
  `legacy_unscoped`;
- fail closed on malformed metadata and unsupported historical versions;
- stop for rollback/recovery review.

### BH3-C: Fixtures, failure injection, and startup integration

- add supported v7 fixtures plus malformed/unsupported fixtures;
- verify idempotent reopen, rollback on injected failure, and foreign-key-safe
  table replacement;
- wire bounded migration diagnostics through the current store-opening path
  without creating a new history surface;
- rerun the affected matrix and stop for BH3 acceptance review.

Each slice must leave the repository buildable and testable.

## Required Verification

Focused and full affected coverage must include:

- empty database bootstrap to v8;
- supported v7 fixture migration to v8;
- persisted authoritative project ownership preserved exactly;
- null or missing historical ownership rewritten to `legacy_unscoped`;
- malformed ownership metadata rejection without guessed repair;
- unsupported non-empty historical versions rejected under a documented rule;
- injected failure rollback with reopenable original database and backup;
- idempotent reopen of an already-migrated v8 database;
- final schema assertions for columns, nullability, and indexes used by
  project-scoped history queries;
- startup/open call sites consuming only bounded migration diagnostics.

Required final commands include:

```powershell
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
```

Add narrower targeted Rust tests while iterating. Record any unrun manual or
installed-app evidence as not yet run.

Focused and final implementation evidence is recorded in
`../verification/bh3/verification.md`.

## Version And Documentation Decision

Authorization alone does not change application or R package versions and does
not require a `NEWS.md` entry. Before BH3 handoff, decide version/NEWS impact
from actual implemented behavior and update the broader proposal, roadmap,
cross-review, and verification evidence from true facts only.

## Acceptance Gate

BH3 is accepted only when:

> Every supported historical fixture opens or fails according to a documented
> rule; a failed migration leaves a reopenable prior database or recoverable
> backup, and no record is silently assigned to the wrong project.

Independent review must report no unresolved P0/P1 migration, privacy,
ownership, rollback, or recovery finding in BH3 scope.

## Next Mandatory Stop

BH3 acceptance is complete. Do not begin BH2 or any later Wave 2+ package
until the project owner separately authorizes it and the cross-review matrix is
updated.

## Final Review Result

Affected automated evidence passed:

- `node --check desktop\dist\app.js`
- `Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"`
- `Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"`
- `cargo +stable-x86_64-pc-windows-gnu test --workspace`

Final review of the store migration path, bounded startup diagnostics
integration, and BH3 acceptance documents found no unresolved P0/P1 migration,
ownership, rollback, or recovery finding in BH3 scope.

Review disposition: **accept**.

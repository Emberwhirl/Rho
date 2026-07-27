# BH3 Verification

Date: 2026-07-28
Status: accepted; BH3 migration gate passed

## Implemented Contract Snapshot

- Store opening now distinguishes empty bootstrap, supported `v7 -> v8`
  migration, current `v8` reopen, and fail-closed rejection paths.
- Supported historical migration creates a same-directory pre-migration backup
  before transactional table rebuilds.
- Historical records with missing authoritative ownership are rewritten to
  explicit `legacy_unscoped`; blank ownership is rejected as malformed.
- Unsupported non-empty historical versions and missing schema-version
  metadata fail closed with bounded `MigrationOutcome` diagnostics.
- Desktop startup records bounded store-migration diagnostics at the current
  startup opening path without adding a recovery UI or durable migration
  history surface.

## Automated Evidence

The following affected automated commands passed on 2026-07-28 against the
current source baseline:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
node --check desktop\dist\app.js
```

Rust results include 50 desktop, 21 server, and 17 store tests with zero
failures. The store migration coverage includes:

- empty-database bootstrap to schema v8 and idempotent reopen;
- supported v7 fixture migration to v8 with preserved scoped ownership;
- rewrite of null historical ownership to `legacy_unscoped`;
- rejection of blank ownership metadata without guessed repair;
- rejection of unsupported non-empty historical schema versions;
- injected migration failure rollback with preserved pre-migration backup;
- exclusion of `legacy_unscoped` records from ordinary project history APIs.

The affected Rust matrix also proves that the startup logging integration
compiles and links through the current desktop and server opening paths.

## Review Result

Final BH3 review of the implemented store migration, startup diagnostics
integration, and acceptance documents found no unresolved P0/P1 migration,
ownership, rollback, or recovery finding in BH3 scope.

Review disposition: **accept**.

## Acceptance Boundary

BH3 is accepted on current-source automated evidence and focused review. This
result does not authorize BH2 or any later Wave 2+ package. Recovery UI,
project-switch behavior, and all later hardening packages retain their own
separate entry gates.

# BH1 Verification

Date: 2026-07-26
Status: automated matrix passed; independent acceptance review pending

## Implemented Contract

- New Runs, Agent turns, and ordinary approvals persist the normalized active
  project root.
- Runs, Problems, Agent history/context, approvals, retry, cancellation, and
  project-local history clearing are scoped by that stored identity.
- Artifact, plot, environment-operation, and workspace-state provenance detail
  lookups reject foreign project identifiers.
- Records with null ownership remain `legacy_unscoped` and are absent from
  ordinary project APIs and continuation paths.
- Compatibility columns remain nullable under schema version 7. No ownership
  is inferred and no schema v8/BH3 migration is claimed.
- Desktop startup, project switching, and the coordinator probe bind the same
  slash-normalized canonical project root before durable writes.
- Historical retry is allowlisted to user/Agent `workspace.execute`; environment
  and project-control mutations cannot be replayed from Runs.
- Environment dispatch requires a same-project, approved, unconsumed dedicated
  request. Project switching binds its control Run to the destination identity
  and restores the prior store identity if Workspace R synchronization fails.

## Automated Evidence

The following commands passed on 2026-07-26:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
node --check desktop\dist\app.js
target\debug\rho-desktop.exe --smoke-test
```

Rust results include 50 desktop, 21 server, and 12 store tests with zero
failures. The store suite includes a shared-SQLite two-project fixture proving
list/detail/context/approval/clear isolation and legacy exclusion, plus a
Windows separator and drive/extended-root normalization regression. Desktop
tests also reject retry for environment, project-root, and bootstrap request
types. The desktop smoke passed Workspace
R execution, plot capture, bounded data view, stale-view rejection, and
environment-object discovery.

No frontend command signature or visible state changed, so no new browser mock
handler or screenshot fixture was required. The JavaScript syntax check proves
the unchanged mock bundle remains parseable; Rust tests prove the changed Tauri
command contracts compile.

## Acceptance Boundary

Automation does not yet prove rapid interactive project changes, a Workspace R
restart while alternating two representative projects, or installed-app
recovery. Those remain manual BH1 follow-ups. Independent review must also
report no unresolved P0/P1 privacy, ownership, execution, or migration-boundary
finding before final disposition.

The broader `0.3.x` representative-project and manual three-viewport acceptance
remain open and are not closed by this evidence. BH2 and BH3 are not authorized.

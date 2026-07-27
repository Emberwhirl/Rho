# BH1 Verification

Date: 2026-07-26
Status: accepted; Wave 1 isolation gate passed

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

The following commands passed on 2026-07-26 against the current source
baseline:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
node --check desktop\dist\app.js
git diff --check
cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test
```

Rust results include 50 desktop, 21 server, and 12 store tests with zero
failures. The store suite includes a shared-SQLite two-project fixture proving
list/detail/context/approval/clear isolation and legacy exclusion, plus a
Windows separator and drive/extended-root normalization regression. Desktop
tests also reject retry for environment, project-root, and bootstrap request
types.

The current-source desktop smoke now runs from a fresh temporary root, binds an
explicit project identity before bootstrap, switches between representative
project A/B roots, restarts Workspace R, and verifies that foreign-project run
detail lookups remain rejected after switching and restart. The smoke reported:

- `plot_count = 1`
- `environment_object_found = true`
- `data_view_rows = 5`
- `stale_view_rejected = true`
- `project_switch_isolated = true`
- `workspace_restart_project_isolated = true`

No frontend command signature or visible state changed, so no new browser mock
handler or screenshot fixture was required. The JavaScript syntax check proves
the unchanged mock bundle remains parseable; Rust tests prove the changed Tauri
command contracts compile.

## Independent Review Result

Independent review initially found one blocking evidence issue: the desktop
smoke used a fixed temporary directory and could reuse prior persisted
`active_project_root` metadata, so it was not sufficient to close the BH1
switching/restart gate truthfully.

That smoke path is now corrected in `desktop/src-tauri/src/main.rs` to use a
fresh temporary root, explicit project-root binding, two-project switching, and
post-restart isolation assertions. After rerunning the current-source smoke and
rechecking the BH1 store/coordinator/desktop control-plane changes, no
unresolved P0/P1 privacy, ownership, execution, migration-boundary, or recovery
finding remains in BH1 scope.

Review disposition: **accept**.

## Acceptance Boundary

The broader `0.3.x` representative-project and manual three-viewport acceptance
remain open and are not closed by this evidence. The `0.2.0-dev.12`
installed-app release acceptance and BH3 migration/recovery work also retain
their own gates. BH2 and BH3 are not authorized by this BH1 acceptance result.

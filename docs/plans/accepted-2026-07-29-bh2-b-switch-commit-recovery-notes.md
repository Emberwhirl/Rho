# Notes: BH2-B switch commit and recovery

Status: accepted

## Current Findings

- BH2 active handoff already authorizes broker-owned preflight, blocked/synchronized/committed/failed-restored outcomes, and deterministic switch recovery.
- BH2-A is already implemented: `switch_project()` now returns structured `blocked` results with blocker payloads.
- The grilled decisions for BH2-B are:
  - success only after full-chain commit;
  - rollback the whole chain on any post-workspace failure;
  - fail closed if rollback also fails;
  - preserve old project session on failed restore;
  - write bounded switch events for `success`, `blocked`, `failed_restored`, and `fatal`.

## Implemented In This Pass

- Added active planning/spec documents under `docs/` to keep the `/to-spec` work persistent on disk.
- Extended `ProjectRestoreResponse` with `reason_code`, `message`, `restored_root`, and `restart_required`.
- Implemented `failed_restored` and `fatal` switch outcomes in `switch_project()`.
- Moved `last_opened_project` persistence behind the committed-success boundary.
- Added bounded switch-event logging for blocked, success, failed-restored, and fatal outcomes.
- Added injected-step test control so the desktop test suite can exercise commit and recovery paths without a live workspace round-trip.
- Added three BH2-B tests:
  - full-chain success commits target root;
  - store-root failure restores previous project/session;
  - restore failure returns `fatal` with `restart_required = true`.

## Validation Results

- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop --bin rho-desktop`: passed (`58/58`)
- `cargo +stable-x86_64-pc-windows-gnu test --workspace`: passed
- `Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"`: passed
- `Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"`: passed
- `node --check desktop/dist/app.js`: passed
- `cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test`: passed

## Remaining Work

- No BH2-scoped implementation work remains open. Later installed-app/manual
  release evidence belongs to the separate `0.2.x` / `0.3.x` acceptance tracks.

## Code Entry Points

- `desktop/src-tauri/src/main.rs`
  - `switch_project()`
  - `sync_workspace_project_root()`
- `desktop/src-tauri/src/project.rs`
  - `ProjectRestoreResponse`
- `crates/rho-server/src/coordinator.rs`
  - approval registries used by preflight

## Risks To Control

- Publishing a new `project_root` before watcher/store/UI all agree.
- Losing the previous session when a switch fails after workspace sync.
- Returning string errors instead of structured status for recovery paths.

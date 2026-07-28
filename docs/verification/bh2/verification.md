# BH2 Verification

Date: 2026-07-29
Status: accepted; affected automated matrix and desktop smoke passed, and BH2 closeout review found no unresolved P0/P1 switching, ownership, execution, blocker, or recovery issue

## Implemented Contract Snapshot

- Project switching now distinguishes structured `blocked`, `ready`,
  `failed_restored`, and `fatal` outcomes instead of relying on string errors
  for BH2-B recovery paths.
- The switch commit boundary now requires ordered success across Workspace R,
  watcher replacement, store active root persistence, `last_opened_project`
  persistence, and frontend publication before a new project is considered
  committed.
- If a post-workspace switch step fails, the desktop attempts to restore the
  previous workspace root and previous store identity and returns
  `failed_restored` with bounded reason data.
- If both forward progress and restore fail, the desktop returns `fatal` with
  `restart_required = true` and does not publish a mixed project state as
  success.
- The desktop records bounded switch events for blocked, success,
  failed-restored, and fatal paths.

## Automated Evidence

The following affected automated commands passed on 2026-07-29 against the
current source baseline:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
node --check desktop\dist\app.js
cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test
```

Rust results include 58 desktop, 21 server, and 17 store tests with zero
failures. The BH2-specific desktop coverage includes:

- typed preflight blocker results for active run, active Agent turn, waiting
  approval, and environment operation;
- committed success only after the full switch chain succeeds;
- failure after workspace synchronization with restored previous project state;
- fatal recovery reporting when the restore path itself fails.

The R package suites for `rho.bridge` and `rho.agent` also passed on the same
source baseline, the browser-mode desktop bundle syntax remains valid, and the
desktop smoke confirmed:

- `project_switch_isolated = true`
- `workspace_restart_project_isolated = true`
- bounded switch/restart event emission remained present during the smoke path

## Closeout Review

A focused BH2 closeout review covered the switch commit/recovery diff,
structured blocker/result shapes, targeted desktop recovery tests, the full
affected automated matrix, and the smoke output. That review found no
unresolved P0/P1 issue in BH2 scope related to:

- cross-project ownership leakage;
- mixed broker/store/workspace/UI commit state;
- blocker admission for active execution, Agent turns, waiting approvals, or
  environment operations;
- failed-restored and fatal recovery boundaries.

## Remaining Non-BH2 Evidence

The following items remain outside the BH2 acceptance gate and are therefore
tracked separately rather than blocking BH2 closeout:

- any later installed-app/manual release evidence for `0.2.x` or `0.3.x`
- any later Wave 2 package authorization such as BH4

## Acceptance Boundary

This verification update accepts BH2 on current-source evidence. It does not
authorize BH4 or later Wave 2+ work, and it does not close unrelated release
or installed-app acceptance tracks.

# Windows Project Path And Git Console Window Repair

Status: active defect-repair contract

Date: 2026-08-04
Authorization: user reported the installed-app defects with screenshot evidence
Change class: D1
Risk class: R2 project/runtime boundary and supervised Git subprocess behavior
Work package: WIN-PATH-GIT-1

## Defects

1. Windows `std::fs::canonicalize()` returns a verbatim path such as
   `\\?\E:\project`. The desktop keeps that path for filesystem containment,
   but `sync_workspace_project_root()` serializes it directly into `setwd()`.
   Workspace R therefore exposes `\\?/E:/project` through `getwd()` instead of
   the user-facing drive path.
2. Opening or refreshing a Git project runs several short `git` commands.
   `git::run_git_bounded()` does not apply the Windows no-console creation flag,
   so an installed GUI build may repeatedly open and close console windows.

## Ownership And Boundaries

- Project canonicalization, containment, watcher roots, durable identity,
  switching, recovery, and session keys retain their existing authority.
- Workspace R receives the existing user-readable `display_path()` projection
  only at the `setwd()` execution boundary.
- Every supervised Git command continues through the existing bounded stdout,
  stderr, repository, path, revision, and mutation guards. The repair changes
  only Windows process-window creation policy.
- No schema, migration, protocol, approval, credential, network, filesystem
  authority, Git operation, frontend state, or mock command is added.

## Implementation Slice

1. Build Workspace R project-root code from `display_path(root)` so drive and
   UNC verbatim prefixes never reach `setwd()`.
2. Reuse the same helper in desktop smoke project switching.
3. Centralize Git `Command` construction and apply `CREATE_NO_WINDOW` on
   Windows before every spawn.
4. Add regression tests for ordinary drive, verbatim drive, verbatim UNC, and
   Unicode/space project-root code plus centralized Git command construction.

## Verification

- focused project and Git Rust tests;
- existing project switch success/failure/recovery and two-project isolation;
- existing Git status/diff/review/mutation tests;
- `cargo fmt --all -- --check` and affected workspace tests with the documented
  Rtools GNU toolchain;
- installed Windows check: open the generated `working-project`, confirm no Git
  console windows flash, run `getwd()`, switch to the Unicode/space project,
  and confirm both paths omit `\\?\` while Git review remains functional.

The installed check remains NOT RUN unless evidence is recorded against an
exact candidate. Automated evidence cannot close it.

## Implementation And Evidence

WIN-PATH-GIT-1 was implemented on 2026-08-04:

- Workspace R and smoke project switching now build `setwd()` through the
  existing user-readable `display_path()` projection;
- all desktop Git calls remain routed through `run_git_bounded()`, whose
  centralized command builder applies `CREATE_NO_WINDOW` on Windows;
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop` passed all 86 tests,
  including the new drive/UNC/Unicode path and Git builder regressions plus
  existing project-switch recovery/isolation and Git mutation/adversarial tests;
- `cargo fmt --all -- --check` and scoped `git diff --check` passed.

The first test run failed to compile because the new helper was omitted from
the test module's explicit import list. The import was corrected and the full
matrix was rerun successfully. No test failure was reclassified as passing.

Post-test contract review found no schema, identity, containment, watcher,
approval, Git operation, output bound, or recovery-policy change. Installed
Windows confirmation remains NOT RUN, so this document remains active.

## Version And Lifecycle

This is a user-visible Windows defect fix in the unreleased `0.4.0-dev.0`
line. Add a `NEWS.md` fix entry after regression evidence passes. Application
and R package versions remain unchanged in this repair slice; the next
distributed candidate still requires synchronized version metadata. Keep this
document active until installed-app confirmation is recorded.

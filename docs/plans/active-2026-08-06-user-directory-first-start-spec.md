# First-Start User Directory Default

Status: active implementation contract; PROJECT-DEFAULT-1 implemented and
focused Rust verification complete 2026-08-06; installed acceptance open

Date: 2026-08-06
Authorization: user explicitly requested that first start, and startup with
no previous project record, use the Windows user directory rather than a
machine-specific hardcoded path
Change class: D1 narrow startup behavior correction
Risk class: R3 startup and project restoration behavior
Work package: PROJECT-DEFAULT-1
Mandatory stop: after the default-root helper and regression tests are
implemented and focused Rust validation passes; installed-app acceptance stays
separate

## Problem And Invariant

`default_project_root()` currently prefers `D:\\Rho`, which makes a fresh
installation depend on the developer's checkout layout. The startup contract
must be portable and must not silently select a machine-specific project.

Regression invariant: when no saved project exists, startup requests the
current user's home directory; when a saved project exists, that saved path is
still used and validated by the existing restoration flow.

## Contract

- Resolve the default root from `USERPROFILE` first, then `HOME` for a
  platform-neutral fallback, and finally the current directory only when no
  user-home environment is available.
- Do not append `Documents`, `Rho`, or any other project-specific child.
- Do not contain a literal machine-specific path such as `D:\\Rho` in the
  default-root implementation.
- Keep `last_opened_project()` precedence and
  `normalize_existing_project_root()` validation unchanged.
- This work does not migrate or rewrite an existing saved project record.

## Verification

- Pure helper tests cover `USERPROFILE`, `HOME`, and final fallback behavior.
- Existing project-session tests continue to cover saved-project round trips.
- Focused `rho-desktop` Rust tests, formatting, and `git diff --check` pass.
- Installed-app/manual first-start acceptance is not claimed by this contract.

## Cross-Review And Ownership

Project/session restoration remains owned by the existing project store and
startup command. This contract owns only the no-history default-root resolver;
it does not redefine project identity, switching, persistence, or frontend
presentation.

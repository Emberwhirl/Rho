# Current Project Check

Status: active implementation contract; implementation in progress

Date: 2026-08-06
Authorization: user explicitly requested that Check Project inspect the
current working directory without historical output findings
Change class: D2 bounded project-check workflow correction
Risk class: R2 project-scoped read-only audit and presentation

## Contract

- The Check Project button uses a current-project scope that scans the active
  project directory and current source/configuration state.
- Current-project checks do not include historical runs or saved artifacts;
  deleted historical outputs therefore do not appear as current project
  findings.
- The existing historical project audit scope remains available to internal
  callers and is not redefined by this change.
- Project check findings in Agent Review are displayed in a dedicated vertical
  scrolling region with keyboard and mouse-wheel access.

## Verification

- Rust audit scope tests cover current-project filtering of runs/artifacts.
- Frontend contract tests cover the current-project command scope and the
  scrollable Agent Review content region.
- Installed-app visual acceptance remains separate.

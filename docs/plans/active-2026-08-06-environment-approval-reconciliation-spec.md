# Environment Approval Reconciliation

Status: active; implementation and focused frontend verification complete
2026-08-07; installed acceptance open

Date: 2026-08-06
Authorization: user requested repair of direct `Approve and run` no-op behavior
Change class: D1 bounded defect repair
Risk class: R2 environment-operation approval and recovery presentation

## Contract

- The direct environment approval command and post-approval refresh are
  separate phases. A refresh failure must not be reported as an approval
  failure.
- Every terminal response (`approved`, `stale`, `rejected`, `cancelled`,
  `running`, `completed`, or `failed`) is reconciled into the visible request
  record before the dialog is rendered again.
- If the command fails before returning a terminal response, the frontend
  reloads the project-scoped request list. A request that is no longer pending
  is shown with its stored terminal state instead of remaining `Requested`.
- Stale approval reasons remain visible in the dialog. Generic toast wording is
  reserved for failures whose phase cannot be reconciled.
- The existing dedicated environment-operation table, project root binding,
  revision checks, snapshot checks, and approval authority remain unchanged.
- `approved` is an internal transition only. A request must not remain
  `approved` when dispatch fails before it can be claimed as `running`; such a
  failure is reconciled to `failed` with a durable reason.
- User-facing project paths always use the display form (`D:/...` or
  `//server/share/...`). Verbatim Windows paths such as `//?/D:/...` remain
  permitted only in internal identity and containment records.
- After approval the review surface stays open, disables duplicate actions,
  and reports that Workspace R execution is starting/waiting. Terminal output
  must identify the actual outcome, including lockfile verification and any
  refresh or partial-write warning; no successful approval is presented as
  completion.

## Verification

- Frontend contract tests cover terminal response reconciliation, refresh
  failure isolation, and stale/error dialog state projection.
- Existing environment-operation Rust tests remain the backend regression gate.
- `node --check desktop/dist/app.js` and `git diff --check` pass.

## Implementation Evidence

The direct environment approval path now reconciles terminal responses before
the dialog is rendered again and isolates post-approval refresh failures from
the approval result. Stale reasons remain visible, and unreconciled failures
reload the project-scoped request list instead of leaving a request falsely at
`Requested`. The implementation preserved the dedicated environment-operation
request lane and existing project/revision/snapshot guards. Polling now also
clears the dialog busy phase and rerenders the action card immediately when a
terminal status is observed, so `Completed` cannot leave the controls disabled
until another UI interaction. Focused frontend contracts, affected Rust tests,
JavaScript syntax, and `git diff --check` were verified with the 0.4.0-dev.15
candidate; installed acceptance remains open.

# File Proposal Completion State

Status: active implementation contract

Date: 2026-08-07
Authorization: user requested implementation of GitHub Issue #7
Change class: D1 bounded file-proposal presentation and stale-state repair
Risk: R1 local UI state with asynchronous file verification
Work package: FILE-PROPOSAL-COMPLETION-1

## Problem And Invariants

After a file proposal is accepted, the full Before/After diff must not remain
expanded by default. The compact summary must retain operation, path, status,
and audit-relevant state. Undo is visible only when the current target file is
verified to equal the accepted result and the in-memory undo record is current.

## Scope

- Keep the existing native file-proposal disclosure and proposal decision
  persistence.
- Collapse the panel after a successful Accept, including automatic Act apply.
- Verify the target content asynchronously before showing Undo.
- Invalidate Undo when the active buffer changes, the target file changes, the
  project changes, or verification fails.
- Do not change proposal generation, file mutation, approval policy, or undo
  semantics.

## Failure And Recovery

While verification is pending, Undo remains hidden. A content mismatch or read
failure clears the undo record and leaves the applied file unchanged. Selecting
a new proposal still opens it for review; rerendering the same proposal keeps
the user's disclosure state.

## Verification

The frontend contract covers accepted auto-collapse, same-proposal disclosure
preservation, verified-only Undo, stale invalidation, rejected and undone states,
and project reset. JavaScript syntax, affected UI contracts, Rust tests, and
version/NEWS checks are required. Installed-app acceptance remains separate.

## Implementation Evidence

Implemented 2026-08-07. Successful Accept now closes the native proposal
disclosure. Undo is hidden until the target content is asynchronously verified
against the accepted result, and is invalidated by buffer edits, project
switches, content mismatches, or verification failure. Same-proposal rerenders
retain disclosure state and new proposals still open automatically.

Verified with JavaScript syntax, file-proposal collapse, scientific Agent
surface, Agent-first, Problems/Lint, Outputs, and human-facing UI contracts;
`rho-server` format and all 47 tests also pass. Installed-app acceptance remains
open.

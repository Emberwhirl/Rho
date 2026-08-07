# Problems To Agent Repair Entry

Status: active implementation contract

Date: 2026-08-07
Authorization: user approved implementation of GitHub Issue #6 after review
Change class: D2 bounded Agent repair workflow
Risk: R2 editor identity, Agent context transport, proposal review, browser/mock parity
Work package: PROBLEMS-AGENT-REPAIR-1
Mandatory stop: complete the bounded frontend/context slice, run affected tests,
review the proposal and version impact, then stop before any automatic execution
or new mutation authority.

## Problem And Invariant

Problems can locate a source error, but the current Agent entry only copies the
message into a new prompt. A repair request must preserve the known project,
source path, source range, diagnostic text, and bounded nearby source without
requiring the user to retype the error or manually create a selection.

## Scope And Ownership

- Problems owns the visible `Fix with Agent` entry and actionable unavailable
  states.
- The frontend owns opening/revealing the source and constructing additive
  diagnostic context inside the existing `editor_context` payload.
- The existing Agent coordinator and `propose_file_edit` tool remain the
  authority for model behavior and reviewable file proposals.
- Existing Accept/Reject, stale-content, project containment, and Act
  authorization rules remain unchanged. This package never writes files or
  executes R code automatically.

## User Contract

For a file-backed Problem with a valid source path, `Fix with Agent` opens the
file, reveals its line/column when available, switches to Agent Direct, and
starts a repair-oriented prompt. The prompt asks for diagnosis plus one
reviewable file proposal when a code change is appropriate. The selected Agent
policy lane is preserved, but the action does not grant authorization.

The context includes a bounded `diagnostic` object with source path, line and
column range, message, call, origin, severity, run linkage, and nearby source
anchors. The existing editor selection remains an optional convenience; the
diagnostic range is authoritative context and is not itself an approval.

For Console Problems, the action switches to Agent with the structured error
context and explains that no file location is available. For missing/virtual
sources, the UI shows a concrete next step and does not submit a misleading
repair task.

## Bounds And Failure

- Diagnostic text and source excerpts use the existing editor-context bounds.
- Paths remain project-relative and must belong to the active project.
- A project switch or changed document makes proposal acceptance fail through
  the existing stale guards.
- Missing line/range is allowed for explanation, but the Agent must not be
  told that a precise replacement range exists.

## Work Package And Tests

1. Add the Problems repair action and source/console/unavailable states.
2. Add additive diagnostic context construction and prompt handoff.
3. Preserve editor location without requiring a non-empty manual selection.
4. Extend browser/mock fixtures and frontend contract tests for success,
   missing source, console errors, stale context, and two-project isolation.

## Acceptance And Definition Of Done

- One click from a file-backed Problem creates an Agent repair task with the
  exact structured diagnostic context.
- The Agent can produce the existing reviewable file proposal without a manual
  selection when the source range is known.
- Problems, Agent, and editor remain in the expected surface and focus states.
- No new command, approval table, automatic save, execution, or persistence
  schema is introduced.
- JavaScript syntax, frontend contract tests, mock parity, and affected Rust
  tests pass; NEWS/version impact is recorded after evidence.

## Implementation Evidence

Implemented 2026-08-07. Problems now exposes `Fix with Agent` for file-backed
and Console errors. File-backed entries open and reveal the source, select a
bounded diagnostic range as a convenience, attach an additive diagnostic
object to `editor_context`, and submit the existing Agent task flow. Missing
and virtual sources fail with an actionable message. The coordinator system
prompt now explains how to use diagnostic context without weakening proposal
review or authorization.

Verified with JavaScript syntax checks, Agent-first/Problems/Lint/Outputs/UI
contract checks, `rho-server` format checks, and all 47 `rho-server` tests.
Browser-installed acceptance and manual proposal review remain open.

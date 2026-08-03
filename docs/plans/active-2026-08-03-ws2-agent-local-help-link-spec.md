# WS2 Agent Answers Linked To Resolved Local Help

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D2 bounded read-only Agent context and answer presentation
Risk: R2 Workspace-derived Help identity, project binding, durable turn context,
truthful evidence presentation, and browser/mock parity
Work package: WS2-AH1
Mandatory stop: after one explicit Local Help to Agent flow and durable answer
link, complete the Rust/frontend matrix, contract review, NEWS/checklist
reconciliation, and an independent commit

## Problem

Rho can resolve installed local Help and show installed documentation, but an
Agent answer about that API is visually indistinguishable from model-only
explanation. The model may mention a package or topic without proving that the
installed Help used by the active project was supplied. Users need an explicit,
durable link back to the resolved local record without treating model prose as
documentation evidence.

## Scope And Ownership

- Existing Workspace R Help resolution remains the only source of local package,
  topic, Help record, installed version, and bounded documentation text.
- The Help surface adds one explicit `Ask Rho with this Help` action. It captures
  a bounded snapshot only after qualified local Help and installed documentation
  resolve for the active project.
- The snapshot travels inside the existing `editor_context` of `run_agent` and
  is persisted in the existing `agent.user_prompt` event details. No schema,
  second store, tool, approval, or Agent execution authority is added.
- The selected completed answer renders a separate Local Help context block
  derived from that stored user-event context, never from model text. Its Open
  Help action re-resolves the exact qualified package/topic through the existing
  read-only Help path.

This package does not automatically enrich every Agent turn, parse citations
from model prose, claim that documentation proves the answer, add web links,
open arbitrary package files, execute examples, persist a global Help cache, or
change Ask/Plan/Act policy.

## Context Contract

The optional `editor_context.local_help` snapshot has:

- `kind = rho.local_help_context.v1` and `project_root` equal to the active
  project when captured;
- bounded `name`, `package`, `help_topic`, `help_record`, `package_version`,
  `title`, `usage`, and `description` copied from the already normalized Help
  responses;
- `incomplete`, `truncated`, and stable bounded `notices` so partial
  documentation is never presented as complete.

Capture requires a found, unambiguous qualified Help record and found installed
documentation. Truncated location identity, missing package/topic/help record,
documentation failure, or project mismatch disables the action. Optional
missing prose fields remain null. The context is single-turn: submitting or
explicitly removing it clears the composer attachment but not the persisted
turn event.

The existing coordinator JSON serialization and Agent prompt bounds remain
authoritative. The context is read-only untrusted prompt material, not an
approval, executable instruction, or scientific evidence attestation.

## UI Contract

- The Help action names the qualified `package::topic` consequence and moves
  focus to the Agent composer with a removable Help context badge.
- The user writes and submits the question normally. Empty prompt, Agent
  unavailable, or failed turn behavior remains unchanged.
- When a turn is selected, its final answer is followed by a compact Local Help
  context block naming package/topic, installed version, local record, and
  partial state. `Open Help` re-runs the qualified Help lookup.
- A turn without the stored v1 snapshot has no documentation block even when
  model prose contains citation-like text. Malformed or foreign-project context
  is ignored rather than displayed as local evidence.
- Browser/mock mode provides deterministic attached, model-only, partial,
  unavailable, long-text, and project-mismatch states.

## Cross-review

- WS2-H1 retains qualified location identity and source-reference ownership;
  WS2-H2 retains installed Rd/version content and reviewed example execution.
  WS2-AH1 only links their bounded read-only result to one Agent turn.
- Existing Agent turn/event persistence, prompt transport, project scoping,
  Ask/Plan/Act policy, approvals, file edits, and execution remain authoritative.
- EW-CR1 evidence entries and future claim review remain scientific evidence
  authority. A Local Help context block is product documentation context, not an
  Evidence entry or claim verification.
- No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Rust/Tauri:

- supplied bounded local Help context appears in the contextual prompt and
  stored user event without changing mode or tool policy;
- project identity remains on the existing turn/store boundary; malformed
  oversized context cannot create a documentation claim through model text.

Frontend/mock:

- eligible/ineligible Help action states, explicit attach/remove, single-turn
  clearing, and exact stored snapshot;
- linked answer, model-only answer, partial, malformed, foreign-project,
  unavailable, and long-text presentation;
- exact qualified Open Help, safe text rendering, keyboard focus, narrow window,
  and no execution/write/network command.

## Version And Lifecycle

- No R package version changes: existing bounded Help responses are reused.
- Application metadata remains `0.4.0-dev.0`; root NEWS updates after evidence
  as part of the same development candidate.
- The checklist changes from 12 open / 37 completed to 11 open / 38 completed
  only after full verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS2-AH1 reaches its stop when one explicit resolved Local Help snapshot can be
attached to a turn, the selected answer shows a truthful durable documentation
context distinct from model prose, Open Help re-resolves the qualified record,
failure and project mismatch fail closed, affected tests/browser review pass,
docs are reconciled, and the package is independently committed.

## Implementation And Review Evidence

Implementation, contract review, and affected automated/browser verification
completed on 2026-08-03. The Help surface now offers one explicit attach action
only for a found, unambiguous qualified location plus installed documentation.
The bounded v1 snapshot is sent through the existing `editor_context`, stored in
the existing user-prompt event, and cleared from the next composer after a
successful submission. Selected answers render a text-safe Local Help context
block and re-resolve the package/topic through the existing Help command;
model-only, malformed, partial, and foreign-project contexts do not create a
false documentation block. No command, schema, approval, execution, file, or
network authority was added.

Independent review confirmed that the renderer derives the block only from the
persisted `agent.user_prompt` event, validates the v1 kind and active project
root, and uses DOM text APIs for all stored fields. The Rust contextual-prompt
regression covers the new snapshot surviving the existing prompt boundary.

Browser/mock review covered attached and removable context, linked answer,
Open Help re-resolution, model-only, partial, and project-mismatch states. The
deterministic preview reported no page-level horizontal overflow at the
available browser viewport. Installed-app/manual acceptance remains open and
is staged in `test/acceptance-project`.

The checklist is reconciled to 11 open / 38 completed. Application metadata
remains `0.4.0-dev.0`; no R package version changes are required. This
contract remains active only because installed-app acceptance is still open.

# Agent-first Intuitive Modernization

Status: active; implementation and automated/browser verification complete;
installed-app acceptance open

Date: 2026-08-02
Authorization: explicit user request to make the interface more intuitive,
simple, and modern
Change class: D2 presentation and interaction change
Risk class: R1; frontend-only, no durable state or authority changes
Parent package: [`active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md`](active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md)
Next mandatory stop: installed-app acceptance or a separately authorized UX4
package

## Problem

The first polish package made Agent-first usable but still exposes implementation
structure instead of a clear user workflow:

- posture is a single changing button rather than an explicit Human/Agent
  choice;
- `Direct` and `Monitor` are internal surface names, not task-oriented labels;
- a selected completed turn repeats its summary, final response, and every tool
  event at once;
- project-skill metadata precedes the conversation and the fixed composer uses
  more height than a short request needs;
- the Agent-first topbar still carries Human-first menus and full conflict
  actions.

## Contract

### Clear navigation

- Render Human and Agent as a two-option segmented posture control. Selecting an
  option changes presentation only and preserves all existing switch invariants.
- Keep internal `direct`, `monitor`, and `review` values, but display the
  task-oriented labels `Task`, `Runs`, and `Review`.
- In Agent posture, retain project identity, branch, conflict attention,
  posture, restart/interrupt, run, and audit actions. Hide Human-first menu
  chrome and reduce the conflict surface to a bounded attention indicator.

### Concise task flow

- A selected turn shows its objective, state, and final answer once.
- Raw Agent/tool activity is collapsed by default behind a labelled activity
  disclosure with an event count.
- Expanding or collapsing activity is local presentation state. It does not
  alter durable turn data or hide approvals, failures, file-edit review, or
  cancellation controls.
- Project Skills remains available as progressive detail but follows the task
  flow rather than preceding its primary answer.

### Compact entry

- In Agent posture, the composer uses a compact stable height and the manual
  resize affordance is hidden. Human-first retains the existing resizable
  composer contract.
- Context, model, mode, send, capability warning, Act authorization, file
  mentions, Enter submission, and Shift+Enter newline remain functional.

## States And Acceptance

| State | Expected behavior |
|---|---|
| Empty | one clear Task surface, concise workspace-ready state, compact entry |
| Completed turn | objective and final answer are visible once; activity is collapsed |
| Activity expanded | event list appears and the disclosure announces collapse action |
| Running/waiting | state and cancel/approval controls remain visible |
| Human/Agent switch | selected posture is explicit and context remains unchanged |
| Runs/Review | internal surface state changes exactly as before under new labels |
| Narrow window | no horizontal overflow or incoherent overlap |
| Keyboard/accessibility | segmented posture and activity disclosure are buttons with current-state semantics |

## Non-goals

- No new Task domain model, task persistence, branch model, Monitor grouping,
  Review canvas, Agent tools, schema, broker command, or approval behavior.
- No redesign of Human-first editor, Environment, Evidence, Git mutation, or
  execution dock behavior.
- No theme system, frontend framework, icon dependency, or release claim.

## Cross-review

- Posture and Agent surface values remain owned by the posture design. Only
  visible labels and controls change.
- The intuitive-interaction design owns task-oriented language and progressive
  disclosure; this package applies those decisions to existing data only.
- The modernization plan owns visual tokens and responsive rules; this package
  reuses the current token set and adds no new dependency.
- The parent polish package continues to own the simplified composer and narrow
  Agent-first layout.

No schema, persistence, approval, policy, execution, project identity, or
sequencing conflict remains for this slice.

## Verification

- extend `scripts/test-agent-first-ui.mjs` for segmented posture, task-oriented
  labels, collapsed activity, compact Agent composer, and Agent topbar rules;
- `node --check desktop/dist/app.js`;
- retain Console/Logs regression coverage;
- deterministic populated and empty `agent-first-direct` previews;
- browser interaction for Human/Agent, Task/Runs/Review, activity disclosure,
  mode disclosure, and composer preservation;
- visual review at 1440x900 and 900x700;
- `git diff --check`.

## Version And Release

This is user-visible desktop behavior. Record it in `NEWS.md` after verification.
Application version advancement remains deferred until a named distributable
candidate; no candidate may reuse `0.4.0-dev.0` with changed behavior. R package
versions are unaffected. Installed-app and release acceptance remain open.

## Implementation Outcome

Implemented and browser-reviewed on 2026-08-02:

- Human/Agent is an explicit segmented choice with current-state semantics;
- the existing internal Direct/Monitor/Review values display as Task/Runs/
  Review without changing stored state;
- Agent posture hides Human-first menus and bounds conflict attention while
  retaining project, run, interrupt/restart, and audit controls;
- selected completed turns render one final answer and collapse raw events
  behind `Show activity` / `Hide activity` with an event count;
- Project context follows approvals and file-edit review instead of preceding
  the primary task answer;
- Agent posture uses a fixed compact composer while Human-first retains the
  resizable composer.

Evidence is recorded in
[`../verification/agent-first-modernization/verification.md`](../verification/agent-first-modernization/verification.md).
No backend, persistence, task, approval, execution, project identity, Workspace
R, or Agent R contract changed. Installed-app acceptance was not run, so this
document remains `active-`.

# File Proposal Collapse

Status: active; FPC-1 implementation and automated/browser verification complete 2026-08-06; installed acceptance open

Date: 2026-08-06

Change class: D1 presentation defect repair

Risk: R1 local user-visible behavior

Owner: existing Agent Task file-proposal review surface presentation

## Problem And Evidence

The Agent Task surface renders a selected file proposal as an always-expanded
fixed panel. Large Before/After previews can occupy almost half of the Task
height even after the proposal has been accepted, rejected, or reviewed. The
adjacent Project context surface already provides a compact native disclosure,
so the two vertically stacked secondary surfaces behave inconsistently.

## Invariants

- A visible file proposal can be expanded or collapsed through a native,
  keyboard-operable disclosure summary.
- A newly selected proposal opens by default so an unresolved Accept/Reject
  decision is not hidden.
- Collapsing a proposal survives rerenders of the same proposal, including
  accepted, rejected, and undo-state updates.
- Selecting a different proposal opens that proposal for review.
- The collapsed summary retains proposal kind, operation, path, and current
  waiting/accepted/rejected state.
- Before/After content and Accept/Reject/Undo controls are hidden only by the
  disclosure state; their behavior, persistence, stale checks, and authority do
  not change.
- Project context, approval, Agent timeline, composer, project switching, and
  browser/mock command contracts do not change.

## Scope And Non-Goals

FPC-1 owns only:

- the file proposal panel's `<details>/<summary>` structure;
- disclosure styling aligned with Project context;
- same-proposal collapse preservation and new-proposal auto-open behavior;
- deterministic frontend contract tests and narrow/mobile layout checks;
- NEWS and application candidate version reconciliation.

It does not own proposal generation, durable decisions, file writes, selection
anchors, undo, approval, Agent execution, schema, or a general redesign of all
review surfaces. Approval and Environment requests remain always visible.

## Cross-Review

- The [implemented file-editing design](../design/implemented-agent-file-editing-design.md)
  retains proposal parsing, contextual diff, explicit review, file mutation,
  stale rejection, and undo authority.
- The [file-editing review fixes](../bug-fixes/implemented-agent-file-editing-review-fixes.md)
  retain accepted/rejected persistence and closed-draft protection.
- The [scientific Agent surfaces contract](active-2026-08-04-interface-modernization-scientific-agent-surfaces-spec.md)
  retains distinct Agent approval, file proposal, and Environment request
  semantics; collapse does not merge these lanes.
- The [Agent-first modernization contract](active-2026-08-02-agent-first-intuitive-modernization-spec.md)
  retains Task hierarchy and requires proposal review to remain available.

No competing state, persistence, approval, policy, or project identity owner is
introduced.

## Verification Matrix

- HTML uses `<details id="fileEditPanel" open>` with a labeled `<summary>` and
  a separate detail body containing the existing diff and actions.
- CSS provides a visible disclosure affordance, bounded path text, compact
  closed state, and supported narrow/mobile layout.
- JS preserves the current `open` state for the same proposal key and opens a
  different proposal key.
- waiting, accepted with Undo, accepted without Undo, rejected, and undone
  render paths retain their existing controls and messages.
- existing Agent-first and scientific-surface contracts pass.
- frontend syntax, application version agreement, and patch whitespace pass.

## Acceptance And Stop Point

FPC-1 is explicitly authorized by the user's 2026-08-06 request. Stop after
the presentation slice, deterministic browser/mock verification, contract
review, NEWS/version reconciliation, and diff review. Installed-app acceptance
remains open until a rebuilt candidate confirms mouse and keyboard collapse,
new-proposal auto-open, accepted/rejected states, Undo, long Unicode paths, and
narrow Task layout.

## Version And Release Impact

This is user-visible application behavior added after the `0.4.0-dev.1`
installer was built. Synchronized application metadata has advanced to
`0.4.0-dev.2` and NEWS records the improvement. No R package contract changes.
No installer build or release is authorized by this work package.

Automated evidence on 2026-08-06:

```text
node --check desktop/dist/app.js
node scripts/test-file-proposal-collapse-ui.mjs
  passed
node scripts/test-scientific-agent-surfaces-ui.mjs
  passed
node scripts/test-agent-first-ui.mjs
  passed
git diff --check
  passed
```

Browser/mock evidence at 784x1000: the expanded proposal measured 253px tall;
after clicking its summary it measured 56px, with Before/After and action
controls hidden. The summary retained the operation and path. Contract review
found no change to proposal state, file mutation, stale checks, or Undo
authority. Installed acceptance remains open for mouse/keyboard interaction,
new-proposal auto-open, long Unicode paths, and narrow Task layout on a rebuilt
candidate.

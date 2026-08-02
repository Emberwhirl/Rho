# Agent Entry And Direct Surface Polish

Status: active; implementation and automated/browser verification complete;
installed-app acceptance open

Date: 2026-08-02
Authorization: explicit user request on 2026-08-02
Change class: D2 presentation and interaction change
Risk class: R1; frontend-only, no durable state or authority changes
Next mandatory stop: installed-app acceptance or a separately authorized UX4
package; no broader UX4 phase is authorized by this contract

## Problem

The current Agent composer gives permanent space to Ask/Plan/Act and Act-session
authorization before the user has stated a goal. In Agent-first posture, the
Direct surface also retains the hierarchy of the old right-side context panel:
project skills can dominate the conversation, an empty task rail consumes a
full column, disabled Human layout presets remain visible, and the central
conversation does not read as the primary task-steering surface.

## Contract

### Simplified Agent entry

- Keep one visible `Ask Rho` text entry as the default action.
- Move Ask/Plan/Act into a compact advanced mode disclosure. The disclosure
  always shows the effective mode.
- Show session Act authorization only while Act is selected.
- Keep context attachment, selected-context badge, model selection, send,
  keyboard submission, disabled state, capability warnings, and file mentions
  functional.
- Default to Ask and preserve all existing broker policy. Hiding a control does
  not infer intent, authorize execution, or change approval behavior.

### Agent-first Direct surface

- Give the Agent flow a clear task-steering header and keep Direct/Monitor/
  Review visible as surface tabs.
- Reduce persistent chrome: hide Human-only layout presets in Agent-first and
  collapse project-skill detail behind a compact disclosure.
- Give an empty task rail a purposeful new-task action instead of a passive
  full-height message.
- Preserve the scientific work surface and execution dock; no panel content or
  Workspace R state is discarded on posture switching.
- At wide desktop widths, keep the task rail compact and ensure the scientific
  work surface is not narrower than the Agent flow without a user resize.
- At narrow supported widths, remove the task rail before compressing the
  composer or scientific work surface into unusable widths.

## States And Acceptance

| State | Expected behavior |
|---|---|
| Empty | Agent-first shows a concise start-task state and focused composer |
| Success/history | task selection and timeline remain usable |
| Busy | send/mode controls remain disabled according to existing policy; cancel remains visible |
| Warning/unavailable | capability message remains visible without covering the input |
| Act | advanced control visibly shows Act and reveals the session authorization checkbox |
| Posture switch | active document, selected turn, pending approvals, and composer text remain intact |
| Narrow window | no incoherent overlap; task rail hides and primary surfaces remain usable |
| Keyboard/accessibility | Enter submits, Shift+Enter inserts a line; disclosure, mode buttons, and textarea are focusable and labelled |

## Non-goals

- No changes to Agent R, Workspace R, Rust commands, schemas, persistence, model
  capability detection, approvals, or Ask/Plan/Act semantics.
- No real task/branch domain model, Monitor/Review redesign, artifact review
  canvas, or new Agent tools.
- No completion claim for interface-modernization Phase 2+.

## Cross-review

- The posture design owns Human/Agent and Direct/Monitor/Review semantics. This
  package changes only the current Direct presentation.
- The intuitive-interaction design already decides on one default `Ask Rho`
  entry with Ask/Plan/Act in an advanced control; this package implements that
  bounded decision without changing broker policy.
- The modernization plan owns shared tokens and responsive behavior. This
  package reuses existing tokens and introduces no theme or framework.
- Existing UX4 P1-P4 behavior remains the compatibility baseline; this package
  does not claim the broader proposal is implemented.

No ownership, schema, policy, persistence, approval, project identity, or
sequencing conflict remains for this slice.

## Verification

- static contract test for markup, policy visibility, preview fixture, and
  responsive rules;
- `node --check desktop/dist/app.js`;
- deterministic browser mock in empty and populated Agent-first Direct states;
- browser interaction for mode disclosure, Act-only authorization, posture
  switching, task selection, and composer focus;
- visual review at 1440x900 and 900x700;
- `git diff --check`.

## Version And Release

This is user-visible desktop behavior and must be recorded in `NEWS.md` after
verification. The application version remains `0.4.0-dev.0` for this working
tree slice and must be advanced before a newly distributed development
candidate is built. R package versions are unaffected. Installed-app acceptance
and release readiness remain open.

## Implementation Outcome

Implemented on 2026-08-02:

- the default composer now exposes the text entry, context, model, effective
  mode, and send action in one compact layer;
- Ask/Plan/Act is progressively disclosed and Act authorization remains visible
  only while Act is selected;
- project skills are collapsed by default, task entries are keyboard-focusable
  buttons, and the empty task rail has a direct `Ask Rho` action;
- Agent-first hides Human-only layout/context chrome, favors the scientific
  work surface, removes the task rail at the narrow breakpoint, and compacts
  the Git-conflict indicator there;
- the deterministic `agent-first-direct` browser scenario covers empty and
  populated states.

Automated and browser evidence is recorded in
[`../verification/agent-first-direct/verification.md`](../verification/agent-first-direct/verification.md).
No backend, persistence, approval, project identity, or Agent policy contract
changed. Installed-app acceptance was not run, so this document remains
`active-` and no release-readiness claim is made.

# Rho Interface Modernization: Scientific And Agent Surfaces

Status: active; M3 implementation and automated/browser verification complete
2026-08-04; installed-app acceptance open

Date: 2026-08-04

Classification: D2 / R1

Owning direction:
`proposed-2026-07-26-interface-modernization-plan.md`

Preceding packages:

- `active-2026-08-04-interface-modernization-foundation-shell-spec.md`;
- `active-2026-08-04-interface-modernization-workbench-hierarchy-spec.md`.

## Authorization And Stop Point

The user explicitly authorized the third interface-modernization phase on
2026-08-04. This contract activates only M3, a presentation package over
existing scientific, operational, Agent, and review records. It does not
activate Phase 4 themes/motion, create a new workflow, or authorize a schema,
command, execution, approval, mutation, persistence, or recovery action.

The mandatory stop point is after M3 implementation, affected frontend and
browser verification, contract review, documentation reconciliation, and one
scoped commit.

## Entry Evidence And Authority

The `0.3.x` WP1-WP4 implementations and repository-wide automated validation
are present, with the milestone review recorded as accept-with-follow-up.
Representative-project and installed/manual acceptance remain open and are not
closed by M3. Agent posture, adaptive work surfaces, Console/Logs separation,
Problems, Environment operations, render jobs, Artifacts, and package mutation
each retain their focused contracts.

M3 owns only visible hierarchy, status labels/icons, progressive disclosure,
empty/loading/error presentation, overflow handling, and deterministic preview
evidence for existing frontend projections.

The following authorities remain unchanged:

- Workspace R owns live scientific objects and execution;
- Rust owns durable Runs, Problems, Artifacts, revisions, approvals, project
  identity, and process state;
- Agent approvals remain in `approval_requests` and never approve direct UI
  environment mutations;
- direct Environment actions remain in `environment_operation_requests` and
  their dedicated dialog;
- file-edit proposals retain explicit Accept/Reject and editor-buffer/file
  behavior under their existing contract;
- Console and Logs remain presentation surfaces, never scientific truth.

## Deliverables

### 1. Shared operational state language

Running, waiting/queued, completed, failed, cancelled/interrupted, stale, and
unavailable states use consistent labels and compact indicators across Runs,
Agent activity, Problems, render/environment state, and relevant empty states.
Every state remains understandable without color. Existing backend values are
displayed through presentation mapping only and are not rewritten.

### 2. Compact Agent activity

- A selected turn presents objective, status, mode/model, final answer, and
  pending-decision attention in a stable scan order.
- Request/model/revision metadata remains available in a quieter technical
  line and wraps safely.
- Tool events remain collapsed by default behind the existing explicit
  activity disclosure; expansion shows bounded result/code detail.
- Long prompts, models, request IDs, results, errors, and code cannot overflow
  the timeline or resize primary controls.

### 3. Distinct review surfaces

Agent approval, file-edit proposal, and direct Environment operation each show
an explicit surface kind, owner/consequence, state, technical identity, and
one clear decision area. Their colors, labels, and action wording must not make
one lane look like another. Existing buttons invoke exactly the existing
handlers and retain current stale/rejection/failure behavior.

### 4. Scientific surface states

- Plot empty and invalid-preview states are distinct and visible while plot
  history/provenance remains available.
- Problems use distinct Info/Warning/Error markers and preserve source,
  producer, rule, grouping, and actions.
- Environment snapshot/render capability states are scannable without hiding
  package, lockfile, project, or operation detail.
- Runs and object lists retain truthful empty states and bounded content.

### 5. Recovery and identifiers

Only existing backend-supported Review, Retry, Cancel, Interrupt, Restart,
source navigation, and refresh controls may be exposed. M3 does not infer a
successful recovery from a click or add a generic retry. Run, request,
revision, model, source, and Artifact identifiers remain locateable but do not
dominate the primary decision.

## States And Accessibility

The focused preview matrix covers populated, empty, running/waiting, completed,
failed, cancelled, stale, and unavailable projections where deterministic
fixtures already exist. State indicators have text or accessible names; icon-
only controls retain names and tooltips. Review regions are named. Activity
disclosures publish `aria-expanded`. Long text wraps or scrolls within its
surface and never causes page-level overflow.

Required viewports are `1920 x 1080` for populated Agent activity and review,
`1440 x 900` for Analyze/Environment and plots, `1280 x 720` for Runs/Problems,
and `900 x 700` for narrow fallback. Dialog review also covers `900 x 700`.

## Verification

Automated gate:

- `node --check desktop/dist/app.js`;
- a focused scientific/Agent surface source-contract test;
- all affected `scripts/test-*-ui.mjs` checks;
- `git diff --check`.

Browser/mock gate:

- populated Agent timeline with activity collapsed and expanded;
- Agent approval, file-edit proposal, and Environment operation surfaces;
- Environment, Plots, Problems, and Runs at their representative states;
- long path/model/request/result content at wide and narrow viewports;
- status text remains present without relying on color;
- no page overflow, incoherent overlap, clipped decision, blank state, or M3-
  attributable console error.

Installed Tauri and Windows 100%/125% display-scale review remain manual gates
against a named candidate.
Use the consolidated candidate record and concrete examples in
`test/acceptance-project/MANUAL-ACCEPTANCE.md` (sections 3, 6, and 8A) and its
candidate result template. These gates are currently NOT RUN.

## Version, NEWS, And Release

M3 is user-visible behavior within the unreleased `0.4.0-dev.0` line. Add a
concise `NEWS.md` entry after implementation and review. Defer the application
version increment to the next named integration candidate and prohibit a new
distribution before synchronized metadata is decided. R package versions do
not change. M3 cannot change release readiness or close `0.3.x` manual gates.

## Implementation And Evidence

M3 is implemented in the static desktop frontend:

- Runs and Agent activity use one presentation-only state mapping with local
  SVG markers and text chips for completed, running, waiting, warning, failed,
  and cancelled projections; raw backend values and durable records are
  unchanged;
- Agent turns keep the prompt and status primary while mode, model, request,
  Run, and source identities use a quieter bounded technical line;
- Agent approvals, file-edit proposals, and direct Environment requests have
  visibly named and distinct review surfaces while retaining their existing
  handlers, records, stale behavior, and decision consequences;
- Environment and render capabilities are split into scannable status chips,
  Problems use accessible `E`, `W`, and `i` severity markers, and Runs keep
  stable marker and metadata geometry;
- Plot empty, pruned, and invalid payload states are distinct. Invalid or null
  media payloads fail visibly without removing their history record, creating
  a false diagnostic, or interrupting workbench initialization;
- deterministic preview states cover Agent approval, file proposals, invalid
  Plot payloads, Environment operations, and existing Problems fixtures.

Automated evidence passed 2026-08-04:

- `node --check desktop/dist/app.js`;
- all 19 `scripts/test-*-ui.mjs` checks, including the new
  `test-scientific-agent-surfaces-ui.mjs` contract;
- `git diff --check`.

Browser/mock evidence passed in the in-app browser against the local current-
repository preview:

- `1920 x 1080` Agent approval and file-proposal surfaces showed distinct
  review kinds, explicit decision actions, collapsed activity by default, and
  bounded expanded event state;
- `1440 x 900` Environment stale review kept its exact request and preview in
  two columns, and an invalid Plot payload showed `Plot preview unavailable`
  while preserving one Plot history row and zero Problems;
- `1280 x 720` grouped Problems retained distinct text severity markers and
  source/review actions without panel or page overflow;
- `900 x 700` Agent approval and Environment stale review retained every
  decision, switched Environment detail to one column, and produced no page,
  panel, or dialog overflow or overlap;
- no Rho console error was recorded in the final Plot recovery probe.

Post-verification review found no command, schema, persistence, approval-lane,
execution-authority, project-isolation, or recovery-action change. The
application remains `0.4.0-dev.0`; the next distribution requires a separately
named synchronized integration-candidate version. R package versions and
release readiness are unchanged. Installed Tauri and physical Windows
100%/125% display-scale review were not run and remain open.

## Acceptance

M3 is implementation-complete when every deliverable is present, automated and
browser gates pass, the implementation is reviewed against this contract,
deviations/evidence are recorded, and scoped files are committed. This document
remains `active-` while installed-app and display-scale acceptance are open.

# Rho Interface Modernization Plan

Status: proposed execution plan

Date: 2026-07-26
Scope: post-`0.2.x` visual quality, interaction consistency, and responsive UI
Related design: `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`

Cross-reviewed against:

- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`;
- `docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`.

Implementation status: focused Phase 1 and Phase 2 packages were separately
authorized and implemented with automated/browser verification on 2026-08-04;
their installed-app and display-scale acceptance remains open. Phase 3 and
later work still require a separately authorized implementation package and
must preserve the implemented posture and persistence authorities.

## Purpose

Rho already has the structure of a capable scientific workbench: project
navigation, a Monaco editor, Console, Plots, Problems, Environment, Agent, and
durable review surfaces. The next interface investment should make those
capabilities easier to scan and more consistent without replacing the product
architecture or turning the application into a decorative dashboard.

This plan defines a staged modernization effort. It is an execution plan, not
authorization to implement all phases in one change. Each phase should be
reviewed and accepted before the next phase begins.

## Product Direction

The target character is:

- quiet, professional, and optimized for repeated technical work;
- dense enough for an IDE, but with clear hierarchy and predictable spacing;
- visually consistent across Code, Analyze, and Agent modes;
- explicit about execution, approval, environment, and recovery state;
- accessible and stable at common Windows desktop sizes;
- recognizable as Rho rather than a copy of RStudio or VS Code.

The editor and scientific results remain the visual focus. Side panels,
toolbars, dialogs, and status surfaces should support that focus rather than
compete with it.

## Current Baseline

The current frontend is a static Tauri web application under `desktop/dist/`
with:

- a top application bar and Code, Analyze, and Agent layout modes;
- resizable Files, editor, execution dock, Agent, and Environment regions;
- reusable tab, button, menu, dialog, timeline, approval, and status patterns;
- Monaco plus a basic-editor fallback;
- a browser/mock mode used for UI review without the desktop broker;
- a light visual theme based on teal accents and neutral surfaces.

This baseline should be refined in place. New presentation components must not
create a second frontend architecture or bypass broker-owned state.

## Design Principles

### 1. Establish hierarchy before decoration

Use contrast, spacing, type weight, alignment, and restrained surface changes
to communicate importance. Avoid gradients, decorative cards, oversized
headings, ornamental backgrounds, and excessive shadows.

### 2. Preserve workbench density

Rho is an operational tool. Controls should remain compact, stable in size,
and easy to scan. Modernization must not reduce the amount of useful project,
code, run, or environment information visible at once.

### 3. Use semantic state consistently

Ready, running, waiting, changed, approved, warning, failed, and unavailable
states must use the same color, icon, label, and interaction behavior wherever
they appear. Color alone must not carry meaning.

### 4. Keep actions proportional to risk

Routine navigation should remain lightweight. Interrupt, restart, environment
mutation, file acceptance, destructive cleanup, and similar actions must stay
visually distinct and preserve their existing review or confirmation rules.

### 5. Prefer progressive disclosure

Primary surfaces show the next decision and concise status. Technical detail,
logs, provenance, and diagnostics remain available through disclosure panels,
inspectors, or secondary views.

### 6. Design for real content

Every component must tolerate long project names, Unicode paths, long model
labels, many tabs, verbose errors, narrow panels, empty data, loading states,
and disconnected services without overlap or clipping.

## Non-Goals

This plan does not authorize:

- replacing the current workbench with a fixed four-pane layout;
- changing Workspace R, Agent R, broker, approval, or persistence ownership;
- merging direct environment operations with Agent approval records or dialogs;
- redesigning scientific capabilities already governed by the `0.3.x` plan;
- adopting React or another frontend framework solely for visual changes;
- introducing an unrestricted terminal or new execution surface;
- hiding errors or mutation details to make the interface appear simpler;
- using animation as a substitute for explicit progress and state labels;
- shipping a public release based on screenshots or automated checks alone.

## Authority And Coordination

This plan owns visual tokens, icons, shared component presentation,
accessibility styling, responsive behavior, themes, and restrained motion. It
does not own scientific capabilities, broker schemas, durable entities,
Workbench posture, Agent permission modes, approval storage, artifact
acceptance, or milestone sequencing.

The active `0.3.x` handoff remains authoritative for environment-operation,
viewer, artifact-provenance, and project-skill contracts. The proposed
workbench-posture design, if accepted, owns the future Human/Agent posture and
Direct/Monitor/Review navigation model. The RStudio-inspired workflow proposal
owns only post-`0.3.x` capability direction and sequencing. The intuitive-
interaction proposal owns task priority, action meaning, guided recovery,
progressive disclosure, and user-facing terminology. Baseline hardening owns
project-switch and retention behavior that those surfaces may present.

Consequences:

- do not create a second top-level state machine from visual layout controls;
- do not make `Agent` simultaneously mean a Human-first layout preset and an
  Agent-first posture;
- do not add or migrate durable task, artifact, finding, job, or approval
  records in a modernization package;
- do not combine Agent approvals, file-edit acceptance, and direct environment
  operation requests into one dialog contract or persistence lane;
- a change touching both visual foundation and product information
  architecture must be split or governed by a focused cross-document design.
- visual styling must not change the consequence of an action defined by the
  intuitive-interaction or baseline-hardening contracts.

## Foundation Contract

Before changing individual screens, define and document a small interface
foundation in `desktop/dist/styles.css` and the associated frontend helpers.

### Design tokens

The token set should cover:

- application, panel, raised, selected, hover, and code surfaces;
- primary, secondary, muted, inverse, and disabled text;
- default, strong, focus, and selected borders;
- accent, success, warning, danger, and informational states;
- a compact spacing scale based on `4`, `8`, `12`, `16`, and `24` pixels;
- control heights for compact, normal, and prominent actions;
- radii no larger than `8px` for ordinary controls and panels;
- restrained elevation for menus, dialogs, and true floating surfaces;
- UI and monospace font stacks with stable line heights;
- motion durations and easing, including reduced-motion behavior.

Components should consume semantic tokens rather than introduce new literal
colors and dimensions for each panel.

### Icon system

Adopt one local, versioned icon set with consistent stroke width and sizing.
Use familiar icons for save, run, interrupt, restart, close, add, expand,
collapse, settings, search, and navigation. Every icon-only button must have an
accessible name and a tooltip. Text symbols and encoding-sensitive glyphs must
be audited and replaced where they can render inconsistently on Windows.

### Component states

Define shared behavior for buttons, segmented controls, tabs, menus, inputs,
badges, notices, empty states, dialogs, timelines, tables, and tooltips. Each
component must specify default, hover, focus, active, disabled, busy, error,
and selected states where applicable.

## Phased Work

### Phase 1: Visual Foundation and Consistency

Focused status: M1 implemented and verified under
`active-2026-08-04-interface-modernization-foundation-shell-spec.md`; installed
acceptance remains open.

Objective: remove the most visible inconsistency without changing workflows.

Work:

1. Inventory literal colors, dimensions, radii, shadows, and typography.
2. Introduce semantic design tokens and migrate existing shared components.
3. Replace encoding-sensitive toolbar and status glyphs with the chosen icons.
4. Standardize control heights, spacing, focus rings, hover states, and tooltips.
5. Correct text truncation, wrapping, and overflow in narrow panels and menus.
6. Add deterministic browser preview states for the main layout and dialogs.

Acceptance:

- common controls use the shared token and component rules;
- no primary toolbar icon depends on a corrupted or ambiguous character;
- keyboard focus is visible on all interactive controls;
- no text or control overlap is visible at the required viewport matrix;
- browser/mock and Tauri surfaces expose the same visible state contract;
- existing project, execution, approval, and environment behavior is unchanged.

### Phase 2: Workbench Hierarchy

Focused status: M2 implemented and verified under
`active-2026-08-04-interface-modernization-workbench-hierarchy-spec.md`;
installed acceptance remains open.

Objective: make the main workspace easier to scan and reduce visual competition.

Work:

1. Refine the top bar around project identity, layout mode, session state, and
   primary execution actions.
2. Refine the current Code, Analyze, and Agent control only as an interim
   Human-first layout selector. Do not freeze its product semantics or persist
   a competing top-level state before the posture decision is accepted.
3. Harmonize Files, document tabs, execution tabs, and context tabs while
   preserving their different roles.
4. Strengthen the editor as the primary surface through quieter surrounding
   chrome and clearer active-document state.
5. Standardize resize handles, collapsed states, panel minimum sizes, and
   restoration behavior.
6. Preserve useful content density at 100% and 125% Windows display scaling.

Acceptance:

- the active project, active document, selected work mode, and Workspace R
  state can be identified without opening a menu;
- Run remains the primary command while interrupt and restart are distinct;
- changing tabs, status labels, or counters does not shift toolbar geometry;
- panel resize and restored layouts do not clip menus or essential actions;
- the editor retains a useful working area in every supported viewport.

### Phase 3: Scientific and Agent Surfaces

Objective: give operational state and review decisions a coherent presentation.

Entry condition: the affected `0.3.x` surface contract must be accepted, and
any change to top-level Agent navigation must follow an accepted posture
design. This phase may restyle or reorganize projections of existing records;
it may not introduce new scientific, task, artifact, job, or approval schemas.

Work:

1. Align Console, Plots, Problems, Runs, and Environment status vocabulary and
   visual semantics.
2. Present Agent activity as a compact, readable timeline with collapsible
   evidence and technical detail.
3. Refine file-edit proposals, Agent approvals, and environment-operation
   dialogs as distinct review surfaces with clear consequence and ownership.
4. Improve object, plot, artifact, and environment empty/loading/error states.
5. Keep provenance, revision, request, and run identifiers available without
   allowing them to dominate the primary view.
6. Add actionable recovery controls only when the backend contract supports
   the corresponding action.

Acceptance:

- direct UI environment operations remain in their dedicated broker-owned
  request lane and dedicated dialog surface;
- Agent approvals and file-edit acceptance cannot be visually mistaken for
  direct environment operations;
- running, waiting, completed, failed, stale, and cancelled states remain
  distinguishable without color alone;
- long result, error, path, model, and request labels do not overflow;
- the user can locate the next required decision within one visual scan.

### Phase 4: Theme, Motion, and Polish

Objective: complete the visual system after the light theme and core workflows
are stable.

Work:

1. Add a deliberately designed dark theme using the same semantic tokens.
2. Respect the system theme and persist an explicit user override.
3. Add restrained `120-180ms` transitions for menus, dialogs, tabs, notices,
   and state changes.
4. Honor `prefers-reduced-motion` and avoid continuous decorative animation.
5. Tune Monaco, Console, plot surrounds, diff views, and code blocks for both
   themes.
6. Perform final contrast, keyboard, scaling, and installed-application review.

Acceptance:

- all product surfaces are readable and semantically consistent in both themes;
- theme changes do not flash unreadable intermediate colors;
- motion never delays execution, approval, cancellation, or recovery actions;
- reduced-motion mode removes nonessential movement;
- screenshots and manual inspection pass at both supported Windows scale factors.

## Viewport and State Matrix

Every phase that changes layout must capture at least:

| Viewport | Required state |
| --- | --- |
| `1280 x 720` | Code mode with Files and execution dock visible |
| `1440 x 900` | Analyze mode with Environment and plot content |
| `1920 x 1080` | Agent mode with a populated timeline and review surface |
| narrow supported window | Long project name, long tab, and open menu |
| relevant viewport | Empty, loading, success, warning, error, and unavailable states |

At least one capture must include a long Unicode project path, multiple open
documents, and non-zero counters. Dialog work must include the longest expected
title, summary, path, and action labels.

## Verification Contract

### Automated checks

Each implementation package should run:

- frontend JavaScript syntax and repository-defined source checks;
- existing Rust and R tests affected by the changed state contract;
- focused interaction checks for keyboard navigation and state transitions;
- deterministic browser/mock readiness and screenshot capture;
- overflow checks for menus, dialogs, tabs, buttons, and resizable panels;
- a scan for unapproved literal colors, encoding-sensitive action glyphs, and
  missing accessible names on icon-only controls.

If Rust tests are required on Windows, prepend the repository's documented
Rtools GNU toolchain path before running the GNU target.

Do not treat an empty `msedge --dump-dom` result as proof that the preview
failed. Use the deterministic preview hook and screenshot readiness as the
primary fallback, and record which evidence path was used.

### Manual acceptance

Automated evidence does not establish visual quality. A reviewer must inspect:

- hierarchy and readability in each work mode;
- mouse and keyboard operation of menus, tabs, dialogs, and resizing;
- text fit at 100% and 125% Windows display scaling;
- long names, Unicode paths, errors, empty states, and disconnected services;
- light and dark themes when Phase 4 is in scope;
- parity between browser/mock review and an installed Tauri candidate;
- complete scientific workflow and recovery states affected by the change.

Visual acceptance for a development build is separate from final-installer UI,
installation, SmartScreen, workflow/recovery, and uninstall acceptance.

## Implementation Boundaries

- Keep browser/mock handlers in lockstep with any new Tauri command or state.
- Bind environment state and operations to the explicit normalized project root.
- Do not infer backend success from optimistic animation or frontend state.
- Preserve plain JSON-serializable broker payloads and bounded display data.
- Keep accessibility semantics in the HTML; do not make them screenshot-only.
- Avoid one-off CSS fixes that bypass the shared token or component contract.
- Keep each change reviewable: foundation, shell hierarchy, workflow surfaces,
  and theme work should land as separate implementation packages.

## Deliverables Per Phase

Each phase handoff must include:

1. the scoped implementation diff;
2. a short token or component contract update where applicable;
3. before and after screenshots from the required matrix;
4. automated test output and the exact commands used;
5. manual acceptance results with unresolved issues listed explicitly;
6. browser/mock versus Tauri parity notes;
7. a statement of worktree state and files intentionally included;
8. a go, conditional-go, or no-go decision for the next phase.

## Completion Criteria

The modernization initiative is complete when:

- the shared visual foundation is used throughout the workbench;
- common actions and states are visually and behaviorally consistent;
- the main scientific and Agent workflows remain clear at supported sizes;
- browser/mock mode and Tauri remain sufficiently aligned for UI review;
- light and dark themes pass accessibility and manual visual acceptance;
- no modernization change weakens broker ownership, approval separation,
  project-root safety, bounded payloads, or recovery visibility;
- final installed-application acceptance is recorded separately for the release
  candidate that contains the completed work.

Until these criteria are met, the document remains `proposed-`. Rename it to
`active-` only when the first reviewed implementation package is authorized,
and to `implemented-` only after all in-scope phases and acceptance gates are
complete.

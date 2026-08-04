# Rho Interface Modernization: Foundation And Shell

Status: active; M1 implementation and automated/browser verification complete
2026-08-04; installed-app acceptance open

Date: 2026-08-04

Classification: D2 / R1

Owning direction:
`proposed-2026-07-26-interface-modernization-plan.md`

## Authorization And Stop Point

The user explicitly authorized the interface upgrade on 2026-08-04. This
contract activates only M1, a bounded visual-foundation and workbench-shell
package. It does not activate the remaining scientific-surface, theme, motion,
or whole-application phases of the umbrella proposal.

The mandatory stop point is after the M1 implementation, affected automated
checks, browser review, contract review, and documentation reconciliation. Any
theme work or workflow-specific redesign requires a separate authorization.

## Problem

The implemented Human-first and Agent-first structures are usable, but the
shared shell still looks transitional:

- project, posture, layout, session, and secondary actions compete at nearly
  equal visual weight;
- file, dock, Agent-surface, and context tabs are insufficiently distinct;
- common controls use many one-off colors, heights, radii, and hover states;
- primary toolbar actions still depend on mixed text symbols whose rendering
  can vary by encoding and Windows font;
- narrow layouts rely on ad hoc hiding and do not consistently protect stable
  control geometry, truncation, or keyboard focus.

## Authority And Compatibility

This contract owns presentation only: semantic tokens, shared control states,
local icons, shell hierarchy, tab presentation, focus visibility, overflow,
and responsive geometry.

The following implemented contracts remain authoritative:

- Human/Agent posture and Task/Runs/Review navigation;
- the Agent-first default Task surface with contextual file, run, Artifact,
  and audit work surfaces;
- Human-first Code/Analyze/Agent layout selection;
- Workspace R execution, Agent policy, approval, file-edit, environment,
  project, persistence, and recovery semantics;
- the Console transcript and separate Logs surface.

M1 must not add a durable state, Tauri command, mock command, schema, network
request, permission, approval lane, or backend dependency. Existing element
identities and command wiring remain compatible.

## Deliverables

### 1. Semantic foundation

Extend the existing root variables with semantic application, raised,
selected, hover, text, border, spacing, control-height, elevation, focus, and
motion tokens. Shared controls consume those tokens where M1 touches them.
Ordinary controls and panels keep radii at or below 8 px.

### 2. Shared control states

Buttons, segmented controls, menus, inputs, and tabs changed by M1 have stable
default, hover, focus-visible, active/selected, and disabled states. Focus must
remain visible without shifting layout. Compact toolbar controls retain fixed
dimensions when labels, counters, or status content change.

### 3. Local icon contract

Primary shell actions use a small local, versioned SVG icon sprite with a
consistent 1.75 px stroke. M1 covers at least restart, interrupt, run, add,
file, and audit. Every icon-only control keeps an accessible name and tooltip;
icons are decorative to assistive technology. No runtime package or network
dependency is introduced.

### 4. Shell hierarchy

- project identity remains visible and truncates safely;
- Human/Agent posture is visually distinct from the Human-first layout
  selector;
- Run remains the primary Human-first execution command;
- Agent-first keeps Task as the simple default, with file and audit as
  secondary contextual actions;
- session restart/interrupt remain visually distinct and never merge with Run;
- menus are true raised surfaces; page regions are not converted into floating
  decorative cards.

### 5. Tab roles and responsive behavior

File tabs, dock tabs, Agent Task/Runs/Review tabs, and context tabs retain their
existing behavior but receive distinct presentation appropriate to their
level. Labels truncate or scroll without resizing adjacent controls.

Required browser viewports are `1280 x 720`, `1440 x 900`, and `900 x 700`.
Human-first and Agent-first must not produce horizontal document overflow.
At 900 px, essential project/posture/session or contextual actions remain
usable through the existing responsive policy.

## States And Accessibility

M1 changes presentation without redefining loading, empty, success, warning,
error, stale, unavailable, or busy truth. Existing state labels stay visible
and color is not their only signal. Interactive controls keep an accessible
name; icon-only controls keep both `aria-label` and `title`. Reduced-motion
preferences disable nonessential transitions.

## Verification

Automated gate:

- `node --check desktop/dist/app.js`;
- focused foundation/shell source-contract checks;
- `node scripts/test-agent-first-ui.mjs`;
- `node scripts/test-console-logs-ui.mjs`;
- all other frontend `scripts/test-*-ui.mjs` checks affected by shared styles;
- `git diff --check`.

Browser/mock gate:

- Human-first and Agent-first at `1280 x 720`;
- representative Human-first at `1440 x 900`;
- Human-first and Agent-first at `900 x 700`;
- open menu, long project/tab labels, visible counters, and focus-visible state;
- no page-level horizontal overflow, overlapping controls, clipped menu, or
  blank contextual work surface;
- no browser console errors attributable to M1.

Installed Tauri acceptance and 100%/125% Windows display-scale inspection are
manual gates and remain open unless explicitly performed against a named
candidate. Browser screenshots are review evidence, not installed acceptance.
The runnable candidate steps and evidence fields are consolidated in
`test/acceptance-project/MANUAL-ACCEPTANCE.md` (section 8A) and its candidate
result template; their status is NOT RUN.

## Version, NEWS, And Release

M1 is a user-visible improvement within the unreleased `0.4.0-dev.0`
development line. Add a concise `NEWS.md` improvement after implementation
passes review. Defer the application version increment to the next named
`0.4.0` integration candidate; this package must not be distributed as a new
candidate before that synchronized version decision. R package versions do not
change because no R package contract changes.

This package does not change release readiness. Installer and final release
acceptance remain separate.

## Implementation And Evidence

M1 is implemented in the static desktop frontend:

- `desktop/dist/styles.css` now defines the semantic surface, text, spacing,
  control-height, focus, elevation, and motion foundation used by the shell;
- `desktop/dist/index.html` contains a local Lucide-compatible SVG sprite for
  restart, interrupt, run, add, file, and audit actions, while preserving the
  existing button identities and accessible names;
- project/posture/layout/session/action hierarchy, document/dock/context/Agent
  tab roles, fixed Run geometry, reduced motion, and responsive conflict
  presentation are implemented without command or persistence changes;
- `?preview=interface-shell` provides deterministic long Unicode project,
  multiple document tab, and non-zero counter evidence.

Automated evidence passed 2026-08-04:

- `node --check desktop/dist/app.js`;
- all 17 `scripts/test-*-ui.mjs` checks, including the new
  `test-interface-foundation-ui.mjs` contract;
- `git diff --check`.

Browser/mock evidence passed in the controlled local preview:

- Agent-first Task at `1280 x 720`: all five visible shell icons rendered at
  `16 x 16`, with no document or topbar overflow;
- Human-first and Agent-first at `900 x 700`: no document or topbar overflow;
- Human-first at `1440 x 900`: open File menu remained within the viewport;
- `interface-shell` at `1440 x 900`: the long Unicode project label truncated
  (`288 px` content in `219 px`), three document tabs and `12`/`3` counters
  remained stable, and neither the page nor topbar overflowed;
- shell keyboard focus rendered a 2 px accent outline; browser console errors
  attributable to M1 were zero.

Post-verification contract review found no change to commands, posture values,
execution, approvals, project state, persistence, or mock command parity. One
responsive presentation decision was added during review: below `1500 px`, the
topbar keeps the Conflicts badge but hides file-level conflict controls so Run
and Audit remain visible; full conflict handling remains available in Git
Review.

Application version remains `0.4.0-dev.0`; the next named integration candidate
must synchronize version metadata before distribution. `NEWS.md` is updated.
R package versions are unchanged. Installed Tauri review and Windows 100%/125%
display-scale acceptance were not run and remain open. M1 does not change the
current release decision.

## Acceptance

M1 is implementation-complete when:

- all deliverables above are present without a behavior or authority change;
- the automated gate passes;
- browser review covers the required postures and viewports;
- implementation is reviewed against this contract and deviations are
  recorded;
- document/evidence status, NEWS, version decision, residual risks, manual
  acceptance, and release decision are reported separately;
- the scoped files are committed without unrelated worktree changes.

The document remains `active-` while installed-app and display-scale manual
acceptance are open. Completion of M1 does not imply that the umbrella
modernization proposal is complete.

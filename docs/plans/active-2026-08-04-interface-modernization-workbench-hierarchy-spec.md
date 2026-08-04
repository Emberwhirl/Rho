# Rho Interface Modernization: Workbench Hierarchy And Panel Geometry

Status: active; M2 implementation and automated/browser verification complete
2026-08-04; installed-app acceptance open

Date: 2026-08-04

Classification: D2 / R1

Owning direction:
`proposed-2026-07-26-interface-modernization-plan.md`

Preceding package:
`active-2026-08-04-interface-modernization-foundation-shell-spec.md`

## Authorization And Stop Point

The user explicitly authorized continuation with the second interface-
modernization phase on 2026-08-04. This contract activates only M2, a bounded
Human-first workbench hierarchy and panel-geometry package. The umbrella plan
remains proposed and does not authorize Phase 3 scientific/Agent surface work,
themes, motion, or a new top-level navigation model.

The mandatory stop point is after M2 implementation, focused and affected
frontend verification, browser viewport review, contract review,
documentation reconciliation, and one scoped commit.

## Problem And Baseline Evidence

The M1 shell is visually coherent, but the Human-first workbench still has
several hierarchy and restoration gaps:

- editor actions use mixed character glyphs whose weight and meaning vary by
  font, while the shell already uses a local SVG icon system;
- document tabs expose visual selection without complete tab semantics;
- dock, context, and side selections do not consistently synchronize
  `aria-selected` with their visible active state;
- the dock resize target is visually slight and its range metadata does not
  reflect the dynamic limits used by panel sizing;
- dock maximize uses changing text glyphs instead of a stable icon state;
- selecting Code, Analyze, or Agent changes the visible Human layout without
  updating `state.humanPreset`, so session persistence and posture restoration
  can return to a stale layout.

The deterministic `interface-shell` preview at `1440 x 900` confirms three
document tabs with no `role` or `aria-selected`, a 6 px dock resize handle, and
no dock `aria-valuemax`. Existing project, execution, panel, and session
authorities otherwise remain usable and are not redefined here.

## Authority And Compatibility

M2 owns only presentation and local frontend synchronization for:

- Human-first editor emphasis and surrounding chrome;
- document, dock, context, and side-tab accessibility state;
- editor and dock action icons using the existing local sprite contract;
- panel resize affordances and truthful dynamic ARIA range metadata;
- restoration of the existing `code | analyze | agent` Human layout value.

The existing `human_preset` session field remains the sole durable Human layout
authority. M2 may validate that value, update it when the user selects an
existing layout, and invoke the existing session-save path. It must not add a
field, schema, command, storage mechanism, or competing top-level state.

Human/Agent posture, Task/Runs/Review, Workspace R execution, Agent policy,
approvals, project identity and switching, environment operations, file edits,
and persistence remain owned by their accepted contracts. Browser/mock mode
must continue to use the same frontend behavior; no Tauri command changes.

## Deliverables

### 1. Editor hierarchy and actions

- The active document is visually clear and programmatically selected.
- The editor remains the primary flexible region in Human-first layouts.
- Format, rename, extract, save, run selection, and run all use the local SVG
  icon system with stable 28 px geometry, accessible names, and tooltips.
- Run remains the primary top-bar execution command; editor actions do not
  redefine execution semantics.

### 2. Tab roles

- Document, dock, context, and side-tab groups expose labeled tablists.
- Selectable tabs expose `role="tab"` and synchronized `aria-selected` values.
- Document close remains a separate named action and does not become a tab.
- Changing labels or counters does not resize adjacent toolbar actions.

### 3. Panel geometry

- Left, right, and dock handles keep usable pointer hit areas and show a clear
  one-pixel resting divider with a stronger hover/focus/resizing state.
- Each separator exposes current, minimum, and maximum values derived from the
  same dynamic limits used to clamp panel dimensions.
- Dock maximize and restore use one named icon button whose icon and tooltip
  truthfully reflect the next action.
- Existing panel-size persistence and session restoration remain authoritative.

### 4. Human layout restoration correction

- User selection of Code, Analyze, or Agent updates `state.humanPreset`, applies
  the existing layout, and schedules the existing session save.
- Hydration accepts only `code`, `analyze`, or `agent`; missing or malformed
  historical values recover to `code`.
- Posture changes restore the last valid Human layout without altering Agent-
  first surface state.

## States And Bounds

M2 must preserve useful editor content at `1440 x 900`, `1280 x 720`, and
`1152 x 720` (the browser equivalent of 1440 px at 125% scaling), with a
`900 x 700` narrow fallback. Resizing clamps to current viewport-derived panel
limits. A too-small restored size clamps visibly and updates ARIA truth; it is
not reported as the unachievable stored value.

Empty or long document labels, non-zero counters, focused separators, normal
dock, maximized dock, restored dock, Code, Analyze, and Human-first Agent
layouts must not cause page-level horizontal overflow, menu clipping, toolbar
movement, or loss of the essential editor/work surface.

## Verification

Automated gate:

- `node --check desktop/dist/app.js`;
- a focused workbench hierarchy and restoration source-contract test;
- all affected `scripts/test-*-ui.mjs` checks;
- `git diff --check`.

Browser/mock gate:

- Code, Analyze, and Human-first Agent at the required viewport matrix;
- long project/document labels and non-zero counters;
- active document, dock, context, side, and layout accessibility state;
- left, right, and dock separator current/minimum/maximum metadata;
- dock maximize followed by restore;
- no page/topbar overflow, clipped essential action, or browser console error
  attributable to M2.

Installed Tauri review and physical Windows 100%/125% display-scale inspection
remain manual gates against a named candidate. Browser evidence does not close
those gates.

## Version, NEWS, And Release

M2 is user-visible behavior within the unreleased `0.4.0-dev.0` line. Add a
concise `NEWS.md` improvement only after implementation and review. Defer the
application version increment to the next named integration candidate; do not
distribute a new candidate before synchronized version metadata is decided.
R package versions do not change. M2 does not change release readiness.

## Implementation And Evidence

M2 is implemented in the static desktop frontend:

- the editor toolbar and Dock maximize/restore action use eight additional
  icons in the existing local Lucide-compatible SVG sprite, with stable named
  controls and no runtime dependency;
- document, side, Dock, context, and Agent-surface tabs expose labeled
  tablists and synchronized selection state;
- all panel separators use larger stable hit targets and publish current
  viewport-derived minimum, maximum, and current values;
- the existing `human_preset` value is normalized to `code | analyze | agent`,
  updated on layout changes, saved through the existing session path, and
  restored after an Agent-to-Human posture round trip;
- `interface-shell` preview evidence now includes the Human preset, tab
  selections, panel sizes, Dock expansion state, and editor geometry.

Two presentation defects found during browser review were fixed in scope:

- at `1280 x 720`, the long project selector pushed Audit 35 px beyond the
  topbar; its responsive maximum is now 220 px and Audit ends at x=1278;
- at `900 x 700`, the Code layout retained a three-column rule after the
  sidebar was hidden, leaving a 200 px editor; the narrow Code override now
  gives the editor the full 900 px width.

Automated evidence passed 2026-08-04:

- `node --check desktop/dist/app.js`;
- all 18 `scripts/test-*-ui.mjs` checks, including the new
  `test-workbench-hierarchy-ui.mjs` contract;
- `git diff --check`.

Browser/mock evidence passed in headless local Microsoft Edge:

- Code, Analyze, and Human-first Agent at `1440 x 900`, `1280 x 720`,
  `1152 x 720`, and `900 x 700` had no page overflow;
- editor dimensions were respectively 1226/864/864 px, 1066/704/704 px,
  938/576/576 px, and 900/570/570 px across those three layouts;
- six editor actions remained exactly `28 x 28` px, all three document tabs
  exposed one truthful selection, and visible side/Dock/context tab changes
  synchronized their accessible selection state;
- separator hit targets measured 9 px vertically and 8 px horizontally, with
  finite dynamic minimum/current/maximum values at every viewport;
- Dock expansion reached the current maximum (674, 494, 494, and 474 px) and
  restored exactly to 260 px with the correct icon and accessible name;
- Analyze -> Agent posture -> Human posture restored Analyze and Environment;
- no M2-attributable browser error occurred. One initial missing-favicon 404
  from the existing preview server was observed and did not recur on all
  pages; it is outside this work package.

Post-verification contract review found no new command, schema, persistence
field, approval path, execution authority, project behavior, or mock/desktop
contract. The application remains `0.4.0-dev.0`; distribution waits for the
next synchronized integration-candidate version decision. `NEWS.md` is
updated, R package versions are unchanged, and release readiness is unchanged.
Installed Tauri acceptance and physical Windows 100%/125% display-scale review
were not run and remain open.

## Acceptance

M2 is implementation-complete when every deliverable is present, the automated
and browser gates pass, the implementation is reviewed against this contract,
deviations and evidence are recorded, and the scoped files are committed.

The document remains `active-` while installed-app and display-scale manual
acceptance are open. M2 completion does not authorize or complete Phase 3.

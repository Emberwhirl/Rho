# Workbench Menu And Command Organization

Status: active implementation contract

Date: 2026-08-05
Authorization: the user explicitly authorized menu reorganization as the
second of three independently completed and committed work packages
Classification: D2 bounded user workflow / R1 local frontend behavior
Work package: UX-MENU-1
Mandatory stop: after menu organization, command-state and keyboard tests,
affected frontend validation, contract review, NEWS update, and one independent
commit

## Problem And Evidence

The current `Tools` menu duplicates the prominent Code, Analyze, and Agent
layout selector through Agent and Environment commands. Render is grouped with
those navigation duplicates even though it executes a saved scientific
document. `Session` contains execution controls but does not expose ordinary
Run commands. File and Edit have useful recent additions, but lack grouping,
truthful disabled states, Select All, and complete keyboard menu behavior.

## User-Visible Contract

Rho retains five top-level menus without adding a deeper hierarchy:

- File: Open Project, New File, Save, and Close File;
- Edit: Undo, Redo, Find, Replace, Select All, Toggle Line Comment, and Format
  Document;
- Run: Run Selection or Line, Run File, Render Active Document, Interrupt R,
  and Restart Workspace R;
- View: Focus Editor, Focus Console, Show Logs, Show Plots, Show Problems, and
  Reset Panel Sizes;
- Help: Check for Updates and About Rho.

`Tools`, its Agent/Environment duplicates, and the `Session` label are removed.
Code, Analyze, and Agent remain the only prominent Human layout selectors.

Menu commands reuse the existing command router, editor actions, Dock tabs,
render action, session actions, and panel-size authority. They do not create a
parallel state machine. Commands are disabled when their target is absent or
unavailable. Disabled commands do not emit misleading failure toasts.

Select All uses the active Monaco/basic editor only. Native selection and
clipboard chords remain platform-owned; this package does not add synthetic
Cut, Copy, Paste, Save All, Save As, arbitrary-file, or shell behavior.

## Interaction And Accessibility

- Separators group project/file, edit/search, document, execution, and session
  commands without nested submenus.
- Opening a menu refreshes command availability from current project,
  document, busy, render, and session state.
- Arrow Down/Up, Home/End, Left/Right, Enter/Space, and Escape provide ordinary
  menu traversal while skipping disabled commands and restoring trigger focus.
- Mouse activation and keyboard activation call the same command router.
- Menus remain visible and within the topbar at the installed application's
  supported minimum width of 1024px. The below-minimum 900px browser fallback
  may hide the menu to preserve primary workbench actions. Disabled, hover,
  and keyboard-focus states remain visually distinct.

## Authority And Cross-Review

- `active-2026-08-05-native-context-lint-problems-editor-shortcuts-spec.md`
  owns the common editor command router and native context/clipboard boundary.
- `active-2026-08-04-interface-modernization-workbench-hierarchy-spec.md` owns
  the existing Code/Analyze/Agent layout selectors, tabs, panel geometry, and
  persistence. This package removes duplicate menu navigation and reuses its
  state.
- `active-2026-08-03-ws2-formatting-review-spec.md` and the active render
  contracts retain Format and Render behavior. Menu entries only invoke them.
- Viewer/Outputs remains the separately authorized third work package. This
  package keeps the current Plots label and does not prewire Viewer behavior.

No schema, persistence field, project identity, file mutation, Workspace R,
Agent, approval, credential, network, protocol, or release authority changes.

## Verification

Automated:

- `node --check desktop/dist/app.js`;
- focused menu structure, command routing, disabled-state, keyboard, and
  duplicate-removal contract;
- editor shortcut, formatting, render, hierarchy, and usability regressions;
- all affected frontend UI contract scripts;
- `git diff --check`.

Browser/mock:

- mouse and keyboard traversal of all five menus;
- disabled state with no active document and enabled state with an editable R
  document;
- Run/View commands open the intended existing surface;
- Reset Panel Sizes restores the three existing defaults;
- no topbar/menu overflow at 1440x900, 1280x720, 1152x720, and the supported
  1024px minimum; the 900x700 fallback hides rather than clips the menu.

Installed Tauri and Windows display-scale acceptance remain open for a named
candidate and do not block this source-level development commit.

## Version And Release

This is user-visible behavior in the existing `0.4.0-dev.0` development line,
so `NEWS.md` is updated after verification. Application and R package versions
do not change in this work package. Release readiness is unchanged.

## Definition Of Done

UX-MENU-1 is complete when the five-menu contract has no duplicate Human
layout entries, every command reaches an existing truthful action, unavailable
commands are disabled, mouse/keyboard behavior and supported widths pass, the
implementation is reviewed against this contract, evidence is recorded, and
the scoped files are committed independently.

## Implementation And Evidence

UX-MENU-1 is implementation-, automation-, and browser-review complete on
2026-08-05.

- The top-level menus are File, Edit, Run, View, and Help. Session and Tools,
  including duplicate Agent/Environment layout navigation, are removed.
- Existing File/Edit commands are grouped with separators; Select All uses the
  active Monaco/basic editor. Run and View invoke only existing execution,
  Render, session, Dock, focus, and viewport-clamped panel-size behavior.
- Menu availability is refreshed on open. Format is now consistently disabled
  outside editable `.R` documents, matching its existing contract.
- Trigger and menu-item keyboard handling covers vertical, edge, adjacent-menu,
  activation, and focus-restoring Escape behavior while skipping disabled
  commands.
- The menu remains visible at the supported 1024px minimum. At 1180px and
  below, Run and Check project use their named fixed-size icons so essential
  actions fit; below the supported minimum, the 900px fallback hides the menu.

Verification passed:

- `node --check desktop/dist/app.js`;
- all 29 `scripts/test-*-ui.mjs` frontend contracts;
- `git diff --check`;
- browser/mock mouse routing from View to Problems;
- browser/mock Edit-to-Run keyboard traversal and focus placement;
- `.qmd` Format disabled-state review;
- Reset Panel Sizes restored the viewport-clamped left/right/Dock defaults and
  cleared Dock expansion;
- 1440x900, 1280x720, 1152x720, and 1024x700 kept the menu and top actions
  within the viewport with no document-level horizontal overflow; 900x700
  hid the menu and retained no overflow.

Contract review found no new command authority, schema, persistence field,
project behavior, Workspace R/Agent operation, file mutation, Format/Render
semantics, or Viewer implementation. Application and R package versions are
unchanged. Installed Tauri mouse/keyboard and Windows 100%/125% display-scale
acceptance were not run and remain open; release readiness is unchanged.

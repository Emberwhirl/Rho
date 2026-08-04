# Native Context, Diagnostics, And Editor Shortcuts Repair

Status: active implementation contract

Date: 2026-08-05
Authorization: user confirmed the context-menu, Lint-entry, and Problems-clear
recommendations, then explicitly requested complete common editor shortcuts;
each behavior must be implemented and committed separately
Change class: D2 bounded multi-package usability repair containing D1/R1-R2
slices
Work packages: UX-CONTEXT-1, WS2-LINT-CALL-1, WS2-LINT-ENTRY-1,
WS2-LINT-CLEAR-1, UX-KEYS-1
Mandatory stop: verify and commit each package before starting the next;
installed-candidate acceptance remains separate

## Problem And Evidence

1. Ordinary Rho surfaces expose the WebView page context menu, including
   Refresh and Save as, which are meaningless and potentially disruptive in a
   desktop workbench.
2. Installed-app Lint fails before Workspace R because the frontend sends the
   snake-case `document_version` key while Tauri expects `documentVersion`.
   Browser mock and its source-pattern test repeat the wrong key and therefore
   did not detect the real boundary failure.
3. Lint is a file-scoped editor command but appears as a raw technical label in
   the execution-dock toolbar regardless of the selected dock tab.
4. Problems mixes transient `lintr` diagnostics with durable failed-Run
   projections. It has no truthful clear operation.
5. Rho explicitly wires Save and scientific execution chords but does not own
   a coherent common editor-command shortcut contract. Close, undo, and redo
   are not reliably available across Monaco and the basic editor.

## Shared Boundaries

- Monaco remains the advanced editor and owns its editing model, selection,
  native editor context menu, undo stack, find widget, and standard text
  operations.
- Text inputs, textareas, selects, and editable content retain native text
  context operations. Ordinary app chrome must not expose the browser page
  menu. No custom menu is added where it has no useful Rho action.
- Workspace R and `rho.bridge` remain authoritative for `lintr`; Rust/Tauri
  retain path and document-version validation. This stream changes no provider
  response, package version, execution authority, or file-write authority.
- `lintr` diagnostics remain transient frontend state. Durable Problems remain
  projections of failed Runs and cannot be deleted or dismissed by the new
  clear action.
- Existing guarded Save, close-draft preservation, run, navigation, format,
  rename, and extract commands remain authoritative. Shortcuts reuse them.
- Input fields and visible dialogs own their keystrokes. A workbench shortcut
  must never close, save, or edit a project document while focus belongs to
  Console, Agent, a form field, or a modal dialog.

## Work Packages

### UX-CONTEXT-1: Desktop context-menu policy

- Prevent the WebView page menu on ordinary non-editable Rho surfaces.
- Preserve Monaco's editor menu and native context operations in editable form
  controls.
- Do not add placeholder menus to Files, Problems, Plots, or general chrome.
- Regression coverage proves ordinary chrome is suppressed and editor/input
  ownership is preserved.

### WS2-LINT-CALL-1: Installed Lint invocation repair

- Invoke `editor_lint_file` with Tauri's required camel-case
  `documentVersion` argument while preserving the project-relative path.
- Browser mock accepts the real boundary shape. The contract test must reject
  a regression to the snake-case top-level invoke argument.
- Successful, unavailable-provider, provider-error, malformed/stale response,
  and dirty-file refusal semantics remain unchanged.

### WS2-LINT-ENTRY-1: Intuitive Check code entry

- Rename the user-facing command to `Check code` and place it in the editor
  action toolbar beside Format because it acts on the active saved R file.
- The action has a familiar check icon, accessible name, and concise tooltip.
- It is enabled only for an editable active R source file in a ready, idle
  project. Its running state remains stable and does not resize the toolbar.
- Problems remains the only diagnostics result surface. No duplicate Lint
  action remains in the dock header.

### WS2-LINT-CLEAR-1: Clear transient diagnostics

- Problems exposes one visible icon action named `Clear lint results`.
- It removes only `origin === "lintr"` entries, resets Lint status/proposal,
  closes any open Lint quick-fix review, and rerenders Problems.
- Failed-Run Problems, Runs, files, editor buffers, and provider state on disk
  are unchanged. The action is disabled when no transient Lint result/status
  exists.
- Refreshing durable project data must not turn this command into Run deletion.

### UX-KEYS-1: Common editor shortcuts

Rho owns a single command router shared by Monaco, the basic editor, menus,
and document-level shortcuts where appropriate:

- Save: `Ctrl+S` (`Cmd+S` on macOS), using guarded Save;
- Close active file: `Ctrl+W` (`Cmd+W`), using existing draft-preserving close;
- Undo: `Ctrl+Z` (`Cmd+Z`), using the active editor undo stack;
- Redo: `Ctrl+Y`, plus `Ctrl+Shift+Z` (`Cmd+Shift+Z`), using the active editor
  redo stack;
- Find: `Ctrl+F` (`Cmd+F`) and Replace: `Ctrl+H` (`Cmd+Alt+F` on macOS where
  Monaco defines it), using editor-native widgets;
- Toggle line comment: `Ctrl+/` (`Cmd+/`), using Monaco's command and a bounded
  line-based equivalent in the basic editor;
- New file: `Ctrl+N` (`Cmd+N`) and Open project: `Ctrl+O` (`Cmd+O`), reusing
  existing guarded UI actions;
- retain `Ctrl+Enter`, `Ctrl+Shift+Enter`, F2, F12, Shift+F12,
  `Ctrl+Shift+E`, and `Shift+Alt+F` for existing editor actions.

Native selection and clipboard chords remain owned by Monaco/the platform and
must not be intercepted. Unsupported operations such as Save As are not faked.
The File/Edit menus add Close, Find, Replace, and Toggle Line Comment commands
using the same router; existing Undo/Redo use it as well.

## Cross-Review

- `active-2026-08-03-ws2-diagnostic-grouping-quick-fix-spec.md` remains owner
  of normalized diagnostics and reviewed fixes. These packages repair command
  transport and presentation only.
- `implemented-2026-07-16-wp3-structured-runs-problems-recovery-design.md`
  remains owner of durable failed Runs and Problems. Clear never mutates store
  records.
- `active-2026-08-04-five-usability-repairs-spec.md` remains owner of guarded
  Save. UX-KEYS-1 extends the command set without redefining Save semantics.
- Existing WS2 navigation/refactor/format contracts retain F2/F12,
  references, extract, and formatting behavior.
- M1-M3 remain presentation authority. New icon controls use the existing
  local icon system and fixed editor-action geometry.

No schema, migration, project identity, approval, credential, network,
Workspace execution, or new filesystem authority is introduced.

## Verification And Acceptance

Each package requires JavaScript syntax, a focused deterministic frontend
contract, adjacent editor/Problems/workbench tests, `git diff --check`, contract
review, and a clean scoped commit before the next package starts.

Final affected validation includes all focused scripts, workbench hierarchy,
usability repairs, editor format/refactor, scientific surface tests, and the
Rtools GNU Rust workspace because WS2-LINT-CALL-1 crosses the Tauri boundary.

The consolidated manual project must verify in a rebuilt installed candidate:

- ordinary chrome never offers Refresh or Save as, while Monaco and form inputs
  retain useful context operations;
- Check code produces real `lintr` diagnostics or a truthful unavailable state;
- Clear lint results removes diagnostics but preserves a failed-Run Problem;
- every documented shortcut works in Monaco, close preserves an unsaved draft,
  undo/redo restore exact text, and Console/Agent/dialog inputs do not trigger
  project-file commands.

## Version And Release

- Record user-visible results in `NEWS.md` only after each implementation is
  verified.
- Keep application version `0.4.0-dev.0` for these source commits. It must be
  advanced and synchronized before producing a different distributable
  development candidate.
- No R package behavior changes; no R package version bump is planned.
- Keep this document active while installed-app acceptance is NOT RUN. These
  commits make no installer or release-readiness claim.

## Implementation Evidence

### UX-CONTEXT-1

Implemented and verified 2026-08-05. Ordinary non-editable surfaces now cancel
the WebView page context menu, while Monaco, inputs, textareas, selects, and
editable content retain their native/editor ownership. JavaScript syntax, the
focused context-menu contract, workbench hierarchy, usability repairs, browser
right-click review, and `git diff --check` passed. Installed-app acceptance is
NOT RUN. No version bump was made because this is not yet a new distributable
candidate.

The remaining four authorized packages are pending.

### WS2-LINT-CALL-1

Implemented and verified 2026-08-05. The real invocation and browser mock now
share Tauri's `documentVersion` key. The focused test requires that exact call
and rejects the former snake-case top-level argument. JavaScript syntax, Lint
quick-fix contracts, the Rust project-relative/version-bound Lint test, browser
diagnostic and Quick Fix interaction, and `git diff --check` passed. Installed
acceptance is NOT RUN. No application or R package version changed because the
provider response contract is unchanged and this is not a new candidate.

The remaining three authorized packages are pending.

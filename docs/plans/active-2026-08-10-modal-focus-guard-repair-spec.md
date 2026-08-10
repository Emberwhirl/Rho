# Modal Dialog Editor Focus Guard Repair

Status: active; ISSUE-18-EDITOR-1 implementation and automated contract
verification complete 2026-08-10; installed Windows acceptance open

Date: 2026-08-10
Authorization: user requested implementation of GitHub Issue #18 and a pull
request on 2026-08-10
Change class: D1 narrow frontend focus-behavior correction
Risk: R1 local frontend keyboard-focus interaction
Work package: ISSUE-18-EDITOR-1
Owning contract:
`implemented-2026-07-16-wp2-monaco-editor-source-execution-design.md`

## Problem And Reproduction

With a modal dialog open (Model settings, the generic input dialog used by
Create analysis script, or any other `role="dialog"` surface), background
document renders steal keyboard focus from the dialog. The Monaco branch of
`applyDocumentSelection()` unconditionally calls `editor.focus()`, and that
function is reached from paths that do not originate in user interaction with
the editor:

- the Agent poll loop (`syncAgentPolling`, every 1.5 s while a conversation is
  running/waiting or approvals are pending) when an Agent turn applies a file
  edit through `updateDocumentAfterFileEdit()` and `highlightAgentEdit()`;
- the project file watcher when the active document changes on disk and is
  reloaded through `renderActiveDocument()`.

Because dialogs refocus their own fields on render, focus ping-pongs between
the dialog input and the background document. Keystrokes typed while focus was
stolen land in the background document and mutate it.

Regression invariant: while any modal dialog is visible, no document render
takes keyboard focus for the editor; with no dialog visible, document renders
retain the existing editor-focus behavior exactly.

## Contract

- `modalDialogIsOpen()` is the single predicate for "a modal dialog is
  visible", defined as any `[role="dialog"]` element without the `hidden`
  class. The existing `workbenchShortcutOwnedByDialog()` delegates to it and
  keeps its current behavior.
- The Monaco branch of `applyDocumentSelection()` skips only its `focus()`
  call when `modalDialogIsOpen()` is true. Model attachment, read-only state,
  selection, reveal, chrome update, and the basic-editor branch are unchanged
  in both dialog states.
- The basic textarea branch already assigns selection without focusing and is
  not modified.
- Deliberate focus commands (`focusActiveEditor`, editor commands, dialog
  `returnFocus` restoration) are unchanged: they run either from explicit user
  action with no dialog open or from dialog-close paths after the dialog is
  hidden.
- The refactor review dialog remains open across `applyRefactorProposal()`'s
  re-render; with the guard, focus stays inside that dialog instead of being
  stolen and re-taken. Its own focus management is unchanged.
- The LLM provider/model sub-dialogs open only above `#agentLlmDialog`, which
  carries `role="dialog"`, so the predicate covers them without markup
  changes.
- No broker command, execution payload, schema, project identity, approval,
  filesystem, or R-session authority changes.

## Cross-Review

- Implemented WP2 remains authoritative for document rendering, selection, and
  cursor persistence; this repair only conditions its focus acquisition.
- `active-2026-08-10-run-current-line-advance-repair-spec.md` retains
  current-line cursor-transition and focus ownership; its path runs from an
  explicit editor command with no dialog open, so its behavior is unchanged.
- `active-2026-08-04-five-usability-repairs-spec.md` retains ownership of
  explicit Console-tab focus; Console focus paths are not touched.
- Dialog-owned focus traps, `returnFocus` restoration, and the Model settings
  parent-suspension lane keep their existing authority; no dialog code is
  modified.
- No ownership, schema, policy, persistence, or sequencing conflict remains.

## Acceptance And Verification

- A deterministic regression test drives the extracted
  `applyDocumentSelection()` source in both dialog states and proves: focus is
  not taken while a dialog is visible; focus is taken when none is visible;
  selection/reveal/model attachment happen identically in both states; the
  basic-editor branch never focuses; and `workbenchShortcutOwnedByDialog()`
  still reports a visible dialog.
- Run the focused regression, JavaScript syntax, the adjacent editor and
  Model settings contract scripts, and `git diff --check`.
- Installed Windows acceptance (typing into Model settings while an Agent turn
  applies edits) remains a separate gate.

## Version, NEWS, And Stop Point

This PR does not create or distribute a new application candidate. Application
version and `NEWS.md` entry are deferred to the next explicitly authorized
integration candidate. R package versions, schema, and release tooling are
unchanged.

Stop after this one repair, regression evidence, contract review, scoped
commit, and pull request. Do not expand into workbench-wide `inert` dialog
layering or focus-trap redesign.

## Implementation And Review Evidence

`modalDialogIsOpen()` was added beside the shortcut predicate and
`workbenchShortcutOwnedByDialog()` now delegates to it. The Monaco branch of
`applyDocumentSelection()` guards only its `focus()` call. No other statement
changed.

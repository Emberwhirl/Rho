# WS2 Reviewable Rename And Extract Edits

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D2 bounded multi-range editor-buffer refactor workflow
Risk: R2 project-scoped source mutation, document-version binding, reviewable
diff presentation, stale rejection, and browser/mock parity
Work package: WS2-R2
Mandatory stop: after one rename/extract package, complete the frontend/mock
matrix, contract review, NEWS/checklist reconciliation, and an independent
commit

## Problem

Rho can find project references and apply a reviewed one-line lint fix, but it
cannot turn those bounded results into a user-reviewable refactor. Users need a
small, explicit rename flow for a project symbol and a conservative way to
extract a selected block into a function without silently changing files or
assuming semantic scope.

## Goals And Non-Goals

Goals:

- Rename one exact token across the current project using the existing bounded
  References query and an explicit before/after review.
- Extract a whole-line selection in the active R source document into a named
  zero-argument lexical closure and replace the selection with a call.
- Bind every proposed target to the active project, exact source content
  fingerprint, and open-document version when available.
- Apply only to in-memory editor buffers; Save remains a separate explicit user
  action for every changed file.

Non-goals:

- lexical-scope proof, package/dependency renaming, generated-code edits,
  comments/strings, arbitrary text search, semantic parameter inference, or
  automatic save;
- database schema, new Tauri commands, Workspace mutation, Agent policy,
  approval, Git mutation, or a second edit store;
- rename of a file, symbol definitions outside the bounded References result,
  or an extract operation spanning multiple files.

## Authority And Ownership

- Workspace R's existing `editor_find_project_references` response is the only
  source for rename locations. A result that is incomplete or truncated cannot
  be turned into a rename proposal.
- The desktop owns proposal construction, exact text checks, review rendering,
  editor-buffer application, undo grouping, and save-required presentation.
- Existing `project_read_file`, `project_state`, and project-relative containment
  remain the only file read/write authority. No new command or persistence is
  introduced.
- Problems remains diagnostic authority. Agent file-edit Accept remains a
  separate durable proposal lane; this package does not reinterpret Agent
  events or approvals.

## Refactor Contract

### Rename

- The symbol is the token at the editor cursor, or the selected text when it is
  one valid R identifier. A new name must be a non-empty R identifier of at
  most 128 UTF-8 bytes and differ from the old name.
- The desktop captures the active project root before requesting up to 200
  references and rejects a project switch before consuming the response. The
  query must report no `incomplete`, no `truncated`, and at least one exact
  definition/reference. Every location is project-relative, inside the current
  safe file list, and has a positive line/column.
- Each target snapshot records `{path, before, before_fingerprint,
  document_version}`. The generated after text changes only the exact token at
  the returned location and preserves all other bytes. A token mismatch or
  duplicate location rejects proposal construction.

### Extract

- The active document must be an editable R source file. The selection must be
  non-empty, contain complete lines (selection starts at column 1 and ends at
  the final column of a line), be at most 20,000 UTF-8 bytes, and contain no
  nested function declaration or `return`/`break`/`next` control flow. The new
  name must be a valid R identifier that does not already appear in the active
  source.
- The generated edit inserts `name <- function() { ... }` immediately before
  the selected block and replaces the block with `name()`. The selected code
  remains visible in the review; Rho does not claim that assignments or return
  values have equivalent scope semantics.
- The proposal records one target snapshot with the exact before content,
  source range, and document version. It is rejected if the active project,
  file, selection text, or version changes before review acceptance.

### Shared Review And Apply

- A proposal is shown in a dedicated Refactor review panel with operation,
  project-relative file, document revision/fingerprint, exact before/after
  previews, changed-file count, and a clear Save reminder.
- Review offers Cancel, Apply to editor, and Undo for the latest applied
  proposal. Apply revalidates all snapshots and then uses Monaco's one undo
  group or the fallback editor's equivalent. It never calls a project-write
  command. The file tab becomes dirty and explicit Save is required.
- If a target is missing, foreign, dirty in a different way, externally
  changed, or no longer matches its snapshot, the proposal remains unapplied
  and displays a stale/rejected recovery message. Reopen References or make a
  fresh selection to regenerate it.

## Bounds And Failure Rules

- At most 200 reference records, 20 target files, 1 MiB per target, 8 MiB
  total proposal input, and 32 KiB displayed before/after text per target.
- Long text is clipped in the review with an explicit `truncated` marker; it
  never changes the apply content. Invalid JSON, malformed locations, project
  mismatch, file-list mismatch, incomplete/truncated references, and any
  fingerprint mismatch fail closed.
- A failed or cancelled apply leaves every buffer unchanged. A partial
  application is not reported as success; the implementation validates all
  targets before the first edit and uses one logical undo group per proposal.

## UI And Mock Contract

- Editor actions expose `Rename symbol` and `Extract function` with keyboard
  actions in Monaco and equivalent toolbar actions in the fallback editor.
- Loading, empty/invalid selection, review, applied/dirty, stale, cancelled,
  and narrow-window states are explicit. Stored text is rendered with DOM text
  APIs, paths wrap, and the review is keyboard reachable.
- `preview=editor-refactor` provides deterministic rename review, extract
  review, stale rejection, incomplete-reference refusal, and narrow layout
  evidence without writing the real workspace.

## Required Verification

Frontend/mock:

- token-safe rename proposal and exact multi-file preview;
- extract selection validation, generated wrapper/call, save-required dirty
  state, undo, stale project/version/content rejection, incomplete/truncated
  refusal, safe long text, keyboard focus, and narrow-window overflow;
- no `project_write_file`/`project_create_file` call during Apply-to-editor.

Rust/Tauri:

- No command or schema changes. Existing project read/write and reference
  command tests remain green; `cargo fmt --check` and affected Rust suites are
  rerun to prove the boundary stayed unchanged.

Manual acceptance:

- Use `test/acceptance-project/examples/editor-intelligence.R`: rename
  `flag_low_quality` to `flag_low_quality_qc`, review and apply, verify both
  definition/call buffers are dirty, save explicitly, then select the
  `example_value <- ...` block, extract `median_value`, review/apply/save, and
  run the file. Record stale rejection after an intervening edit.

## Version And Lifecycle

- No R package or application version bump is required; this is a frontend
  editor capability inside `0.4.0-dev.0`.
- Root `NEWS.md`, the proposal checklist, `docs/README.md`, and staged manual
  acceptance instructions update only after implementation evidence exists.
- The checklist moves from 11 open / 38 completed to 10 open / 39 completed
  after the package's automated/browser evidence passes. Installed-app/manual
  acceptance remains separate and open.

## Definition Of Done

WS2-R2 reaches its stop when rename and extract proposals are generated from
bounded current-project input, reviewed, safely applied only to editor buffers,
stale and incomplete cases fail closed, undo/save behavior is truthful, the
mock/browser and affected Rust checks pass, documentation is reconciled, and
the package is independently committed.

## Cross-Review

- WS2-R1 retains read-only token discovery and navigation; WS2-R2 consumes its
  bounded result but adds no query or persistence authority.
- WS2-D1 retains single-file diagnostic quick fixes and its exact document
  version checks; WS2-R2 owns multi-location and extract proposal semantics.
- Existing Agent file-edit proposals remain durable Agent-owned edits and do
  not share decisions or undo state with this editor-only lane.
- Git/environment mutations, evidence claims, and project switching remain
  separate authoritative contracts. No ownership, schema, approval, or
  sequencing conflict was found.

## Implementation And Review Evidence

Implementation, contract review, and affected automated/browser verification
completed on 2026-08-03 without adding a Tauri command, schema, durable edit
store, approval, or direct file write:

- F2 and the compact editor actions create a Rename or Extract proposal. Rename
  consumes the existing complete token-aware References result, rejects
  inconsistent counts, and displays two project files/three exact locations in
  the acceptance fixture. Extract accepts only complete R source lines,
  rejects nested functions and non-local control flow, and shows the generated
  zero-argument function/call with an explicit scope warning.
- Each target stores exact source text, a bounded fingerprint, the open Monaco
  document version when present, and the active project root. Project switch,
  changed editor/disk content, closed drafts, missing files, malformed results,
  incomplete/truncated References, file/total byte bounds, and more than 20
  target files fail closed.
- Apply validates every target before the first edit and changes only editor
  models/buffers. The browser preview confirmed that both renamed files become
  dirty while project files remain unsaved, Undo restores both clean buffers,
  and an intervening edit produces a stale error without changing the other
  target. No `project_write_file` or `project_create_file` call exists in the
  apply path.
- `preview=editor-refactor` covers rename, extract, applied, stale, and
  incomplete states. At 1280x720 the 880px review surface showed both files,
  wrapped long source safely, stayed inside the viewport, and produced no
  document-level horizontal overflow. The CSS collapses the diff to one column
  below 680px; installed narrow-window acceptance remains staged separately.

Automated evidence:

- JavaScript syntax and all 14 frontend/mock contract scripts: passed;
- Rust formatting: passed;
- `rho-server`: 32 passed;
- `rho-desktop`: 83 passed;
- `git diff --check`: passed.

Application metadata remains `0.4.0-dev.0`; no R package contract changed, so
no package version bump is required. NEWS, the cross-review matrix, acceptance
fixtures, and the checklist are reconciled to 10 open / 39 completed. This
contract remains active because installed-app/manual acceptance is still open.

# Problems To Agent Repair Entry

Status: active implementation contract

Date: 2026-08-07; amended 2026-08-08
Authorization: user approved implementation of GitHub Issue #6 after review and
explicitly authorized its complete resolution on 2026-08-08
Change class: D3 cross-module execution diagnostics, durable schema, typed Agent
task routing, editor identity, and reviewable repair workflow
Risk: R3 migration/recovery, execution provenance, project isolation, Agent
credential routing, proposal review, and browser/mock parity
Work package: PROBLEMS-AGENT-REPAIR-2 (PROBLEMS-AGENT-REPAIR-1 is historical)
Mandatory stop: complete one vertical diagnostic-to-proposal slice, pass the
schema/R/runtime/frontend recovery matrix, cross-review the implementation and
version impact, then stop before automatic execution, automatic file mutation,
fuzzy source inference, or any broader credential authority.

## Problem And Invariant

Problems can locate a source error, but the current Agent entry only copies the
message into a new prompt. A repair request must preserve the known project,
source path, source range, diagnostic text, and bounded nearby source without
requiring the user to retype the error or manually create a selection.

## Scope And Ownership

- Problems owns the visible `Fix with Agent` entry and actionable unavailable
  states.
- The frontend owns opening/revealing the source and constructing additive
  diagnostic context inside the existing `editor_context` payload.
- The existing Agent coordinator and `propose_file_edit` tool remain the
  authority for model behavior and reviewable file proposals.
- Existing Accept/Reject, stale-content, project containment, and Act
  authorization rules remain unchanged. This package never writes files or
  executes R code automatically.

## User Contract

For a file-backed Problem with a valid source path, `Fix with Agent` opens the
file, reveals its line/column when available, switches to Agent Direct, and
starts a repair-oriented prompt. The prompt asks for diagnosis plus one
reviewable file proposal when a code change is appropriate. The selected Agent
policy lane is preserved, but the action does not grant authorization.

The context includes a bounded `diagnostic` object with source path, line and
column range, message, call, origin, severity, run linkage, and nearby source
anchors. The existing editor selection remains an optional convenience; the
diagnostic range is authoritative context and is not itself an approval.

For Console Problems, the action switches to Agent with the structured error
context and explains that no file location is available. For missing/virtual
sources, the UI shows a concrete next step and does not submit a misleading
repair task.

## Bounds And Failure

- Diagnostic text and source excerpts use the existing editor-context bounds.
- Paths remain project-relative and must belong to the active project.
- A project switch or changed document makes proposal acceptance fail through
  the existing stale guards.
- Missing line/range is allowed for explanation, but the Agent must not be
  told that a precise replacement range exists.

## Work Package And Tests

1. Add the Problems repair action and source/console/unavailable states.
2. Add additive diagnostic context construction and prompt handoff.
3. Preserve editor location without requiring a non-empty manual selection.
4. Extend browser/mock fixtures and frontend contract tests for success,
   missing source, console errors, stale context, and two-project isolation.

## Acceptance And Definition Of Done

- One click from a file-backed Problem creates an Agent repair task with the
  exact structured diagnostic context.
- The Agent can produce the existing reviewable file proposal without a manual
  selection when the source range is known.
- Problems, Agent, and editor remain in the expected surface and focus states.
- No new command, approval table, automatic save, execution, or persistence
  schema is introduced.
- JavaScript syntax, frontend contract tests, mock parity, and affected Rust
  tests pass; NEWS/version impact is recorded after evidence.

## Implementation Evidence

Implemented 2026-08-07. Problems now exposes `Fix with Agent` for file-backed
and Console errors. File-backed entries open and reveal the source, select a
bounded diagnostic range as a convenience, attach an additive diagnostic
object to `editor_context`, and submit the existing Agent task flow. Missing
and virtual sources fail with an actionable message. The coordinator system
prompt now explains how to use diagnostic context without weakening proposal
review or authorization.

Verified with JavaScript syntax checks, Agent-first/Problems/Lint/Outputs/UI
contract checks, `rho-server` format checks, and all 47 `rho-server` tests.
Browser-installed acceptance and manual proposal review remain open.

## PROBLEMS-AGENT-REPAIR-2 Authorized Correction

R2 supersedes only R1's historical statement that no persistence schema was
needed. The schema-v10 range fields below are required diagnostic provenance;
R1's no-automatic-execution, no-automatic-save, and reviewed-proposal
boundaries remain unchanged.

### Reproduced Gaps

The 2026-08-08 review of the real implementation found that R1 met only the UI
entry portion of Issue #6:

1. durable Workspace R `ProblemSummary` records have no line/column range;
2. the browser fixture manually adds `line_number = 2`, so it does not represent
   installed-app behavior;
3. a file Problem without a range opens with an empty selection, while the
   existing `replace_selection` proposal operation rejects an empty selection;
4. `Fix with Agent` preserves the ordinary Ask route, which may legitimately use
   a chat-only model with no `function_call` capability;
5. the diagnostic omits durable traceback and the exact failed run input/output,
   so Console repair lacks the context named by the Issue; and
6. source loading, run-detail loading, and project switching are not bound into
   one stale-safe repair preparation step.

R2 corrects these causes rather than adding another prompt instruction.

### Durable Diagnostic Range Contract

Workspace execution accepts an optional `source_range` describing where the
submitted code came from in its source document. It contains positive,
one-based `start_line`, `start_column`, `end_line`, and exclusive
`end_column`. The Tauri boundary rejects partial, inverted, zero, or excessive
coordinates. Console/virtual requests may omit the range.

`rho_execute()` captures the `srcref` of the exact top-level expression being
evaluated. On an evaluation error it returns a complete relative expression
range or no range; it never derives a location from message text, call text, or
a filename substring. The coordinator translates a complete relative range
through the admitted execution `source_range`, verifies that it remains inside
that range, and persists it only for a real project file.

Schema v10 adds nullable run columns:

```text
error_start_line, error_start_column,
error_end_line, error_end_column,
error_range_kind
```

`error_range_kind` is `r_expression` for this package. All five fields are
written or cleared together. Historical v7/v8/v9 rows remain null; migration
must not guess or backfill a location. The v9-to-v10 transition uses the
existing same-directory backup, one transaction, schema assertion, rollback,
and reopen rules. Supported v7/v8 migrations produce the same current schema.
A failed migration leaves the previous database and backup reopenable and does
not start the application against a partial schema.

The project-scoped Problems query exposes the five fields as the existing UI
names `line_number`, `column_number`, `end_line_number`,
`end_column_number`, and `range_kind`. A query cannot return another project's
diagnostic. Malformed or partial stored coordinates project as no range instead
of a guessed or partial range.

### Typed Repair Route And Least Privilege

The frontend sends the closed task kind `problem_repair`; it cannot request an
arbitrary capability route. Rust maps that kind to the effective `agent.act`
route because file proposals require `function_call=yes`, while the Agent mode
is forced to `ask` and `auto_approve=false`. Thus the repair child receives
exactly the one credential for the effective tool-capable route, may inspect
read-only context and call `propose_file_edit`, but cannot execute Workspace R
or acquire Act-session mutation authority.

Ordinary Ask/Plan/Act behavior is unchanged. A missing, unknown, incompatible,
disabled, or credential-unready effective `agent.act` route blocks repair
before a turn is created. The UI explains the exact reason and links directly
to the `agent.act` card in Model routing. There is no Provider fallback, prompt
classification, second credential, or invented `agent.repair` persistence
route. Turn evidence records `task_kind=problem_repair` and the resolved
`capability_route`.

### Repair Preparation And Context

For a current file-backed diagnostic with a complete range, Rho:

1. captures the active project root and refresh sequence;
2. loads the exact run detail through the existing project-scoped command when
   the run is durable;
3. opens the exact project-relative source and verifies project identity,
   document version, and range bounds after every asynchronous boundary;
4. selects the diagnostic expression without user selection;
5. constructs bounded `diagnostic` and `run_context` values; and
6. starts one read-only `problem_repair` Agent turn that asks for at most one
   existing reviewable file proposal.

The diagnostic includes source/range, range kind, message, call, bounded
traceback, origin, severity, run ID, and execution mode. `run_context` includes
bounded executed code, stdout, value, messages, and warnings from that same run
only. It never copies an unbounded Console DOM transcript or a different run.
Credential redaction remains coordinator-owned.

A document-version mismatch, project switch, missing file, invalid range,
missing durable run, or run-detail failure creates no Agent turn and leaves the
current source unchanged. The UI gives a recovery action: rerun the current
selection/file to refresh the diagnostic, restore/open the missing source,
refresh Problems, or retry after the Provider connection is repaired.

Console Problems may start a read-only repair/diagnosis turn with bounded exact
run context but cannot promise a file proposal. File Problems with no durable
exact range expose `Select code for Agent`: the first action opens the source
and names the required recovery step; after the user creates a non-empty
selection in that same file, the same action may start the typed repair task
with an ephemeral `range_kind=user_selection` diagnostic. This fallback is
explicit user input, is never persisted as an R-derived location, and cannot
silently select a line or whole file. `Run again` remains available when it can
produce a fresh runtime range, but is not represented as the only recovery for
parse failures.

### Mutation And Proposal Boundaries

- R2 adds no automatic save, file write, R execution, approval, or
  auto-acceptance.
- `propose_file_edit` and the existing Accept/Reject/Undo/stale-anchor contract
  remain the only file-edit authority.
- The diagnostic range is context, not authorization. Proposal acceptance
  still compares exact path, selection, anchors, document content, project,
  workspace, and revision evidence.
- R2 does not add semantic patching, fuzzy line matching, multi-file edits, or
  automatic retry.

### R2 Validation Matrix

The work package is not complete until evidence covers:

- R bridge: single-line and multiline expression ranges, selection-relative
  ranges, parse errors with no guessed range, and bounds;
- store: empty v10 bootstrap, v9 migration/backup/reopen, injected rollback and
  recovery, supported v7/v8 migration, complete/partial/malformed range
  projection, and two-project isolation;
- coordinator/Tauri: coordinate admission and translation, out-of-scope range
  rejection, no range on kernel/result failures, and retry preservation;
- model routing: explicit Act route, compatible chat inheritance, chat-only and
  unknown rejection, credential failure, per-turn override rejection, exact
  route attribution, and one-credential isolation;
- frontend/mock: exact file selection, no manual selection, bounded traceback
  and run context, Console path, historical-no-range recovery, missing file,
  explicit-selection fallback, stale document, project switch during
  preparation, settings deep link, failed request recovery, and two-project
  isolation;
- existing proposal: review, rejection, stale acceptance, failure, recovery,
  and no file change before explicit acceptance;
- JavaScript syntax, R package tests, affected Rust crates, frontend contract
  scripts, deterministic browser evidence, formatting/lint, and installed-app
  manual acceptance on the exact candidate.

After the affected matrix passes, this user-visible application behavior uses
the next unused development candidate identity, updates `NEWS.md`, and creates
a separate candidate checklist. A tag, GitHub Release, notarized distribution,
or automatic Issue closure remains outside this work package.

## R2 Implementation And Review Evidence — 2026-08-08

PROBLEMS-AGENT-REPAIR-2 is implemented at application identity
`0.4.0-dev.20`; the changed `rho.bridge` result contract independently advances
to `0.1.12`. Workspace execution now admits exact source coordinates, the R
bridge reports only parsed top-level expression ranges, the coordinator
translates R character columns to editor UTF-16 positions, and store schema
v10 persists/project-scopes the complete range atomically. Kernel/result
failures and parse failures remain unlocated, while retries preserve the
original admitted source range.

The closed `problem_repair` task resolves the effective tool-capable Act route
but runs under Ask policy with `auto_approve=false` and exactly that route's one
credential. Problems binds the active project, exact failed run, bounded
traceback/output, current source, and diagnostic range before creating a turn.
Known ranges select the failed expression automatically; Console diagnostics
stay diagnosis-only; missing-range file diagnostics require an explicit
same-file user selection. Explain and Repair remain separate actions. No
source changes before an existing proposal is explicitly accepted.

One contract wording was corrected during review. A durable selection run may
be reopened after an application restart, when an in-memory editor version
counter is no longer comparable. For that case the implementation verifies the
exact failed selection reconstructed from stored executed code and source
range; a file-mode run additionally verifies the complete executed file text.
Non-durable lint diagnostics retain their document-version check, and proposal
Accept retains the existing exact-content/anchor/project/revision stale guard.
This is stricter and recoverable without inventing a cross-restart document
version.

Final reviewed evidence, including the full Rust workspace/all-target gate,
includes 535
`rho.bridge`, 97 `rho-store`, 51 `rho-server`, and 151 `rho-desktop` passing
tests plus one pre-existing opt-in Keychain smoke ignored. All 44 frontend
contract scripts and JavaScript syntax pass. Deterministic Chromium review at
`1440 x 900` proves automatic `summary(qc)` selection, one Ask repair turn,
reviewable `replace_selection`, same-run Console context, explicit-selection
fallback, route deep link, stale/foreign/failure/project-switch guards, no page
errors or overflow, and no file change before Accept.

Tauri CLI 2.11.4 produced an unsigned arm64 app and
`Rho_0.4.0-dev.20_aarch64.dmg`. `hdiutil verify`, app/Ark arm64 checks, version
`0.4.0-dev.20`, macOS 14.0 minimum, and read-only mounted-DMG Workspace smoke
pass. The final post-format DMG is 21,224,710 bytes with SHA-256
`9f011b15ab90c792ac177c3c0a87b530d8f92279fd77c1d9e362645ba11073ca`.
No real Provider request or credential was used. Owner-installed repair
acceptance, signing, notarization, authoritative assets, MAC5, and publication
remain separate `NOT RUN` gates.

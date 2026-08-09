# Problems To Agent Repair Entry

Status: active; R5 implementation and complete affected automated/browser
verification pass; `dev.23` is historical superseded before artifact
production; exact combined `dev.24` artifact and installed acceptance open

Date: 2026-08-07; amended 2026-08-08
Authorization: user approved implementation of GitHub Issue #6 after review and
explicitly authorized its complete resolution on 2026-08-08
Change class: D3 cross-module execution diagnostics, durable schema, typed Agent
task routing, editor identity, and reviewable repair workflow
Risk: R3 migration/recovery, execution provenance, project isolation, Agent
credential routing, proposal review, and browser/mock parity
Work package: PROBLEMS-AGENT-REPAIR-5 (R1 is historical; R2-R4 are implemented
but their distributed candidate identities were rejected)
Mandatory stop: admit only a strictly validated parser-token range, complete
and recoverably migrate store schema v11, pass the focused/complete R, Rust,
frontend, and deterministic browser matrix, cross-review the implementation
and replacement-version impact, then stop before automatic Provider dispatch,
automatic execution, automatic file mutation, fuzzy source inference, or any
broader credential authority.

## Problem And Invariant

Problems can locate a source error, but the current Agent entry only copies the
message into a new prompt. A repair request must preserve the known project,
source path, source range, diagnostic text, and bounded nearby source without
requiring the user to retype the error or manually create a selection.

## Scope And Ownership

- Problems owns the durable diagnostic list; the execution Console owns the
  visible error-site `Fix with Agent` entry. Both surfaces share one repair
  action and actionable unavailable states.
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

## PROBLEMS-AGENT-REPAIR-3 Installed Acceptance Correction — 2026-08-08

The owner-installed `0.4.0-dev.20` candidate rejects the R2 acceptance gate.
The submitted task was correctly typed as `problem_repair`, bound to the exact
file range and failed run, resolved the effective `agent.act` route, and kept
Ask policy. It then failed before any Provider request with:

```text
Runtime capability route does not match the effective model.
```

The installed evidence identifies a runtime-reference defect rather than a
diagnostic-location or task-policy defect. Rust records a registered Provider
route with its canonical model reference (for example
`deepseek:deepseek-v4-flash`), while Agent R constructs the one-credential
Provider under an ephemeral internal alias and returns that alias as the
runtime model. Exact route validation then rejects the two names before the
session starts.

PROBLEMS-AGENT-REPAIR-3 is authorized as a D3/R3 corrective slice with these
invariants:

- Ask/Plan/Act remains the behavioral policy lane. A `problem_repair` task
  continues to use Ask policy with `auto_approve=false` while resolving the
  tool-capable `agent.act` route; policy does not select or rename a model.
- A registered Provider profile has one canonical Provider/model reference.
  The isolated Agent R process must register the credential-bound reviewed
  Provider at that same canonical Provider ID and resolve the exact route
  model. It must not introduce a second effective name, Provider fallback, or
  ambient credential lookup.
- Generic/custom Provider profiles retain their explicit per-profile runtime
  Provider ID. The change must not collapse distinct custom connections or
  change their Base URL behavior.
- The route capability, route model, profile Provider/model fields, and tool
  capability are validated together before `ChatSession` creation. A mismatch
  still fails closed before a Provider request.
- The existing single system-store credential projection is unchanged. Tests
  use a disposable value and no live Provider request.

Regression evidence must execute the same registered-Provider startup path as
the desktop child, including reviewed `aisdk.providers` construction,
registration, model resolution, capability-route normalization, and session
creation. It must cover Ask policy plus `agent.act`, canonical mismatch
rejection, custom-Provider isolation, and absence of network calls. A Rust
contract test must keep the generated child sequence and route attribution
explicit.

The one-click Problems entry remains the authorized automatic handoff: after
the user selects `Fix with Agent`, Rho prepares the exact context and starts the
typed repair task without another selection or confirmation. This correction
does not authorize an unsolicited Provider request for every R error, automatic
R execution, automatic proposal acceptance, or file mutation.

Because the exact installed `dev.20` identity failed, it is historical and
must not be rebuilt or relabeled. After the corrective matrix passes, the
application advances to `0.4.0-dev.21`; `rho.agent` advances independently
because its runtime Provider-resolution contract changes. Installed/live-
Provider acceptance remains open on that exact replacement artifact.

## PROBLEMS-AGENT-REPAIR-4 Console Error-Site Entry Correction — 2026-08-08

The owner rejected the remaining navigation gap after reviewing the corrective
flow: a newly failed R execution renders only red text at the Console error
site, while the repair action exists exclusively under the separate Problems
tab. Requiring the user to discover and switch to Problems is not a direct
error-to-repair workflow even when the same durable failed run and exact source
range already exist.

The owner's 2026-08-08 direction explicitly authorizes this bounded D2/R2
desktop correction. The previous `0.4.0-dev.21` DMG was already handed off and
cannot be rebuilt or relabelled; the corrected distributable identity advances
to the next unused development candidate. No R package contract changes.

### Error-Site Contract

- A non-render Workspace R failure with a durable execution ID renders one
  structured Console error entry containing the error text and an adjacent
  repair action. The user does not need to open Problems first.
- The Console action waits for the next successful project-scoped Problems
  refresh and resolves only the Problem whose complete run ID matches the
  error entry. It must not start from the incomplete transient UI copy.
- Once resolved, Console and Problems use the same action-state helper and the
  same `fixProblemWithAgent()` path: `Fix with Agent` for a ready exact range,
  `Select code for Agent` for the explicit no-range recovery, or `Set up Agent
  repair` when the effective route is unavailable.
- Clicking the ready Console action directly prepares and starts the existing
  typed Ask `problem_repair` turn with the same exact failed run, source range,
  project, credential route, and proposal boundaries. It does not navigate
  through Problems and does not add a second confirmation.
- While durable context is loading the action is visibly disabled. If refresh
  completes without matching durable context, the entry offers a bounded retry
  and then tells the user to rerun the code; it never submits partial context.
- Each entry captures the active project root and project refresh generation.
  A project switch permanently disables the old action as previous-project
  evidence. Late refreshes and duplicate clicks cannot start a foreign or
  second repair turn.
- Connection/startup failures, arbitrary stderr stream events, and render-job
  failures without an admitted durable R Problem remain plain errors; Rho must
  not offer a misleading source repair action for them.
- The structured row and button are keyboard reachable, have explicit
  accessible labels/status text, wrap at the supported narrow width, and do
  not overlap the Console prompt.

### Regression And Acceptance Matrix

- Static/frontend contract: `renderExecution()` creates the structured action
  for both explicit and generic non-render execution failures; ordinary output,
  stream stderr, render failures, and invoke failures do not gain the action.
- Durable binding: the action is disabled before refresh, enables only after an
  exact full run-ID match, calls the shared Problems repair helper, and passes
  the same exact diagnostic/run context without changing source before Accept.
- Failure/recovery: missing durable context, failed refresh, duplicate click,
  route setup, explicit selection, and rerun recovery remain truthful.
- Isolation: a captured project switch and a late old-project refresh leave the
  old action disabled and create no Agent turn.
- Browser/mock parity: desktop and narrow viewports show the action beside the
  error, no prompt overlap or horizontal overflow, no page errors, and one
  direct Console click creates exactly one typed repair turn.
- Run JavaScript syntax, the focused Console/Problems contracts, all frontend
  contract scripts, affected Rust/R regression suites, formatting, and the
  exact replacement app/DMG smoke before installed handoff.

R4 adds no command, schema, persistence, network, credential, approval,
automatic Provider request, R execution, proposal acceptance, or file mutation
authority. Problems remains the durable history/detail surface; Console is an
additional direct entry into the same accepted repair workflow.

### R4 Implementation And Contract Review — 2026-08-08

The reviewed implementation follows the R4 contract without deviation:

- `renderExecution()` projects non-render failures with execution IDs into a
  structured Console row. Plain render, stream, startup/connection, and invoke
  errors retain their existing non-repair presentation.
- Each Console row captures project identity and the next Problems refresh
  request. Only a successful, non-stale refresh with the exact complete run ID
  can bind its durable Problem. Concurrent older responses are rejected.
- Console and Problems call one `problemRepairActionState()` /
  `configureProblemRepairButton()` path and one `fixProblemWithAgent()` path.
  Missing range and route states remain truthful, and no path forces a switch
  through Problems.
- Busy state prevents duplicate dispatch. Refresh failure and missing context
  have bounded recovery; project-sequence mismatch permanently disables the
  old action. Live entries are bounded to 100 and older actions expire closed.

JavaScript syntax, all 45 frontend contract scripts, `rho.agent` (120),
`rho.bridge` (535), complete Rust workspace/all-target tests, and Rust
formatting pass. The Rust matrix includes `rho-store` 97, `rho-server` 52, and
`rho-desktop` 151 passed with only its existing opt-in Keychain smoke ignored.
Deterministic Chromium review passes at `1440 x 900` and `800 x 900`: one
Console click creates exactly one typed Ask `problem_repair` turn with matching
run/diagnostic IDs and exact `r_expression` range; source remains unchanged;
Problems is not opened; refresh failure recovers; missing context exhausts to
rerun; project switch disables the old action; no layout overlap, horizontal
overflow, or page errors occur.

Because the handed-off `dev.21` identity is immutable, user-visible R4 behavior
advances the synchronized application and workflow defaults to
`0.4.0-dev.22`; `NEWS.md` and the active exact-candidate checklist are updated.
No R package contract changes, so `rho.agent` remains `0.1.5` and `rho.bridge`
remains `0.1.12`. From exact clean source commit
`2b5809151a154c0ca35c092f2e53dd7e064ab11b`, Tauri CLI `2.11.4` produced the
21,224,605-byte local unsigned arm64 `Rho_0.4.0-dev.22_aarch64.dmg` with
SHA-256
`6550ebd87d1def65c317eeb9e8de12077c39cfa3c0b3ae00bee8dea7df0e0c50`.
`hdiutil verify`, bundle/version/architecture inspection, and complete mounted
Workspace smoke passed. Owner-installed/live-Provider acceptance remains a
separate open gate.

## PROBLEMS-AGENT-REPAIR-5 Parser-Token Correction — 2026-08-08

The owner rejected the exact `dev.22` artifact during workflow acceptance. A
file-mode execution carried project source `scatter_plot_example.R`, document
version 2, and admitted source range `1:1-39:1`. R's parser reported
`<text>:23:46` for the full-width comma in `runif(34, 0, 10，)`, but
`rho_execute()` returned no structured range because R2 deliberately prohibited
all message-derived positions. The durable run therefore had null range fields;
Console bound the correct run but showed `Select code for Agent`, and its
`Exact failed run ready` status did not disclose that the range was missing.

This fails the established invariant that a known file location must not ask
the user to find or select the same code again. It is not a Provider, route, or
project-binding failure. The whole file failed in `parse()` before evaluation,
which also truthfully left the Workspace empty.

The owner's 2026-08-08 approval explicitly authorizes this bounded R5 D3/R3
correction, schema-v11 migration, replacement application/package versions,
full affected verification, one local unsigned arm64 app/DMG, commit, and source
push. It does not authorize automatic Provider dispatch, R execution, file
mutation, signed/notarized or hosted candidates, MAC5, or publication.

### Parser Location Admission

R2's default remains: ordinary error message, call, filename substring, and
traceback text cannot create a source range. R5 adds one closed exception at
the component that invoked `parse(text=...)`:

1. `rho_execute()` distinguishes a failure raised by that exact parse phase
   from evaluation/runtime failures before attaching any location.
2. It inspects at most the first 128 characters of the parse condition message
   and accepts only the anchored ASCII grammar
   `^<text>:([1-9][0-9]{0,7}):([1-9][0-9]{0,6}):`.
3. Parsed coordinates must remain within 10,000,000 lines and 1,000,000
   columns, name an existing line, and point at an actual Unicode scalar in the
   normalized submitted code. A position after the last scalar is EOF, not a
   token.
4. The bridge returns the one-scalar exclusive range and closed
   `range_kind=r_parse_token`. It does not infer a surrounding expression,
   token length, replacement, filename, or edit.
5. Zero, leading-zero, overflow, malformed/unanchored, wrong virtual label,
   absent line, after-line/EOF, invalid-string, or non-parse input returns no
   range and preserves the explicit-selection fallback.

The prefix is parser-owned location metadata embedded in R's only parse-error
condition representation. Admission is not based on localized reason text such
as `unexpected input`. The submitted code is the independent validation source.

### Coordinator And Durable Store Contract

The coordinator accepts only `r_expression` and `r_parse_token` from the bridge.
It retains the existing real project-relative source requirement, complete
admitted execution range, coordinate bounds, R-character-to-editor-UTF-16
translation, and containment checks. A virtual/Console source, unknown kind,
partial range, position outside submitted code/source, or malformed result
persists no range.

Store schema v11 changes only the closed `runs.error_range_kind` constraint to
allow `r_expression` or `r_parse_token`. All five range fields remain all-or-none
at the Rust validation boundary. The v10-to-v11 transition:

- creates a same-directory SQLite backup before mutation;
- rebuilds `runs` and its project/start index in one transaction because SQLite
  cannot alter the existing CHECK constraint in place;
- copies every existing column without deriving or backfilling any historical
  range, and preserves valid historical `r_expression` values byte-for-byte;
- asserts the new constraint and current schema before accepting the database;
- rolls back on injected/copy/assertion failure, leaves schema v10 reopenable,
  and permits a later clean recovery from the untouched source plus backup;
- keeps the existing supported v7/v8/v9 upgrade paths converging on schema v11
  without guessing parse locations.

Unknown range kinds are rejected on write and project as no range if malformed
historical data bypasses normal constraints. Project-scoped Problems queries
and two-project isolation remain unchanged.

### Console, Problems, And Repair Behavior

A complete file-backed `r_parse_token` is an exact diagnostic range for repair
preparation. Console and Problems show `Fix with Agent`, open the recorded
project file, select exactly the invalid scalar, validate that scalar against
the exact stored run code and submitted source range, and start at most one
existing typed read-only Ask `problem_repair` turn. The diagnostic preserves
`range_kind=r_parse_token`; the prompt calls it an exact diagnostic range, not
an R expression.

When a bound file run has no exact range, the action remains `Select code for
Agent`, but Console status must say that the failed run is ready and the source
range is unavailable. It must not say only `Exact failed run ready`. EOF and
ambiguous parse failures remain in this truthful fallback.

No action auto-sends a Provider request before the user's click, automatically
runs R, accepts a proposal, saves a document, performs fuzzy source matching,
or mutates a file. Existing duplicate-click, stale-document, source-content,
late-refresh, project-switch, route/credential, proposal Accept/Reject/Undo,
and one-credential guards remain authoritative.

### Regression And Acceptance Matrix

- R bridge: the full-width-comma reproduction produces exactly the offending
  scalar range and `r_parse_token`; ASCII and supplementary Unicode positions
  remain character-based; evaluation errors remain `r_expression`; EOF,
  empty-last-line, malformed/leading-zero/oversized prefix, wrong label,
  missing line, past-line column, and non-parse errors produce no parse token.
- Coordinator: both closed kinds translate through file and selection source
  offsets into UTF-16; Unicode token width is exact; unknown/absent kind,
  virtual/absolute/traversal source, partial coordinates, source underflow/
  overflow, and result outside admitted range are rejected.
- Store: empty schema-v11 bootstrap; v7/v8/v9/v10 upgrade; v10 backup and
  all-column copy; existing expression-range preservation; no parse backfill;
  valid parse-token write/read; unknown-kind rejection; injected rollback,
  reopen/recovery, idempotency, current-schema assertion, and two-project
  isolation.
- Frontend/mock: parse-token Problems and direct Console actions both show
  `Fix with Agent`, select the exact scalar, and create one typed turn with the
  exact run/range/kind; Console does not open Problems; file remains unchanged;
  no-range status is explicit; duplicate, stale source, failed refresh,
  missing context, route setup, late response, and project switch remain closed.
- Run JavaScript syntax, every frontend contract, `rho.bridge`, affected Rust
  crate tests, the complete Rust workspace/all-target matrix, Rust formatting,
  deterministic `1440 x 900` and `800 x 900` browser review, and the exact
  replacement app/DMG mounted smoke before installed handoff.

### R5 Implementation And Automated Evidence

The reviewed implementation follows the R5 contract without deviation:

- `rho_execute()` marks its exact top-level parse phase and admits only the
  bounded anchored `<text>:line:column:` prefix after validating that the
  coordinate names a submitted Unicode scalar. Evaluation keeps the prior
  expression `srcref`; EOF and all untrusted shapes remain unlocated.
- The coordinator accepts only the paired `parse/r_parse_token` and
  `evaluation/r_expression` results, translates character columns to UTF-16,
  contains the result in the admitted project source, and persists the closed
  kind. Store schema v11 rebuilds v10 transactionally after backup, performs no
  historical parse backfill, and recovers after injected failure.
- Console and Problems accept both exact kinds through their shared action
  state. The direct Console row distinguishes exact-range readiness from the
  truthful no-range fallback; neither route auto-runs R, auto-sends a Provider
  request, accepts a proposal, saves, or mutates the source file.

All 45 fail-fast frontend contract scripts and JavaScript syntax pass.
`rho.bridge` passes 97 test blocks / 568 expectations, `rho.agent` passes 24 /
120, and the complete Rust workspace/all-target matrix passes 325 tests with
zero failures and one existing opt-in Keychain smoke ignored. Rust formatting
and `git diff --check` pass. Focused store migration/recovery tests pass all 100
cases, including v10 rollback/reopen and two-project range isolation.

Deterministic Chromium review passes at exact `1440 x 900` and `800 x 900`
viewports with no page exceptions, overlap, or horizontal overflow. Console
shows `Fix with Agent`; one direct click selects exactly `，`, preserves
`r_parse_token` at `2:11-2:12`, binds the same run and diagnostic IDs, creates
one read-only Ask `problem_repair` turn, does not open Problems, and leaves the
source unchanged before Accept. Problems independently selects exactly `，` at
`1:13-1:14` with the same kind and one turn. Duplicate, failed/missing refresh,
route, project-switch, stale-source, and manual-selection recovery probes remain
closed. Exact local app/DMG smoke and owner-installed/live-Provider acceptance
remain separate open gates.

### Version And Release Impact

The installed `dev.22` identity, artifact, hash, and acceptance ledger are
immutable historical NO-GO evidence. R5 advances the synchronized application,
workflow defaults, browser mock, and cache-busting identity to
`0.4.0-dev.23`. The additive R bridge error result and parser-range contract
advances `rho.bridge` independently from `0.1.12` to `0.1.13`; `rho.agent`
remains `0.1.5`. Store schema advances from 10 to 11. `NEWS.md`, the active
candidate checklist, macOS support handoff, roadmap, and cross-review matrix
must remain synchronized.

Issue #9 was authorized after the R5 source checkpoint and before an exact
`dev.23` artifact was produced. The single-use `dev.23` application identity is
therefore historical superseded evidence, and the live combined application
identity advances to `dev.24`. R5 behavior is carried forward unchanged;
`rho.bridge 0.1.13`, `rho.agent 0.1.5`, and schema 11 do not advance. No
`dev.23` artifact or installed-acceptance result may be created or relabelled,
and the active `dev.24` checklist owns the remaining exact-candidate gates.

The reviewed R5 implementation and complete affected automation/browser
evidence pass. Its exact clean-source local unsigned arm64 artifact was not run
before the successor source change and remains an open combined `dev.24`
candidate gate. Owner-installed/live-Provider acceptance remains separate. No tag,
Release/draft, Developer ID signing, notarization, staple, Gatekeeper candidate,
MAC5, Pages, update publication, or release GO is authorized.

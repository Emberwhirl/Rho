# Workbench Focus And Refresh Stability Repair

Status: active; ISSUE-33-INTERACTION-1 authorized 2026-08-11; source
implementation, automated verification, and post-verification contract review
complete; exact hosted source matrix and upstream source integration complete
at `1b3f522`; replacement-candidate browser/mock and exact installed macOS
interaction pass; EDITOR-VIEWPORT-R1 implementation, full frontend validation,
Apple Silicon local build, and installed local verification complete
2026-08-12; user acceptance complete 2026-08-12; installed Windows acceptance
open

Date: 2026-08-11
Authorization: user requested verification and repair of GitHub Issue #33 on
2026-08-11
Change class: D3 workbench-wide interaction-policy correction
Risk: R3 keyboard/pointer focus and accidental source-mutation safety
Work package: ISSUE-33-INTERACTION-1
Owning contracts:
`implemented-2026-07-16-wp2-monaco-editor-source-execution-design.md`,
`active-2026-08-03-agent-first-adaptive-work-surface-spec.md`, and
`active-2026-08-04-five-usability-repairs-spec.md`

## Verified Problem And Reproduction

GitHub Issue #33 reports four related failures in `0.4.0-dev.28` on Windows:

1. Agent and Run polling replaces volatile panel DOM every 1.5 seconds, while
   Environment and render-job refreshes run at one- and two-second intervals.
   Focused controls inside Project files and tabs, Agent activity, Task Rail,
   Runs, Problems, Plots, Environment, and Git review are destroyed and focus
   falls back to the document body.
2. If replacement occurs between pointer down and the native click, the click
   target is removed and the intended action is lost.
3. background Agent file application, external clean-file reload, and source
   execution completion call unconditional focus paths. Keystrokes intended
   for the Agent composer can then mutate source or land in the Console.
4. Console, Logs, and Agent activity force the viewport to the newest item
   even after the user has scrolled up to inspect earlier evidence. Unchanged
   Run/Plot/Environment projections are rebuilt and visibly flicker.

Static inspection reproduces each cause in `desktop/dist/app.js`:
`loadAgentData()` and `loadRunData()` unconditionally call destructive render
functions; `renderAgentTimeline()`, `renderRuns()`, `renderProblems()`,
`renderPlots()`, and `renderEnvironment()` replace their child nodes;
`applyDocumentSelection()` focuses Monaco by default;
`updateDocumentAfterFileEdit()` makes the edited document active;
`executeCode()` focuses Console after non-line execution; and append helpers
unconditionally scroll their panels to the end.

Regression invariant: background refresh may update truthful data, but it may
not revoke a newer user-owned focus, activation, selection, or reading
position. Only an explicit user command may transfer focus between workbench
surfaces.

## Contract

### Volatile panel refresh

- Project files and document tabs, Agent activity, Task Rail, Runs, Problems,
  Plot/Output history, Environment, and Git review use one interaction-safe
  render boundary.
- A semantic projection signature suppresses replacement when the visible
  state is unchanged. Signatures must use bounded identity/metadata and must
  not repeatedly stringify full Plot or Artifact payloads.
- Before a required replacement, the boundary captures each surface's scroll
  position and the active descendant's stable focus key. After replacement it
  restores the exact surviving control with `preventScroll`, then restores the
  viewport. If the entity disappeared, focus moves to a surviving control for
  the same surface or to a programmatically focusable surface fallback; it
  must not be redirected to the editor, Console, or body.
- Pointer activation and Enter/Space keyboard activation form transactions.
  A refresh that reaches the same surface between down and up is reduced to
  the latest requested render and runs only after the native activation has
  completed. This rule must not delay data mutation or broker truth; it delays
  presentation replacement only.
- Every recreated interactive control has a deterministic focus key. An
  Environment object row is a real keyboard-operable button, not a click-only
  `div`.

### Focus authority

- Document rendering takes an explicit `focusEditor` intent. Direct file-tab,
  source-navigation, editor-command, and manual Agent-accept actions may pass
  true. Agent automatic application, external clean-file reload, polling,
  session/background hydration, and other background refresh paths pass
  false.
- Automatic Agent file application updates the affected open model (or creates
  its background document state) without changing the active document,
  selection, scroll position, or focused Agent input. Manual acceptance may
  reveal and focus the accepted edit as before.
- Deferred restoration of non-active session documents is a background path;
  reopening the intended active document after that work may not focus it.
- Source execution completion never focuses Console for file, selection, or
  line requests. A Console-origin request may restore its input only if no
  newer pointer, key, or text interaction occurred after admission and the
  Console remains visible and enabled.
- Explicitly selecting the Console dock tab continues to focus its input. The
  modal focus predicate remains a defense in depth, but absence of a modal is
  not permission for a background render to focus the editor.

### Reading position and selection

- Append-only Console, Logs, and Agent activity follow the end only when the
  user was already at or near the end immediately before the update. A user
  reading older content retains the prior viewport.
- Required volatile renders preserve the selected Run, Problem group, Plot,
  Output, Artifact, and Environment object by durable identity when it still
  exists. Environment detail and Data Viewer controls participate in the same
  focus boundary as the object list. Unchanged polling must not clear and
  reconstruct those projections.
- Poll intervals, backend queries, persisted selection fields, Run/Problem/
  Plot/Artifact truth, execution payloads, and Environment evidence are not
  changed.

## Cross-Review

- WP2 remains authoritative for document content, cursor persistence, source
  execution, and provenance. This repair owns only whether a presentation path
  is authorized to acquire focus.
- Issue #15 retains current-line cursor advancement. Its legacy allowance for
  other source executions to focus Console is superseded by this contract;
  guarded Console-origin restoration and explicit Console-tab focus remain.
- Issue #18 retains modal detection and shortcut suppression. Its statement
  that all no-modal document renders retain editor focus is superseded: the
  caller must now provide explicit focus intent.
- UX-FIX4 retains explicit Console-tab focus. This repair does not make
  background refresh equivalent to tab selection.
- UX4-AWS1 and the Agent conversation contract retain Task/turn selection,
  polling, approval, cancellation, and exact-thread authority. Presentation
  deferral never delays or rewrites those state transitions.
- WP3 and the Environment contracts retain Runs, Problems, Plots, Artifacts,
  object inspection, project binding, and scientific-operation authority.
- No schema, storage, broker command, approval, credential, filesystem,
  project-switch, R-session, or release-tooling authority moves.

## Acceptance And Verification

- Add a deterministic frontend regression that proves nested control focus and
  scroll restoration, unchanged-signature suppression, pointer and keyboard
  activation deferral/latest-render flushing, and surface fallback behavior.
- The regression proves an Agent automatic edit preserves active document and
  composer focus, while manual acceptance can still reveal the edit.
- The regression proves external reload is non-focusing and execution
  completion cannot reclaim focus after a newer interaction; explicit Console
  selection still focuses its input.
- The regression proves append-only surfaces follow the end only while pinned
  and Environment rows expose button semantics and stable focus keys.
- Run JavaScript syntax, the focused regression, adjacent Agent conversation,
  modal focus, current-line, Console/Logs, Runs/Problems/Plots/Environment, and
  all compatible frontend contract scripts, followed by `git diff --check`.
- Browser/mock review exercises a focused Agent activity control across at
  least two poll cycles, mouse and keyboard activation during refresh, an
  Agent composer while an automatic edit arrives, source execution while focus
  moves elsewhere, an older scroll position, and Plot/Environment selection.
- Installed Windows acceptance against an exact candidate remains a separate
  release gate and must repeat the Issue #33 reproduction workflow.

## Version, NEWS, And Stop Point

PR #24 established `0.4.0-dev.29` on upstream `main` through merge `f05315c`.
This source work package therefore retains the separately authorized
`0.4.0-dev.30` identity and synchronizes all application metadata and
`NEWS.md` without reusing `dev.29`. PR #29 subsequently integrated the
repository-wide Rust 1.88/Resolver 3 build contract at `9e0b36b`; the Issue #33
branch inherits that build-only contract without changing its product behavior
or version.

Stop after this interaction-stability work package, deterministic evidence,
post-verification contract review, scoped commit, and integration handoff.
Browser/mock and installed Windows interaction remain explicit acceptance
gates when those environments are available. Do not change poll cadence,
introduce virtualization, redesign panel content, or alter backend state
semantics.

## Implementation And Verification Evidence

Implemented on 2026-08-11 in one presentation-safety slice:

- a shared semantic-render coordinator now suppresses unchanged volatile DOM,
  defers the latest required replacement across pointer and keyboard
  activation, cancels stale deferred work when state returns to the rendered
  projection, and recovers an unfinished activation when the window loses
  focus;
- Project files/tabs, Agent timeline, Task Rail, Runs, Problems,
  Plots/Outputs, Environment/Data Viewer, and Git review expose stable focus
  identities and restore exact surviving controls or a same-surface fallback;
- Console, Logs, and Agent append paths retain an older reading position and
  follow the end only while pinned;
- automatic Agent file application, external file reload, project refresh,
  and deferred session-document restoration are non-focusing, while manual
  navigation retains explicit editor focus authority;
- source completion uses interaction-revision admission for Console-origin
  restoration and never redirects file, selection, or line requests; and
- unchanged saved-output polling retains the selected detail while its bounded
  refresh is in flight, avoiding empty-state flicker without changing queries
  or persisted selection truth.

Automated evidence completed on 2026-08-11:

- `node --check desktop/dist/app.js`;
- all 46 compatible `scripts/test-*ui.mjs` contracts, including the new
  deterministic Issue #33 focus/activation/scroll/background-edit regression;
- `test-act-file-apply-generated-outputs.mjs`,
  `test-agent-conversation-concurrency.mjs`, and
  `test-desktop-platform-config.mjs`; and
- `git diff --check`.

The initial interaction slice is JavaScript, CSS, tests, and governance
documentation only. A separate post-verification review found and corrected
two initially missed background paths: deferred
session-document restoration and Environment Data Viewer cell reconstruction.
The reviewed implementation now matches the amended contract, with no schema,
backend command, persistence, approval, credential, filesystem, execution
payload, project identity, or poll-cadence change.

Browser/mock interaction was attempted through the required browser workflow,
but the current environment exposed zero connected browsers. Therefore no
browser interaction result is claimed and that acceptance gate remains open.
Exact installed Windows reproduction and acceptance also remain open.

Version review records that PR #24 integrated synchronized `0.4.0-dev.29`
metadata and `NEWS.md` at `f05315c`. The 2026-08-11 upgrade authorization
therefore remains correctly allocated to `0.4.0-dev.30`. Source repair
reviewability is separate from release readiness; browser/mock, exact installed
Windows, and candidate publication gates remain open after metadata
synchronization.

The authorized stacked `0.4.0-dev.30` synchronization was subsequently
verified on 2026-08-11 with all 53 `scripts/test-*.mjs` contracts, JavaScript
syntax, Rust formatting and `cargo check --workspace`, 364 passing Rust tests
with one opt-in macOS Keychain test ignored, `rho.bridge` 97 blocks / 568
expectations, `rho.agent` 24 blocks / 120 expectations, and
`git diff --check`. All reported checks passed with zero failures. These full
workspace results verify the exact PR #24 dependency plus Issue #33 source
composition; they do not satisfy the still-open browser/mock, installed
Windows, candidate artifact, MAC5, or publication gates.

Integration refresh completed on 2026-08-11: PR #34 included upstream
`main` through MSRV merge `9e0b36b` while retaining `0.4.0-dev.30` and the
reviewed Issue #33 behavior. The refreshed tree passed all 54 JavaScript
contracts, JavaScript syntax, locked Rust formatting/check and 364 workspace
tests with zero failures and one opt-in Keychain smoke ignored, both focused R
package suites, and `git diff --check`. Exact PR head
`83e2719d56941a4607af2d5e494c55466e78490f` passed all four hosted Rust
compatibility identities in run `31511253088`, and PR #34 merged to upstream
`main` as `1b3f522a48bced21bda52769aefd836ac4494334`.

The earlier source-integration environment exposed zero connected browser
instances, so it produced no browser result. A later connected Chromium review
against exact `0.4.0-dev.31` candidate source passed the required interaction
slice: Agent activity retained mouse and Enter activation across more than two
poll cycles; an Agent composer draft, Environment row, and selected Plot each
retained focus/state across 4.5 seconds of refresh; and a Console reading at
scroll offset 284 retained that exact offset while a failed source run appended
new output. The Data Viewer refresh probe also preserved its query, descending
sort, and row window while token/revision advanced, then cleared a disappeared
object and ignored a foreign-project late response.

Computer Use against the exact installed signed `0.4.0-dev.31` bundle passed
the representative macOS slice: an Agent composer draft and focus, an
Environment row focus, and selected Plot 2 survived more than two refresh
cycles; Console content stayed at the user's older reading position while a
long streamed R expression continued. Candidate `dev.31` was later rejected by
the separately owned installed References/Rename defect, not by Issue #33.
Exact installed Windows reproduction remains open and continues to block Issue
closure; this macOS pass cannot be relabelled as `dev.32` candidate evidence.

## EDITOR-VIEWPORT-R1 Background Refresh Amendment

Authorization: after installed local trial on 2026-08-12, the user reported
that the Monaco source editor still returned to the selected range's end after
an upward wheel or scrollbar movement and explicitly requested a repair.

Change class: D1 presentation defect repair

Risk: R1 local user-visible reading position

The installed reproduction used `iris_ggsci.R` under the user's project root.
With the selection ending at line 53, dragging the editor upward returned to
the bottom. Collapsing the selection left the cursor at line 53 and did not
stop the return; moving the cursor to line 41 moved the forced reveal anchor
with it. No file content changed during diagnosis.

The remaining gap is distinct from focus acquisition. The recursive project
watcher emits `project://files-changed`; `listenForProjectChanges()` invokes
`refreshProject()`, which reopens the active document with `focusEditor: false`.
That flag prevents `.focus()` but `applyDocumentSelection()` still calls
`revealPositionInCenterIfOutsideViewport()` unconditionally. The existing
Issue #33 regression asserted the focus guard but did not execute or reject the
background reveal path.

Regression invariant: a background refresh may synchronize truthful document
state and a saved cursor/selection, but it may not reveal that cursor/selection
or revoke the user's Monaco viewport. Explicit file activation, source
navigation, manual Agent acceptance, and other caller-owned navigation retain
reveal authority. This amendment changes no watcher cadence, project file
truth, document content, cursor persistence, execution, schema, backend, or
filesystem authority.

Add a deterministic regression at the real `applyDocumentSelection()` seam
that proves `focusEditor: false` neither focuses nor reveals, while the default
explicit activation still does both. Run the focused Issue #33 contract,
editor/modal/current-line and adjacent file-edit contracts, all frontend
contracts, JavaScript syntax, and `git diff --check`, then build and verify the
installed Apple Silicon local trial. The application version and `NEWS.md`
entry are deferred to the next maintainer-named integration candidate; this
repair does not construct or distribute a candidate. The unchanged desktop-
only contract requires no `rho.bridge` or `rho.agent` package-version bump.

Implementation and local evidence on 2026-08-12:

- `applyDocumentSelection()` now exposes `revealSelection` separately from
  focus intent and defaults it to `focusEditor`; explicit activation therefore
  retains existing focus/reveal behavior, while the established
  `focusEditor: false` background paths neither focus nor reveal.
- The Issue #33 regression executes the real function seam and first failed on
  the unconditional reveal. The modal-focus contract was corrected from its
  former requirement that background renders still reveal.
- `node --check desktop/dist/app.js`, the focused workbench/modal/current-line
  and File proposal contracts, all `scripts/test-*.mjs` frontend contracts, and
  `git diff --check` passed.
- `cargo fmt --all -- --check`,
  `cargo check --workspace --all-targets --locked`, and
  `cargo test --workspace --locked --no-fail-fast` passed. The Rust test suite
  required local loopback access for its transport and Provider-discovery
  fixtures; the unrestricted rerun passed.
- `rho.agent` and `rho.bridge` complete `testthat::test_local()` suites passed
  with user startup files disabled. `rho.bridge` used a temporary writable R
  cache and skipped its optional `SingleCellExperiment` fixture because that
  package is not installed.
- `cargo tauri build --target aarch64-apple-darwin --bundles app` completed and
  the ad-hoc unsigned local bundle was copied to `/Applications/Rho.app`.
- Installed verification kept the cursor at `Ln 49, Col 48`, scrolled the
  `iris_ggsci.R` viewport to lines 11-36, then changed a supported `.md` file
  inside the recursively watched project tree. After the watcher's 500ms
  coalescing window and a 3.5-second observation interval, the viewport remained
  on lines 11-36 while the cursor remained at line 49.

This proves the original installed background-refresh reproduction no longer
returns the source editor to its cursor/selection. The user accepted the local
behavior for contribution on 2026-08-12. This is implementation evidence only,
not a signed candidate or distribution acceptance; exact installed Windows
acceptance remains open.

## WINDOWS-INSTALLED-ISSUE33-A1 Closure Amendment

Authorization: on 2026-08-12 the project owner instructed `尽快修复和关闭`
after reviewing the still-open Windows acceptance gap.

Change class: D4 exact-source installed acceptance tooling

Risk: R4 installer identity, installed-process automation, and evidence/release
boundary integrity

The earlier wording coupled product-Issue closure to a future signed release
candidate even though Windows signing is externally blocked by the separately
owned Issue #26/SignPath process. That coupling did not add product coverage:
it delayed the same six interaction checks until an unrelated release gate.
This amendment separates the facts without weakening release admission.

Issue #33 closure now requires an unsigned internal `0.4.0-dev.36` package
built from exact protected `main`, silently installed in a clean hosted Windows
profile, launched from its resolved install directory, and driven through a
runner-only loopback WebView2 debugging port. The shipped Tauri page must prove
its embedded version/commit and repeat the five original Issue scenarios plus
EDITOR-VIEWPORT-R1. The exact workflow, identity, deterministic scenario,
cleanup, screenshot, and JSON evidence requirements are owned by
`docs/release/active-0.4.0-dev.36-candidate-checklist.md`.

The installed automation may seed bounded Agent/Run presentation records to
make polling and pointer timing deterministic, but it must use the shipped
render/focus helpers, real Workspace R execution, real project watcher, real
Monaco editor, and the installed Tauri bridge. Browser/mock mode, the build-
tree executable, and source-only assertions cannot satisfy this gate. Any
failed or incomplete scenario leaves the Issue open.

Passing this exact-source installed check may close the reproduced product
defect. It does not claim Authenticode, signed-candidate, broad human installed
acceptance, MAC5, publication, or updater readiness. Those stricter release
gates remain unchanged and must still be run against a future exact signed
candidate.

### Ark download recovery correction

The first two exact-main acceptance attempts on 2026-08-12 both stopped before
package construction when GitHub Release returned `503 Service Unavailable` to
the pinned Windows Ark download. Neither attempt created an installer, so at
that checkpoint the single-use `0.4.0-dev.34` artifact identity remained
unconsumed. This is a D1
release-tooling reliability defect inside the already authorized D4 work
package; it changes no application bytes, runtime version, source behavior,
credential authority, publication state, or release decision.

Regression invariant: a transient or corrupt Ark response must never become
the canonical archive. Bootstrap downloads to one explicit `.partial` path,
verifies the pinned SHA-256 before promotion, and performs at most four attempts
with bounded exponential delay. Each failed attempt removes only that explicit
partial file; final failure remains visible and stops the workflow. A successful
retry may continue the same pre-artifact acceptance run. The source contract
must reject direct download into the canonical archive and unbounded retry.

### NSIS registry-path recovery correction

After the Ark recovery merged, exact-main source run `31633585677` passed all
four macOS/Windows stable/MSRV jobs at
`d0d1d5813dde69199a3e9463eac53ca41812585a`. Installed run `31633600383`
then built and uploaded the `0.4.0-dev.34` NSIS package, SHA-256
`cc693a691e0c2da435824de272ac955af6fdeea5a5b844072f1a37fbea48b801`.
NSIS installed successfully, but its registry `InstallLocation` contained
balanced surrounding quotes. Both installed-byte resolution and fail-closed
cleanup passed that raw value to `Join-Path`, which treated `"C` as a drive and
stopped before any interaction scenario. The artifact-producing run rejects
and consumes `dev.34`; no scenario, screenshot, installed identity, or cleanup
PASS is claimed.

The corrective D1/R3 workflow slice used fresh synchronized `0.4.0-dev.35`.
Both the normal resolution path and the `always()` cleanup path remove exactly
one balanced pair of surrounding quotes before path composition, then require
a fully qualified path. Unquoted absolute paths remain compatible. Empty,
partially quoted, or relative values fail visibly; the workflow does not guess
an install root or weaken installed-versus-build-tree separation. Regression
coverage rejects any direct `Join-Path $entry.InstallLocation` use and requires
the same normalization in resolution and recovery. Application behavior,
installer layout, registry ownership, signing, credentials, publication, and
release authority do not change.

### WebView2 browser-argument recovery correction

Exact protected-main commit `ab2df2cb0dba37e91692d3f40abcf89085b3f67b`
passed macOS/Windows stable/MSRV run `31635365392`. Installed run
`31635375821` then built, installed, resolved, and started the `dev.35` package;
the installed Ark runtime and exact executable were present, startup reached
Workspace/project readiness, and the fail-closed uninstall path removed both
the executable and registry entry. The workflow nevertheless timed out before
all scenarios because port 9222 was unavailable.

The defect is in acceptance admission rather than product focus behavior.
Wry supplies `ICoreWebView2EnvironmentOptions::AdditionalBrowserArguments`
explicitly, so its normal default argument string superseded the workflow's
process-environment-only `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`. That
artifact-producing failure consumes and rejects `dev.35`.

The corrective D1/R3 slice uses fresh synchronized `0.4.0-dev.36` and Tauri's
documented build `--config` merge mechanism. Only the dedicated Issue #33
workflow passes a checked-in overlay that preserves the complete primary
window configuration, repeats Wry's normal disabled-feature arguments, and
adds a fixed port bound to `127.0.0.1`. The generic build script resolves the
overlay as a repository-owned file and rejects a missing, non-file, or
out-of-repository path. Ordinary candidate construction passes no overlay; the
base Tauri configuration and public Windows package therefore gain no debug
port. Static regression coverage enforces both the positive acceptance path
and that negative production boundary before the installed workflow proves the
real CDP session. No application behavior, schema, credentials, runtime,
installer layout, publication, signing, or release authority changes.

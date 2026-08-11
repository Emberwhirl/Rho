# Workbench Focus And Refresh Stability Repair

Status: active; ISSUE-33-INTERACTION-1 authorized 2026-08-11; source
implementation, automated verification, and post-verification contract review
complete; PR #24 dependency integrated, branch refreshed through upstream
`main` `9e0b36b`, and exact local validation complete; final hosted source
matrix, browser/mock interaction, and installed Windows acceptance open

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

Integration refresh completed on 2026-08-11: Draft PR #34 now includes upstream
`main` through MSRV merge `9e0b36b` while retaining `0.4.0-dev.30` and the
reviewed Issue #33 behavior. The refreshed tree passed all 54 JavaScript
contracts, JavaScript syntax, locked Rust formatting/check and 364 workspace
tests with zero failures and one opt-in Keychain smoke ignored, both focused R
package suites, and `git diff --check`. The exact pushed PR head must still pass
the four hosted Rust compatibility identities before source integration.
Browser/mock interaction and installed Windows reproduction remain open after
source merge and continue to block Issue closure and candidate/release
acceptance; they do not become passing evidence merely because source is
integrated.

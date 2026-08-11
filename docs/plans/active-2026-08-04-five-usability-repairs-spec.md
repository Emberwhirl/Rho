# Five Workbench Usability Repairs

Status: active; five bounded work packages authorized and implemented with
automated/browser verification; installed-app acceptance open

Date: 2026-08-04
Authorization: user reported five installed-app usability defects and requested
five separate commits
Change class: D1 for UX-FIX1 to UX-FIX4; D2 presentation package for UX-FIX5
Risk class: R1 frontend interaction/presentation; UX-FIX2 touches the existing
explicit project-file save command but adds no write authority
Mandatory stops: verify, review, document, and commit each package separately
before starting the next package

## Shared Boundaries

- Preserve Workspace R, durable Runs/Problems/Plots/Artifacts, project identity,
  Agent approval, file-edit review, Git, Environment, and retention authority.
- Add no schema, migration, provider behavior, execution policy, filesystem
  authority, automatic save, or inferred success state.
- Keep browser/mock behavior aligned with desktop behavior and retain narrow-
  viewport, keyboard, focus, and accessible-name coverage.
- Existing application version remains `0.4.0-dev.0`; each implemented
  user-visible repair is recorded in `NEWS.md`. A new distributed candidate
  still requires synchronized version metadata.
- Installed-app acceptance remains a separate manual gate in
  `test/acceptance-project/MANUAL-ACCEPTANCE.md`.

## UX-FIX1: Truthful Problem Source Navigation

Problem `source_path` values such as `<console>` identify an execution surface,
not a project file. Problems must not label them `Go to source` and then report
that a file does not exist.

- `<console>` shows `Open Console`; clicking selects Console and focuses its
  input without changing or retrying the Run.
- Other angle-bracket virtual sources do not expose file navigation.
- A real source path exposes `Go to source` only while it exists in the active
  project file inventory. A missing file is represented as unavailable rather
  than opened optimistically.
- Real-file line/column navigation, Lintr quick-fix review, Explain, and Run
  again behavior remain unchanged.

Acceptance: deterministic Problems state covers console, existing file, and
missing file sources; no missing-file toast is produced for `<console>`.

Implementation evidence (2026-08-04): the Problems projection now classifies
console, other virtual, existing-file, and missing-file sources before offering
navigation. The `usability-problems` browser scenario verified `Open Console`
focus, retained existing-file navigation, truthful unavailable presentation,
and no horizontal overflow at 900 px. Focused frontend checks passed. Installed-
app confirmation remains open in the acceptance project. No application version
bump was made because this is not yet a new distributed development candidate;
the implemented repair is recorded in `NEWS.md`.

## UX-FIX2: Common Editor Save Shortcut

- `Ctrl+S` on Windows/Linux and `Meta+S` on macOS invoke the existing guarded
  active-document Save command and prevent browser-page save.
- The shortcut is available from Monaco and the active workbench document, but
  does nothing when no editable active document exists or a modal/text input
  owns the keystroke outside the editor.
- Save success, failure, dirty state, version, project refresh, and external-
  change behavior remain owned by the existing save path.
- No auto-save, Save As, multi-file save, or new filesystem command is added.

Acceptance: a dirty project file saves once, becomes clean, and persists; an
unavailable/read-only/no-document state performs no write and remains truthful.

Implementation evidence (2026-08-04): Monaco, the basic editor, and the active
workbench document context now route the platform save chord through the
existing guarded `saveActiveDocument()` path. Inputs and visible dialogs retain
their own shortcut ownership. The `usability-save` browser scenario verified
that Console does not save a dirty file, Monaco and document-tab contexts do,
and the saved content remains after close/reopen. Focused and adjacent editor
checks passed. Installed-app confirmation remains open. No application version
bump was made because this is not yet a new distributed development candidate;
the implemented repair is recorded in `NEWS.md`.

## UX-FIX3: Clearer File Explorer Hierarchy

- Folders use a familiar local folder icon, stronger label weight, stable
  disclosure chevron, and restrained hierarchy guides/indentation.
- Files retain type icons and active/dirty states; long paths remain bounded.
- Folder presentation must remain denser than cards and must not change sort,
  expansion, selection, watcher, or file-operation semantics.

Acceptance: expanded/collapsed folders are visually distinct at desktop and
narrow widths, keyboard focus remains visible, and no label/icon overlap occurs.

Implementation evidence (2026-08-04): directory rows now use the shared icon
sprite for a folder and stable chevron, stronger bounded labels, and nested
hierarchy guides. File labels are explicitly single-line and ellipsized. Browser
review verified expanded/collapsed chevron state, no overlap at desktop width,
and no page or tree overflow at the narrowest 1100 px layout that retains the
sidebar. Native summary focus styling and semantics remain in place. Focused and
M2 hierarchy checks passed. Installed-app confirmation remains open. No
application version bump was made because this is not yet a new distributed
development candidate; the implemented repair is recorded in `NEWS.md`.

## UX-FIX4: Console Tab Focus

- Selecting the Console dock tab focuses the visible Console input after the
  panel switch completes.
- Programmatic switches to Console follow the same rule only when the input is
  enabled; Logs/Plots/Problems do not steal focus.
- Console transcript, history, busy state, and execution behavior are unchanged.

Acceptance: clicking Console from every sibling tab leaves the caret in the
Console input and typing immediately edits the expression.

Implementation evidence (2026-08-04): `switchDockTab("console")` now owns the
post-layout focus rule and checks both visibility and enabled state. The earlier
Problems-specific duplicate focus was removed. Browser interaction verified the
initial programmatic Console selection and switches from Logs, Plots, and
Problems all leave `consoleInput` focused. The deterministic browser mock does
not retain a reliable busy window, so enabled-after-execution behavior remains
an installed-app manual probe while the disabled guard is source-checked.
Focused Console and usability checks passed. No application version bump was
made because this is not yet a new distributed development candidate; the
implemented repair is recorded in `NEWS.md`.

Issue #33 coordination amendment (2026-08-11): explicit Console-tab selection
continues to focus the visible enabled input. Execution completion and
background refresh are not tab selection; they follow
`active-2026-08-11-workbench-focus-stability-repair-spec.md` and may restore a
Console-origin input only when no newer user interaction has taken ownership.

## UX-FIX5: Human-Reviewable Agent Runs And Review

Agent-first Runs and Review must help a human answer: what was requested, what
the Agent actually did, what changed or was produced, whether it succeeded,
what evidence is available, and what still needs attention.

- Runs de-emphasizes internal system bookkeeping such as an unselected
  `workspace.snapshot` when a user/Agent scientific action is available, while
  retaining truthful access to bounded technical identity.
- Run rows use concise human labels, outcome, origin, source, time, and output/
  problem cues derived only from existing durable data.
- Review for a selected Agent turn or Run presents a human-readable summary,
  performed actions, produced Plot/Artifact/source evidence, warnings/problems,
  and bounded provenance. Raw request/status identifiers remain secondary.
- Review never invents a model rationale, semantic correctness verdict, file
  change, Plot, Artifact, or successful completion not present in existing
  records/events.
- Existing Audit remains deterministic reproducibility review and is not
  conflated with Agent task review or approval decisions.

Acceptance: the Agent plotting example yields a review surface where a human
can locate the request, successful R action, resulting Plot, relevant Run, and
any limitation without reading raw protocol values. Empty, running, failed,
completed, and no-evidence states remain truthful.

Implementation evidence (2026-08-04): Agent-first Runs now separates
scientific work from quieter background activity and derives concise origin,
source, status, time, and Plot/Artifact/Problem cues from existing records.
Opening a Run asynchronously loads its durable detail and presents requested
work, R code, outcome, output channels, exact-Run evidence, limitations, and
secondary technical provenance. Plot evidence uses the existing payload parser
and renderer path with explicit unavailable/pruned fallbacks. Deterministic
browser scenarios verified completed Plot evidence, running, failed, and
completed-without-evidence states, plus desktop and 900 x 700 Review geometry
without page overflow. Focused and adjacent frontend checks passed. No schema,
execution, correlation, approval, or audit semantics changed. Installed-app
confirmation remains open. No application version bump was made because this
is not yet a new distributed development candidate; the implemented repair is
recorded in `NEWS.md`.

## Cross-review

WP3 remains authority for Runs and Problems; WP3 scientific workflow remains
authority for Plots and Artifacts; UX4 Agent-first contracts retain posture,
Task/Runs/Review navigation and adaptive work-surface ownership; M1-M3 retain
tokens, hierarchy, state language, and review-lane distinctions; CL1 retains
Console/Logs routing; WS2 edit packages retain editor-buffer and explicit-save
semantics. These five repairs change local presentation and interaction only.
No conflicting schema, persistence, approval, policy, project, execution, or
retention ownership was found.

## Verification Matrix

For every package:

- `node --check desktop/dist/app.js`;
- focused source-contract/regression checks;
- relevant adjacent frontend checks;
- deterministic browser interaction at representative desktop and narrow
  viewport where visual behavior changes;
- `git diff --check` and scoped post-verification review;
- installed-app acceptance recorded as open unless run against a named build.

## Package Progress

| Package | Implementation | Automated/browser evidence | Manual gate |
| --- | --- | --- | --- |
| UX-FIX1 | complete | passed 2026-08-04 | installed app open |
| UX-FIX2 | complete | passed 2026-08-04 | installed app open |
| UX-FIX3 | complete | passed 2026-08-04 | installed app open |
| UX-FIX4 | complete | passed 2026-08-04 | installed busy-state probe open |
| UX-FIX5 | complete | passed 2026-08-04 | installed app open |

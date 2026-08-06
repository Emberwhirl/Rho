# Agent Execution And Output Review Repair

Status: active implementation contract

Date: 2026-08-04
Authorization: user explicitly requested the reported path, Act execution, and
Agent-first output-review defects be repaired, and asked that the original
Claude Science and Wisp Science references be re-applied
Change class: D2 bounded cross-boundary workflow repair
Risk class: R3 for Agent execution admission and approval policy; R2 for the
Agent-first output projection; R1 for display-only path normalization
Work package: AGENT-LOOP-1
Mandatory stop: after display-path repair, Act prompt-policy repair, Outputs
index and selected-output Review are implemented, verified, reviewed, and
documented; installed-candidate acceptance remains separate

## Problem And Evidence

Installed-app review found three breaks in the Agent-first work loop:

1. Runs and related surfaces expose Windows extended-path prefixes such as
   `//?/E:/...` and raw internal Workspace R bridge expressions.
2. An explicitly selected and authorized Act turn can answer with R code and
   ask whether it should run, even when the user directly requested execution.
3. An Agent-produced Plot is visible only after switching to Human-first and
   opening Plots. Agent-first Review has no output index and may remain empty.

These are not independent cosmetic defects. Together they prevent a human from
seeing what the Agent did, finding what it produced, and reviewing the result.

Regression invariants:

- durable path identity and command payloads remain unchanged, while every
  affected user-facing path uses one display projection without an extended
  Windows namespace prefix;
- Ask and Plan never execute, while Act completes a direct executable request
  with `run_r` when the tool and existing authorization contract permit it;
- a Plot or saved output already owned by the active project is discoverable
  and inspectable in Agent-first without switching posture.

### Duplicate Plot defect amendment (2026-08-05)

Installed-app review found that one successful Act `run_r` execution producing
one Plot can persist two byte-identical Plot records. The duplicate is visible
consistently in Outputs, Run Review, and Plot history, so it must be corrected
at the event-to-persistence boundary rather than hidden in one frontend view.

For one Workspace R execution, Plot extraction must normalize each supported
payload first and persist each identical `(media_type, normalized payload)` at
most once, preserving the first-seen order. Distinct normalized payloads must
remain distinct Plot records. Malformed payload rejection, project ownership,
Run provenance, retention, and frontend projection are unchanged. This bounded
D1/R2 repair does not introduce a new schema or reinterpret duplicates across
different executions.

## Reference Decision

The authorized interface follows the original posture design's documented
observations, not an invented chat-dashboard pattern.

From Wisp Science, this package takes:

- a task-oriented Agent stream with low-level activity collapsed by default;
- a separate tabbed work area for inspectable outputs;
- visible output counts and a persistent Runs surface for execution status.

From Claude Science, this package takes:

- artifact-first inspection in which a selected output receives more space
  than the conversation;
- the result and its creation evidence presented together;
- output selection before detailed review, rather than an empty generic Review
  page.

The bounded Rho navigation is therefore:

```text
Task | Runs | Outputs | Review
```

`Task` is the human-Agent interaction entry, `Runs` is execution status and
evidence, `Outputs` is the project/session result index, and `Review` is the
large selected-object detail surface. This package uses current Plot and WP3
Artifact records only. It does not activate the proposed durable Task,
Artifact-version, annotation, finding, or acceptance schemas.

## User-Visible Contract

### Display paths and background activity

- A single frontend helper removes `\\?\`, `//?/`, and their UNC variants for
  display only. It never changes stored values, equality checks, containment,
  file opening, or command arguments.
- Runs, Problems, Plot and saved-output metadata, Agent Review, audit evidence,
  project hints, environment paths, file navigation labels, and visible
  tooltips/options use the helper where they may receive absolute paths.
- Known system Runs use human labels such as `Refreshing workspace context`,
  `Refreshing package inventory`, `Refreshing lockfile status`, or
  `Refreshing project environment`.
- Unknown system-origin Runs use `Background workspace task`; raw bridge code
  is not promoted into a user-facing title. Failures and truthful status remain
  visible.

### Act execution

- Ask is read-only and never calls `run_r`.
- Plan is read-only and never calls `run_r`.
- In Act, when the current request explicitly asks Rho to execute R work and
  execution is required to complete it, the Agent calls `run_r` in the current
  turn when the selected model supports tools and existing authorization or
  exact approval succeeds. It does not merely print code or ask whether to run.
- Act does not force R execution for explanation-only requests.
- Session authorization does not replace project, revision, code, approval,
  stale-state, or tool-support checks. No authority boundary is broadened.
- The Agent never claims execution without a tool result and durable Run
  evidence. Rejection, unsupported tools, failure, cancellation, and stale
  state remain truthful.

### Outputs index

- Agent-first exposes an `Outputs` tab between Runs and Review.
- Outputs lists current-project Plots and saved outputs using existing state.
  Each item shows a stable human title, kind, source, creation time, preview or
  availability state, and review status when known.
- The empty state says no output has been produced. Missing, pruned, incomplete,
  or undecodable output remains listed with a truthful limitation.
- Selecting a Plot opens Review with a large image when available, human source
  and timing, and an originating Run or source action when available.
- Selecting a saved output opens Review using existing WP3 detail and file
  availability. It does not pretend a file can be previewed when no supported
  payload or viewer exists.
- A newly loaded Agent execution result becomes discoverable immediately. Rho
  may select the newest output only when no review object is already selected;
  it does not pull the user away from an active review.
- Human-first Plots and saved-output behavior remains unchanged.

## State And Compatibility

The frontend may add presentation-only state for the selected output kind and
identifier. Durable authority remains:

- Rust broker/store for project identity, Runs, Plots, and WP3 Artifacts;
- Workspace R for R execution and live scientific state;
- Agent R plus broker approval policy for tool orchestration;
- existing project-relative file navigation and revision guards.

Project switching clears Agent output selection before the new project renders.
Session restoration validates any selected object against current project data.
No second store, inferred provenance, schema migration, or historical backfill
is authorized.

## States And Acceptance

| State | Required behavior |
| --- | --- |
| Outputs empty | focused empty state; no generic Review placeholder presented as a result |
| Plot available | thumbnail in Outputs; selection opens a dominant decodable image |
| Plot pruned/missing | item remains truthful; Review explains preview unavailability |
| Saved output available | human title and source; selection opens existing supported detail/actions |
| Saved output missing/incomplete | no false open action; limitation and known provenance remain visible |
| Run with output | Runs reports output count and links to inspectable result evidence |
| Background Run | human task label; no bridge expression in title |
| Extended Windows path | readable ordinary path everywhere in affected presentation |
| Direct Act request | tool-capable authorized Act calls `run_r` and verifies its result |
| Ask/Plan | never calls `run_r` |
| Act unauthorized/rejected/stale/failed | existing decision or failure state remains explicit; no success claim |
| 900 x 700 | Task/Runs/Outputs/Review remain usable without overlap or page overflow |
| Keyboard | four surface tabs and output items are focusable and identify selection |

## Cross-Review

- The proposed Human/Agent posture design supplies the Claude Science and Wisp
  Science information hierarchy. This focused package implements only an
  Outputs projection and selected-output Review over existing records.
- UX4 adaptive work-surface remains owner of the simple Task default and
  contextual large work surface. `output` is presentation state, not a new
  durable entity.
- WP3 remains the sole Artifact record/provenance authority. Plot payload and
  retention contracts remain authoritative for availability and pruning.
- The five-usability and plot-review contracts remain authoritative for
  human-readable Runs/Review and Human-first visual review. This package closes
  the missing Agent-first discovery path without duplicating their stores.
- BH1/BH2 keep project identity and project switching authoritative. Display
  normalization cannot be used for identity or containment.
- Existing Agent approval, revision, and tool-support rules remain the safety
  boundary. This package strengthens the Act system instruction but does not
  infer authorization from posture or mode.
- M1-M3 retain visual/status presentation ownership. No theme or unrelated
  scientific workflow redesign is included.

No schema, persistence, migration, credential, network, filesystem, project
identity, or approval-lane conflict is introduced.

## Verification Matrix

- deterministic frontend contract tests for centralized display paths, known
  and unknown background Run labels, and absence of raw bridge titles;
- deterministic Agent-first previews for empty/populated Outputs, available
  Plot, pruned Plot, available saved output, and missing saved output;
- interaction tests for Task/Runs/Outputs/Review selection, Plot and saved-output
  opening, project reset, keyboard access, and 900 x 700 layout;
- Rust unit test that extracts and asserts the exact Ask/Plan/Act prompt policy,
  including direct Act execution and no false execution claim;
- Rust regression tests that two identical normalized display payloads in one
  execution yield one Plot, while two distinct payloads yield two Plots and
  equivalent padded/unpadded PNG payloads share one identity;
- retain approval success, rejection/stale, failure, cancellation, and
  unsupported-model tests at existing ownership boundaries;
- `node --check desktop/dist/app.js` and all affected frontend scripts;
- `Rscript -e "testthat::test_local('r/rho.agent')"`;
- Rtools GNU `cargo +stable-x86_64-pc-windows-gnu test --workspace`;
- `git diff --check`;
- installed-app manual examples added to the consolidated acceptance project,
  but kept NOT RUN until the user tests a rebuilt candidate.

## Version, Documentation, And Release

- Add a concise `NEWS.md` entry only after implementation and automated review.
- Keep application version `0.4.0-dev.0` for this source slice. Advance it before
  producing a different distributable development candidate.
- The R package contract does not change; no R package version bump is planned.
- Keep this document active while installed-app acceptance remains open.
- This work package makes no installer or release-readiness claim.

## Definition Of Done

AGENT-LOOP-1 reaches its mandatory stop when ordinary user-facing paths and
background titles are clean, direct authorized Act requests receive an
execution-oriented policy, Agent-first exposes a truthful Outputs index and a
large selected-output Review, project and approval boundaries remain intact,
the affected automated matrix passes, the implementation matches this
contract, NEWS/manual acceptance/document evidence are updated, and installed
acceptance is explicitly left open.

## Implementation And Evidence

Generated-file extension (2026-08-06):
[`active-2026-08-06-act-file-apply-and-generated-output-capture-spec.md`](active-2026-08-06-act-file-apply-and-generated-output-capture-spec.md)
adds bounded `workspace.execute` generated-file records to the existing WP3
Artifact authority. This document continues to own the Agent-first Outputs
projection; no new Outputs state or query is introduced.

Implementation and automated/browser verification completed on 2026-08-04.

- Agent-first navigation now projects `Task | Runs | Outputs | Review` over the
  existing frontend state. Outputs combines current-project Plot and WP3 saved
  output records without a new durable entity or query.
- Selecting a Plot opens a dominant image review canvas with source, time,
  availability, producing Run, and source actions. Selecting a saved output
  opens existing WP3 detail with truthful file availability and provenance.
  Empty and pruned Plot states remain inspectable and truthful.
- `displayPath()` removes Windows extended namespace prefixes only when
  rendering. File navigation, containment, project identity, and command
  payloads continue using original values. Known system queries use bounded
  human labels; unknown system Runs use `Background workspace task`.
- The Agent R startup system policy now requires direct executable Act requests
  to call `run_r` when available and authorized, prohibits merely offering code
  or asking whether to run it, and prohibits execution claims without a tool
  result. Ask and Plan still explicitly prohibit `run_r`; model tool support and
  broker approval/revision checks are unchanged.

Focused and affected evidence passed:

- `node --check desktop/dist/app.js`;
- `node scripts/test-agent-output-review-ui.mjs`;
- Agent-first, usability, Plot review, scientific surface, Console/Logs,
  interface foundation, and workbench hierarchy frontend contract scripts;
- `Rscript -e "testthat::test_local('r/rho.agent')"` with 45 passes;
- Rtools GNU `cargo +stable-x86_64-pc-windows-gnu test --workspace` with all
  workspace tests passing; existing dead-code warnings only;
- browser interaction at 1280 x 720 and 900 x 700 for populated/empty Outputs,
  available/pruned Plot, saved-output detail, returning to Outputs, and readable
  path/background Run presentation, with no page-level horizontal overflow;
- `cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check` and
  `git diff --check` at handoff.

Post-implementation review found no schema, persistence, project-isolation,
approval, credential, or authority deviation. The broader proposed durable
Task, Artifact version, annotation, finding, and acceptance models remain
unimplemented and unauthorized.

`NEWS.md` and the consolidated example-driven manual acceptance workflow were
updated. Application version remains `0.4.0-dev.0`; it must advance before a
different distributable candidate is produced. R package versions are
unchanged. Exact installed-app execution and visual acceptance are NOT RUN, so
this contract remains active and no release-readiness claim is made.

The 2026-08-05 duplicate-Plot defect amendment is implemented and automated
verification is complete. Plot extraction now deduplicates the normalized
`(media_type, payload)` identity within one execution while preserving the
first-seen order and all distinct payloads. Focused Rust tests cover duplicate,
equivalent padded/unpadded PNG, distinct, and malformed payloads. The Rtools GNU
Rust workspace, Agent output-review and scientific-surface frontend contracts,
`rho.agent` (45 passes), Rust formatting, and diff checks passed. Installed
acceptance must still confirm that one Act request producing one image adds
exactly one item to Outputs, one Plot to the producing Run Review, and one
Plot-history record.

### Long-running Act analysis amendment (2026-08-06)

Installed-app review found that a long authorized Act analysis could complete
multiple Workspace R stages and persist plots, then end with exit code 0 before
the final report step. The Agent R turn contract therefore uses a 512-step Act
exploration budget (128 for Ask/Plan), a 15-minute idle lease for an individual
Agent request, and no short wall-clock cutoff while the Agent continues to
produce requests. These are liveness budgets, not execution authority; the
broker still requires an explicit `desktop.agent_completed` or
`desktop.agent_failed` terminal event and preserves truthful failure otherwise.

The regression contract asserts the mode-specific aisdk step budgets in the
desktop Agent script and R package, and retains the existing terminal-event and
error-path tests. User cancellation remains the explicit stop action; idle
requests still fail recoverably after the lease expires.

### Agent-to-Human Outputs refresh defect amendment (2026-08-06)

Authorization: the user reported that a Plot created while using Agent posture
does not appear after returning to Human posture and explicitly requested the
defect be fixed. Change class: D1. Risk class: R1 because the repair changes
only frontend refresh and rendering order over existing read-only queries.

Installed `0.4.0-dev.14` evidence showed that the Human Console execution
succeeded, the Plot payload was persisted, and the current project/session
query returned it. The defect is that the Agent-to-Human posture transition
does not reload Runs, Problems, Plots, and saved outputs. In addition,
`loadRunData()` waits for selected saved-output detail and Agent Console
synchronization before rendering any of those core lists, so a slow or failed
secondary request can leave the Human Outputs count and history stale.

The authorized `HUMAN-OUTPUT-REFRESH-1` slice requires:

- changing from Agent to Human posture reloads the current Runs, Problems,
  Plots, and saved outputs through the existing `loadRunData()` path;
- the four core query results are assigned and rendered before selected
  saved-output detail retrieval or Agent Console synchronization;
- selected saved-output detail failure remains visible and recoverable but
  cannot suppress the Plot count, Plot history, Run history, or Problems;
- project/session filtering, durable state, Workspace R identity, execution,
  approval, and all other authority boundaries remain unchanged;
- focused frontend contracts protect posture refresh, core rendering order,
  and saved-output detail failure isolation.

The work-package stop is after focused frontend verification, syntax and diff
checks, contract review, and version/NEWS impact assessment. Installed-app
acceptance remains separate and must confirm that an Agent-created Plot appears
in Human Outputs immediately after switching posture without restarting the
project or Workspace R.

Implementation and focused verification completed on 2026-08-06. Returning to
Human now awaits `loadRunData()`. That loader renders the four core lists before
saved-output detail retrieval and Agent Console synchronization, and isolates
both secondary failure paths. `node --check desktop/dist/app.js`, the
Agent-first, Outputs Viewer, and Agent output-review frontend contracts passed.
A browser/mock interaction showed one Agent Plot before the transition and the
same Plot count and history entry in Human Outputs afterward.

Post-implementation review found no project/session filtering, persistence,
Workspace R identity, execution, approval, schema, or authority change. No
version or `NEWS.md` update is made because this work has not produced a new
distributable candidate and must not be attributed to the existing
`0.4.0-dev.14` installer. The next rebuilt candidate must advance to
`0.4.0-dev.15`, record the fix in `NEWS.md`, and complete installed acceptance.

# Rho Development Roadmap

Status: active

Date: 2026-07-26
Current baseline: `0.2.0-dev.12` Windows workbench candidate

Progress: the core `0.2.x` daily-use workflow is implemented and is now in
hardening. Project editing, Workspace R execution, Agent approvals, durable
runs, restart recovery, Environment, Plots and render diagnostics are present;
the remaining work is release acceptance on representative projects and a
distribution decision. Automated release metadata, source checks, evidence
generation, and Unicode/space/large-project regressions are now part of the
release path.

The four scoped `0.3.x` implementation packages have also landed: reviewed
environment operations, bounded data viewers, artifact export/provenance, and
bounded project skills. The `0.3.x` milestone remains active because its
representative-project reproducibility workflow and manual UI review have not
yet been accepted. The final cross-package automated suite passed on 2026-07-26
and is recorded in `verification/0.3x-milestone/verification.md`.

## Direction

The next objective is not another architecture spike. It is a reliable
Windows daily-use slice in which a scientist can open a real R project, run
code, inspect objects and plots, ask the Agent for help, review proposed
changes and recover from ordinary errors without losing the Workspace R state.

The two-session architecture remains the boundary:

- Workspace R is the only authority for live scientific objects and project
  execution.
- Agent R runs `aisdk`, model calls and orchestration.
- Rust broker owns transport, revisions, approvals, persistence and process
  lifecycle.
- The Tauri frontend consumes broker/workbench events and does not talk to Ark
  or `aisdk` directly.

No aisdk family change is required for the next milestone. We will continue
with the Rho adapter shims until a missing upstream seam is demonstrated by a
concrete workflow and covered by an isolated compatibility test.

## Milestones

### M1: Windows daily-use slice (`0.2.x`)

Priority: highest. This is the next development target.

Deliverables:

- Open a local project directory and display a real file tree.
- Edit and save multiple `.R` files; preserve the active document and cursor
  position across restarts.
- Replace the prototype textarea with a language-aware editor, completion and
  source/run selection commands.
- Keep Console, Plots, Problems, Environment and the resizable panel layout
  working with real project files.
- Add explicit user/agent/system execution origin, timestamps and run links.
- Add a real approval surface for Act-mode `run_r` and reviewed Agent file
  edits.
- Persist the Agent timeline and restore it after Agent R restarts while
  preserving the independent Workspace R session.
- Add user-facing cancellation, timeout, crash and restart states.

Completed in the current `0.2.x` candidate:

- native project selection and project-scoped session restoration;
- broker-safe file listing, reads, writes, new files and render paths;
- Monaco multi-document editing and selection/current-line/file execution;
- resizable Files, Agent, Environment, Console, Plots and Problems panels;
- durable runs, retry links, cancellation, restart recovery and plot provenance;
- Ask/Plan read-only enforcement and exact single-use Act approval for `run_r`;
- Environment diagnostics for R, libraries, `renv`, Bioconductor and rendering;
- bounded object previews and optional Quarto/R Markdown render diagnostics;
- atomic source/session persistence, coalesced file watching and bounded file
  discovery for large projects;
- bounded local R completion and simple document-symbol navigation.
- version/tag/resource validation, one-command source verification,
  machine-readable release evidence and pre-publication workflow gates;
- automated project regressions for spaces, non-ASCII paths and the 2,000-file
  discovery boundary.

Still required to release M1:

- clean-install acceptance on Unicode paths, paths with spaces and large projects;
- a repeatable manual acceptance record for the complete QC correction workflow;
- an explicit decision about unsigned internal versus signed public distribution.

Post-release `0.2.x` quality work:

- file rename/delete commands;
- paged plot-history payload loading and retention controls;
- package-aware completion, package-management workflows and an explicit policy
  for future shell-like tools.

Acceptance gate:

> A user can open a small single-cell R project, execute a QC script, inspect
> an object and plot, ask DeepSeek to explain an error, approve a correction,
> and restart either R process without losing the project or audit trail.

### M2: Scientific workflow foundation (`0.3.x`)

Priority: high after the M1 implementation and automated regression baseline
are stable. Remaining `0.2.0` installer/manual-publication acceptance may run
in parallel with `0.3.x` development, but it remains an independent release
gate and cannot be satisfied by `0.3.x` evidence.

Implementation contract:
[`plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`](../plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md).

The `0.2.x` candidate already provides read-only `renv`/Bioconductor
diagnostics, bounded object previews, project-scoped plot history and basic
`.qmd`/`.Rmd` rendering. The `0.3.x` work extends those foundations; it must not
reimplement them as parallel subsystems.

Implementation status: WP1-WP4 are present in the current source baseline.
Focused package evidence exists, but the M2 acceptance gate below is still
open. Do not treat implementation presence as milestone or release acceptance.

Deliverables:

- reviewed `renv` status, initialize, restore and snapshot workflows with
  durable environment-operation evidence;
- Bioconductor/package drift diagnostics beyond the current version summary;
- paged bounded viewers for data frames and selected common bioinformatics
  objects;
- plot/render/table artifact export and provenance inspection building on the
  current plot history and render results;
- reproducibility evidence for existing Quarto `.qmd` and `.Rmd` rendering and
  structured Problems output;
- bounded project-scoped skills treated as untrusted Agent context, without an
  `aisdk.bioc` or default Bioconductor dependency.

Acceptance gate:

> A second user can reproduce a selected QC result from the project files,
> environment metadata, run record and generated artifacts without relying on
> chat text alone.

### M3: Cross-platform beta (`0.4.x`)

Priority: after the Windows contract is stable.

Deliverables:

- macOS arm64/x64 and Linux x64 process and packaging probes.
- One generated Workbench Protocol contract across Tauri and browser mode.
- Platform-specific R discovery, paths, signals, permissions and WebView
  behavior.
- Signed internal builds and a dependency/license manifest.
- Cross-platform fixtures for Unicode, paths with spaces, plots, HTML and
  large object summaries.

Acceptance gate:

> The same project workflow and protocol tests pass on Windows, macOS and
> Linux without platform-specific frontend behavior leaking into Workspace R
> semantics.

### M4: Advanced execution and reproducibility (`0.5.x`)

Priority: after local workflows are dependable.

Deliverables:

- Debugger/DAP integration where Ark and R support it.
- Long-running jobs with checkpoints and resource monitoring.
- Exportable run reports with code, environment, artifacts and approvals.
- Remote Workspace R, SSH and Slurm adapters behind the same broker contract.
- Optional containerized workspace backend.

Acceptance gate:

> Local and remote runs have the same execution/revision/provenance semantics,
> and disconnect/reconnect cannot duplicate a scientific execution.

## Implementation Program

This section is the authoritative cross-proposal implementation order. Local
phase or work-package numbering in a design document describes only that
document. It does not override this program or authorize product-code work.

Each wave has a mandatory evidence review before the next dependent wave. An
unfinished proposal remains `proposed` until one bounded package is explicitly
authorized under
[`active-development-governance.md`](active-development-governance.md). At that
point, create or activate a focused implementation handoff, record the entry
evidence and next stop point, and update
[`active-document-cross-review.md`](active-document-cross-review.md). Do not
activate a whole multi-package proposal at once.

Current program state: **Wave 1, BH1 only**. Wave 0 automated review closed as
`accept with follow-up`; the `0.3.x` representative-project and manual UI gates
remain open and are not recorded as passed. BH1 project-scoped durable identity
is the only authorized new product package. The parallel `0.2.0-dev.12` and
About/update tracks retain their own active acceptance contracts. BH2-BH5,
UX1, modernization, and Waves 2-7 remain scheduled but not authorized.

| Wave | Primary implementation or acceptance track | Permitted parallel track | Exit gate |
| --- | --- | --- | --- |
| 0 | Close the active `0.3.x` milestone | Complete the exact `0.2.0-dev.12` installed-app release acceptance and About/update live and installed acceptance as independent tracks | Each track has its own recorded automated, manual, installed-app, documentation, and release facts |
| 1 | BH1 canonical project identity and two-project isolation | UX1 contract/copy inventory and usability baseline; modernization Phase 1 visual tokens and component inventory only | BH1 isolation gate passes; parallel work makes no unsupported backend or navigation claim |
| 2 | BH3 transactional schema v8 migration, then BH2 project-switch state machine | UX1 may finish; no UI may promise switching, retention, or recovery behavior before its owning backend gate | Historical migration, rollback/failure injection, and atomic project-switch evidence pass |
| 3 | RA-RC1 deterministic run comparison | Behavior-neutral visual foundation work only | RA-RC1 is accepted at its mandatory review stop |
| 4 | UX2 first use, files, Run scope, and result handoff | Finish modernization Phase 1 without structural navigation changes | Novice task protocol and browser/Tauri parity pass |
| 5 | WB1 read-only public Workbench Protocol | Maintenance and accepted non-conflicting presentation work only | Versioned protocol, bounds, redaction, project isolation, and rejection behavior pass |
| 6 | WB2 authenticated local CLI, MCP, and event replay | Begin cross-platform transport validation against the accepted protocol | Local authentication, compatibility, replay, redaction, and platform evidence pass |
| 7 | RA-RC2, followed by one separately selected UX3, UX4, or UX5 package | BH4 must precede any retention, prune, hide, or delete behavior | Each package is separately authorized, accepted, and stopped for review |

### Wave 0: Close Current Acceptance Work

Finish the representative-project `0.3.x` workflow, final cross-package suite,
manual UI review, and documentation/release reconciliation. The cross-package
suite, WP3 runtime DOM disposition, and current WP4 package checks passed on
2026-07-26; retain their evidence and rerun only when affected. Only integration
findings and repairs inside the accepted WP1-WP4 contract are permitted without
amendment.

The `0.2.0-dev.12` release checklist and About/update acceptance may proceed in
parallel because they have independent candidate and deployment authority.
Evidence from one track cannot close another track.

### Waves 1-2: Establish The Safe Baseline

BH1 was authorized on 2026-07-26 under
[`plans/active-2026-07-26-bh1-project-scoped-durable-identity-handoff.md`](../plans/active-2026-07-26-bh1-project-scoped-durable-identity-handoff.md).
BH3 may share its development cycle with the reviewed BH1
schema, but retains an independent migration gate. BH2 begins only after BH1 is
accepted and may not publish a new project until Workspace R, persistence,
watchers, broker state, and UI state are synchronized.

UX1 may run in parallel because it inventories language and defines testable
interaction contracts without claiming new behavior. Interface modernization
Phase 1 may establish tokens, icons, dimensions, focus treatment, and a
component inventory. Neither track may introduce structural Human/Agent
navigation or present unimplemented switching, retention, undo, or recovery.

After BH1-BH3, rerun affected `0.3.x` evidence because project ownership,
queries, migration, and switching are shared foundations.

### Waves 3-4: Deliver Evidence And Novice Workflow Value

RA-RC1 is the first new post-`0.3.x` capability. It remains a read-only derived
view over authoritative runs, snapshots, Problems, and Artifacts and stops for
review before RA-RC2.

After RA-RC1 acceptance, implement UX2 as a vertical novice workflow covering
first use, project files, exact Run scope, persistent results, and recovery.
Modernization Phase 1 may finish alongside UX2, but structural layout remains
blocked by the posture decision.

### Waves 5-6: Stabilize Local Interoperability

WB1 freezes the bounded, project-scoped, read-only semantic contract before a
transport is treated as public. WB2 then adds authenticated local CLI, MCP, and
replayable events without adding external execution. Cross-platform transport
validation begins only against these accepted boundaries.

WB3 is not part of Waves 5-6. External execution requires a separate security,
approval, credential, and admission decision after read-only interoperability
has demonstrated value.

### Wave 7 And Later Selection

Authorize RA-RC2 after RA-RC1, then select only one of UX3, UX4, or UX5 for
product implementation at a time. UX3 requires the relevant BH1-BH3 switching
and history behavior. UX4 requires an accepted posture implementation contract.
UX5 requires accepted `0.3.x` behavior and BH4 before any retention or deletion
operation.

Posture phases, structural modernization, background jobs, remote execution,
debugging, WB3, and public remote control remain later separately reviewed
streams. Their presence in a proposal is not scheduling or authorization.

### Concurrency And Stop Rules

- Keep no more than one new post-`0.3.x` product-capability stream in
  implementation at a time. Acceptance/release tracks and behavior-neutral
  design-system work may run in parallel when their evidence and ownership are
  independent.
- A parallel track must not consume an unaccepted schema, protocol, navigation,
  approval, switching, or retention behavior from another track.
- Stop at every wave exit and package-specific review point. Reconcile tests,
  manual evidence, version/NEWS impact, document lifecycle, remaining debt, and
  worktree state before authorizing dependent work.
- If evidence invalidates an entry condition, return the affected package to
  review; do not silently reorder the program or infer acceptance.
- Emergency repair remains governed by the exception rules in
  `active-development-governance.md` and does not authorize adjacent roadmap
  scope.

## Explicitly deferred

- Python, Jupyter Server and JupyterLab dependencies.
- Electron or a second production frontend shell.
- A second authoritative Workspace R session.
- Broad aisdk family refactors without a demonstrated Rho use case.
- `aisdk.bioc` and semantic-adapter integration during `0.3.x`.
- Remote/cloud multi-user collaboration before local provenance is reliable.
- Installer signing and auto-update until the product surface and release
  identity are stable.

## Decision checkpoints

Every milestone should end with a short evidence review:

- Which user workflow is now demonstrably complete?
- Which state transitions and failure paths have tests?
- Does the change preserve Workspace R authority and revision checks?
- Does it introduce a real aisdk family gap, or can the Rho adapter remain
  local?
- Is the result ready for the next internal user, or only for another spike?

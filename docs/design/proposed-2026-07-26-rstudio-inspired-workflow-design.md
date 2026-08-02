# RStudio-Inspired Scientific Workflow Proposal

Status: proposed umbrella direction; partially implemented through separately accepted focused packages

Date: 2026-07-26
Last reconciled: 2026-08-02
Scope: post-`0.2.x` workflow quality and capability sequencing
Related milestones: `0.3.x` scientific workflow foundation and later releases

Cross-review role: this proposal owns post-`0.3.x` capability direction and
sequencing. It does not authorize current milestone work, define the future
Human/Agent posture state machine, own visual tokens and component styling, or
define task-level interaction and recovery language. Future capability surfaces
must follow
`docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`.
Any future external semantic projection, CLI, MCP tool, or external execution
for these capabilities must follow
`docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`.
The active roadmap and `0.3.x` handoff take precedence.

## Summary

Rho should learn from RStudio's mature daily-use workflows without becoming an
RStudio clone with an Agent panel. Rho already has the visible foundation of an
R workbench: project files, a Monaco editor, Console, Environment, Plots,
Problems, durable runs, one authoritative Workspace R session, and a reviewable
Agent. The next product gains should come from closing common scientific
workflows and reducing interaction cost.

The proposal prioritizes five capability groups:

1. reviewed package and project-environment management;
2. package-aware editing, local help, and context-grounded Agent assistance;
3. richer object and artifact inspection with provenance;
4. reviewable Git changes and document-production workflows;
5. broker-managed background jobs, followed later by debugging and package
   development.

RStudio supplies useful interaction patterns. Rho's durable broker records,
explicit mutation policy, project revisions, artifact provenance, and shared
Workspace R remain the governing contracts.

## Product Thesis

The relevant RStudio lesson is not its fixed four-pane layout. It is that the
most frequent actions form short, predictable loops:

```text
find -> edit -> run -> inspect -> diagnose -> revise
```

Rho should preserve that low-friction loop while extending it into an
inspectable scientific record:

```text
project -> source revision -> environment -> run -> artifact -> review
```

An Agent may help at every step, but it must not become the only place where
the user can discover state, understand a failure, or verify a result. Chat is
coordination; files, runs, objects, environment snapshots, artifacts, diffs,
and findings are the durable work products.

## Goals

This proposal aims to let a scientist:

- manage an R project environment without leaving Rho or losing an audit trail;
- write and navigate R code with package-aware assistance at interactive
  latency;
- resolve help and examples against the packages actually installed in the
  active project;
- inspect large and domain-specific objects without transferring unbounded
  values to the frontend;
- trace a plot, table, or rendered document back to its source, run, and
  environment;
- review both Agent and human file changes at useful diff granularity;
- render and diagnose `.qmd` and `.Rmd` documents as a coherent workflow;
- monitor long-running work without treating raw Console output as job state;
- recover cleanly when optional intelligence, documentation, rendering, Git,
  or environment services are unavailable.

## Non-Goals

This proposal does not authorize:

- replacing the current layout with a fixed RStudio-style four-pane shell;
- automatic `.RData` restore or other hidden session mutation;
- a second authoritative R session for scientific objects;
- direct frontend access to Ark, Git, package installers, shells, or databases;
- an unrestricted Terminal or generic process-execution Agent tool;
- silent package installation, repository changes, lockfile writes, or
  Workspace R library activation;
- a second approval store for Agent actions disguised as direct UI actions;
- Python, Jupyter Server, JupyterLab, Electron, remote compute, or multi-user
  collaboration as prerequisites for the local workflow;
- implementing debugger or package-development features before the local
  environment, viewer, and artifact contracts are dependable.

## Current Baseline

The current repository already provides:

- project-scoped file discovery, multi-document Monaco editing, save and
  session restoration;
- selection, current-line, and source-file execution in one Workspace R;
- Console, Environment, Plots, Problems, Runs, and bounded object previews;
- project-scoped plot history and basic `.qmd`/`.Rmd` rendering;
- read-only `renv`, R, library, Bioconductor, and render diagnostics;
- bounded completion and simple document-symbol navigation;
- durable run history, cancellation, restart recovery, and provenance;
- Ask, Plan, and Act policy with reviewed Agent R actions and file edits.

New work must extend these surfaces and stores instead of creating parallel
subsystems. The
[accepted `0.3.x` implementation handoff](../plans/accepted-2026-07-25-0.3x-scientific-workflow-handoff.md)
remains authoritative for environment operations, paged viewers, artifact
export/provenance, and project-scoped skills. Milestone placement remains
governed by the [development roadmap](../project/active-development-roadmap.md).

Since this proposal was drafted, the four scoped `0.3.x` implementation
packages have landed. Reviewed environment operations, the first bounded
`SummarizedExperiment` and `SingleCellExperiment` views, WP3 artifact
export/provenance, and bounded project skills are implemented baselines. Their
milestone-level integration and representative-project acceptance remain open;
this proposal must not reimplement them.

## Implementation Progress

This proposal remains `proposed` because it is an umbrella direction rather
than one implementation contract. The user authorized and the repository
implemented several bounded packages under separate focused specifications.
Their completion does not authorize the unimplemented remainder.

| Workstream | Reconciled state on 2026-08-02 | Remaining proposal scope |
| --- | --- | --- |
| WS1 packages and environments | Partial: reviewed environment operations and a searchable installed-package inventory are implemented | searchable lockfile inventory; direct/transitive dependency and package-source presentation; package install/remove/update remain outside the accepted inventory package |
| WS2 editor and local Help | Partial: Air was selected; dynamic completion, signatures, hover help, project-local go-to-definition, and `lintr` projection are implemented | bounded find-references; package source/help navigation beyond the current fallback; full installed-version help/examples/vignettes and recorded example execution; diagnostic grouping/quick fixes; reviewable formatting and refactors; Agent citations to local Help |
| WS3 object and artifact inspection | Partial: bounded viewers, Workspace-owned literal search, stable absolute-column sort, matched paging, page-size control, frozen identifier column, keyboard navigation, exact visible-page exports, column type/class/page-missing metadata, distinct special-value rendering, and Artifact provenance are implemented | bounded tree navigation; broader plot zoom/format review; complete common inspection/provenance navigation; TanStack Table remains deferred rather than required for the current vanilla-table slice |
| WS4 Git | Capability implementation complete: supervised CLI review, guarded file/hunk mutations, restore/commit UI, adversarial repository hardening, and repository-bound replacement guards are verified | installed-app acceptance remains open; current V1 retains the supervised Git CLI instead of `gitoxide` |
| WS5 Quarto and R Markdown | Partial: chunk discovery/navigation, current/preceding/below/all chunk execution, and asynchronous render polling are implemented | render cancellation and restart reconciliation; render-to-Artifact provenance closure; HTML/PDF inspection and source-linked diagnostic/review loop |
| WS6 jobs and Monitor | Partial prototype: Quarto has an in-memory asynchronous job/status adapter | durable typed job records, bounded logs/progress, cancellation, restart/reconnect reconciliation, duplicate prevention, Artifact registration, and a general Monitor job surface |
| WS6A `targets` | Partial: read-only capability and pipeline inspection are implemented | separately authorized pipeline run/cancel, durable job admission, Artifact registration, selected-result import, and pipeline-to-document orchestration |
| WS7 debugging and package development | Not started | Ark debugger contract and typed package document/test/build/check jobs |

Acceptance remains separate from implementation. The `0.3.x` representative
project/manual gate and Waves 4-14 per-package/manual gates remain open in the
active roadmap and acceptance records.

## Capability Decisions

| RStudio pattern | Rho adaptation | Priority | Target |
| --- | --- | --- | --- |
| Packages and `renv` workflows | Previewed, typed, durable environment operations | P0 | `0.3.x` |
| Data Viewer | Bounded paged viewers with domain-specific summaries | P0 | `0.3.x` |
| Plots and Viewer | Versioned artifacts linked to source, run, and environment | P0 | `0.3.x` |
| Completion and navigation | Package-aware completion, signatures, definitions, and references | P1 | post-`0.3.x` |
| Editor foundation | Keep Monaco and connect one broker-managed R language service | P1 | post-`0.3.x` |
| Static diagnostics | Map bounded `lintr` findings into the existing Problems model | P1 | post-`0.3.x` |
| Help pane | Installed-version help with examples and Agent citations | P1 | post-`0.3.x` |
| Rich tabular interaction | Use TanStack Table over broker-paged data | P1 | post-`0.3.x` |
| Git pane | Broker-mediated diff, staging, history, and review provenance | P1 | post-`0.3.x` |
| Quarto/R Markdown workflow | Chunk execution, background render, source-linked diagnostics, artifact review | P1 | post-`0.3.x` |
| Reproducible pipelines | Optional, broker-managed `targets` inspection and execution | P2 | after local jobs and Quarto |
| Jobs pane | Typed broker jobs with status, cancellation, logs, and artifacts | P2 | advanced execution |
| Debugger | Ark-compatible breakpoints, stack, frames, and manual takeover | P2 | advanced execution |
| Build pane | Typed package document, test, build, and check workflows | P2 | advanced execution |
| Terminal | No default unrestricted terminal; add only bounded tool classes with explicit policy | Deferred | no milestone |

## Governing Architecture

Every capability in this proposal must preserve the following boundaries.

### Workspace Authority

Workspace R remains the only authority for live scientific objects and normal
project execution. Agent R hosts model orchestration only. Background tools may
produce files or artifacts, but importing their results into Workspace R is an
explicit, broker-recorded action.

### Broker Ownership

The Rust broker owns commands, normalized project roots, state and project
revisions, policy, durable records, cancellation, recovery, and bounded
transport. The frontend renders state and submits typed intent; it does not
construct arbitrary R, Git, shell, or package-management commands.

### Mutation Lanes

Each protected operation has a typed policy class. Environment operations use
their dedicated broker-owned request records and confirmation surface; direct
UI `renv` actions do not reuse Agent `approval_requests`. Git writes, external
jobs, and package-development commands likewise require contracts appropriate
to their own state and recovery semantics.

All environment previews and operations receive the explicit normalized
project root from broker state. They must never depend on `getwd()` matching
the selected project.

### Bounded Evidence

All R/Rust/frontend values are plain JSON-serializable and bounded by bytes as
well as rows, columns, entries, depth, and message length where applicable.
Large-payload tests should exercise byte limits with representative payload
shapes rather than pathological item counts.

### Browser Parity

Every new Tauri command that changes visible workbench state receives a
corresponding deterministic browser/mock handler in the same work package.
Screenshot readiness is the primary browser-preview evidence when Windows Edge
DOM capture returns empty output.

### Open-Source Component Policy

Open-source tools provide bounded computation or protocol capabilities; they
do not become parallel authorities for project identity, scientific state,
policy, persistence, Problems, runs, jobs, or Artifacts. Before a component is
selected, its focused handoff must record the exact version, license and notice
obligations, Windows distribution method, update policy, process and crash
boundary, project-root access, payload limits, and unavailable behavior.

Rho must not silently install an optional R package or executable into the
user's project or library. Bundled tools require release and installer review;
project-provided tools run only after capability detection and version
reporting. A library may be replaced before implementation if its focused
evaluation fails, but the accepted semantic contract must not depend on one
library's private data structures.

| Component | Role in Rho | Integration boundary | Decision |
| --- | --- | --- | --- |
| Monaco | Existing editor, source ranges, decorations, completion and navigation UI | Frontend consumes broker-owned document versions and bounded provider results | Retain; do not replace the editor |
| Air / R `languageserver` | Candidate R formatting and Language Server Protocol backends | One optional broker-supervised helper process per active project context; never Workspace R or Agent R | Compare and select one primary backend; do not ship two simultaneous authorities |
| `lintr` | Static R diagnostics with rule and source-range metadata | Typed read-only diagnostic operation using the confirmed project environment | Optional diagnostics provider after the language-service contract |
| TanStack Table | Headless table rendering, keyboard interaction, column state and virtualization | Frontend only; paging, sorting, filtering, search and export truth remain Workspace/broker operations | Preferred post-`0.3.x` viewer interaction layer if V1 bounds are preserved |
| `gitoxide` | Git discovery, status, diff, history and later selected mutations | Rust broker validates repository identity, revisions, paths and policy | Preferred Git implementation candidate; credentialed network operations remain out of scope |
| Quarto CLI | Scientific document rendering | Broker-managed typed local job over saved project files and a declared format | Retain existing detection, then migrate synchronous rendering into the first local job adapter |
| `targets` | Optional R pipeline inspection, dependency state and incremental builds | Fixed R adapter functions in a broker-managed job; `_targets` remains targets-owned | Add only after the local job and Quarto contracts are accepted |

The Air and R `languageserver` comparison must use the same representative
projects and evaluate installed-package completion, signatures,
definition/reference accuracy, formatting stability, diagnostics, Unicode and
space-containing paths, startup latency, cancellation, crash recovery, memory,
offline behavior, and supported-R compatibility. Monaco remains the client in
either case. The selected service must not mutate files except through an
explicit formatting or refactor proposal bound to a document version.

## Workstreams

### WS1: Packages And Reproducible Environments

Provide a project Environment surface that distinguishes installed state,
lockfile state, drift, repositories, R version, Bioconductor version, and
effective libraries.

Required behavior:

- searchable installed and locked package inventory;
- direct versus transitive dependency and package-source information where it
  can be resolved reliably;
- bounded status and change preview before `renv` initialization, restore, or
  snapshot;
- exact operation, project root, revisions, repositories, and expected changes
  bound to a single-use confirmation;
- dedicated direct-UI and optional Agent-linked environment request records;
- before/after immutable environment evidence linked to the operation run;
- truthful partial-failure and cancellation states without rollback claims;
- no silent installation of `renv`, `BiocManager`, or another package;
- no silent repository change or activation of another library in the running
  Workspace R.

The detailed operation arguments, persistence model, and tests are governed by
the active `0.3.x` handoff rather than repeated here.

### WS2: Package-Aware Editor And Local Help

Extend the existing bounded completion and symbol navigation incrementally.

Monaco remains the editor. Add a broker-supervised language-service adapter
that translates Monaco/LSP requests into bounded results tied to the active
project and document version. Air and R `languageserver` are candidates for
this adapter, not cumulative dependencies. A focused checkpoint selects one
primary backend and records any unsupported capabilities that Rho must supply
through local Help or its existing Workspace bridge.

Initial capabilities:

- completion for visible workspace objects, installed package exports,
  namespaces, named arguments, and data-frame columns when cheaply available;
- function signatures and parameter documentation;
- go to definition for project functions and package source/help locations;
- find project references with bounded results;
- diagnostics that identify source range, severity, producer, and applicable
  quick fixes;
- `F1` or an equivalent command for the symbol at the cursor;
- installed-version help including usage, arguments, examples, vignettes,
  package name, and package version;
- explicit execution of a selected example as a normal recorded Workspace run.

After the language-service checkpoint, integrate `lintr` as a separate,
optional static diagnostics provider. Its findings are normalized into the
existing Problems schema and identify `lintr`, the rule, package version,
source revision and scan scope. Duplicate language-service and `lintr`
findings are grouped deterministically; neither provider owns a second Problems
store. Autofixes or formatting never write directly: they become
document-version-bound reviewable edits.

Agent answers about an API should be able to reference the resolved local help
record. The UI must distinguish local documentation evidence from model-only
explanation. Completion, help, and Agent enrichment are optional services:
failure or timeout must not block typing, saving, or execution.

Refactors such as symbol rename or extract-function should begin as reviewable
workspace edits. They must show affected files and revisions before write and
must not be implemented as an opaque Agent rewrite.

### WS3: Object And Artifact Inspection

Implemented baseline: bounded data-frame/matrix paging, selected
`SummarizedExperiment` and `SingleCellExperiment` views, plot/render/visible
table artifact records, export, and provenance inspection. The active `0.3.x`
contract remains authoritative for their limits and schema.

Post-`0.3.x` delta:

Extend the current bounded data viewer and plot history into a common
inspection model.

TanStack Table is the preferred headless UI layer for the tabular surface. It
may own DOM virtualization, column sizing/order, selection, focus and keyboard
interaction. It must not receive a full large object, execute scientific
filter expressions, infer currentness, or become the authority for sort,
filter, paging, export or provenance. Those operations remain typed Workspace
or broker requests under the implemented V1 byte and dimension limits.

Required capabilities:

- row and column paging, sorting, filtering, search, frozen identifiers, and
  clear type/missing-value rendering for tabular objects;
- bounded tree navigation for lists and structured S3/S4 summaries;
- adapter views for selected common bioinformatics objects, introduced only
  when their contracts and dependency behavior are tested;
- stable viewer references bound to workspace identity and revision so stale
  objects are never shown as current;
- plot navigation, zoom, size/format preview, and reviewed export;
- first-class plot, table, and rendered-document artifacts;
- provenance tabs for inputs, source, execution, environment, messages, and
  review state;
- commands from an artifact back to its producing source and run.

The viewport should prioritize the selected artifact during inspection. Agent
conversation may remain available as a compact panel or drawer, but must not
reduce a plot, table, diff, HTML result, or PDF to a secondary preview.

### WS4: Git And Reviewable Changes

Introduce Git as a project capability, not as unrestricted shell execution.
Use `gitoxide` as the preferred implementation candidate because it can remain
inside the Rust broker boundary. The focused Git handoff must verify the exact
operations and Windows repository cases against the selected version before
adoption; Rho's command and persistence contracts must not expose
`gitoxide`-specific object layouts.

Initial read operations:

- repository and branch status;
- changed, staged, untracked, and conflicted files;
- bounded unified diffs and per-file history;
- commit metadata without credential or environment leakage.

Initial mutations:

- stage or unstage a selected file or hunk;
- create a commit from the explicitly staged revision;
- restore a selected user-confirmed file or hunk;
- resolve only explicitly selected conflict content.

V1 excludes fetch, pull, push, credential discovery or storage, remote URL
mutation, branch deletion, force operations, submodule mutation and Git hooks.
Rho must not execute repository hooks implicitly. Worktrees, nested
repositories, symlinks, case-only paths, non-UTF-8 metadata, large diffs and
repository replacement require explicit fixtures and fail-closed behavior.

Every mutation must validate repository identity and current diff/revision at
execution time. Agent-originated changes and pre-existing human changes remain
distinguishable. Rho must never stage unrelated work implicitly, and destructive
restore requires an exact, visible target and confirmation.

Agent file proposals should eventually support hunk-level acceptance while
retaining the existing reviewable proposal and explicit Accept contract. A Git
commit may link to the task, proposal, validation runs, and artifacts that
motivated it, but Git history is not a substitute for Rho's run provenance.

### WS5: Quarto And R Markdown Production

Build on the existing saved-document render command and structured Problems.
Quarto CLI remains an external executable with detected path and version. Rho
does not embed Quarto internals or install it silently. The current synchronous
`workspace.render_document` behavior is the migration baseline; the first
accepted local-job adapter should move process lifecycle to the broker without
changing existing render Artifact provenance semantics.

Required capabilities:

- code-chunk discovery and navigation;
- run current chunk, preceding chunks, or selected chunks in Workspace R;
- render with visible format, project root, input revision, and environment;
- cancellation, retry, bounded logs, and source-linked diagnostics;
- HTML and PDF inspection beside the source document;
- rendered outputs registered as artifacts rather than transient Viewer state;
- links from an artifact or diagnostic back to the responsible source range;
- Agent review scoped to an exact paragraph, chunk, table, plot, or page.

A full visual Markdown editor is not required for the first iteration. The
first acceptance target is a dependable edit-run-render-diagnose-review loop.

Rendered HTML runs in an unprivileged viewer without Tauri command access.
Quarto exit status is authoritative; bounded stdout/stderr parsing may create
Problems but must not define job state. Record the Quarto version, input
document version, normalized project root, declared format, environment
snapshot, output files and resource directories. Cancellation is best effort
and must report outputs that may already have been written.

### WS6: Background Jobs And Monitor

This workstream owns the future broker-managed job capability contract. A
future posture implementation may project jobs in Monitor or Review, but it
must not define a second job runtime, policy, or persistence contract.

After the local workflow contracts are stable, introduce broker-managed jobs
for long renders, model fits, package operations, checks, and later remote work.

Each job records:

- typed operation and runtime identity/version;
- normalized project root and declared inputs/outputs;
- environment and source revisions;
- queued, running, cancelling, cancelled, failed, or completed state;
- bounded progress, meaningful output, warnings, and errors;
- cancellation and restart-recovery behavior;
- producing task/run and resulting artifacts.

The Monitor surface summarizes active work and exceptions. Raw streams remain
inspectable but are collapsed by default. No job implementation may parse
Console text as its authoritative state or silently create another live R
workspace.

Quarto rendering is the first proposed local job adapter. Freezing that narrow
adapter precedes a general job surface: the initial contract may support only
typed `document.render`, cancellation, bounded logs, restart reconciliation
and Artifact registration. It must not accidentally authorize arbitrary
process execution.

### WS6A: `targets` Pipelines

After the local job contract and Quarto adapter are accepted, add an optional
`targets` adapter for projects containing `_targets.R`. Rho detects the package
in the confirmed project environment and reports its version; it does not
install `targets`, rewrite `_targets.R`, or own, repair, delete or migrate the
`_targets` data store.

Initial read-only operations:

- capability and `_targets.R` discovery under the normalized project root;
- bounded manifest, dependency, outdated, progress and error summaries using
  documented `targets` APIs;
- source locations where targets metadata can report them reliably;
- bounded dynamic-branch aggregation instead of unbounded branch expansion.

Later typed mutations:

- run all outdated targets or an explicitly selected target set with the
  dependency expansion visible before execution;
- cancel the broker-owned R process on a best-effort basis and reconcile
  durable state after restart;
- register declared file targets and selected report inputs as Artifacts
  without copying the `_targets` metadata database into Rho;
- explicitly import a selected result into Workspace R as a separate recorded
  action rather than silently sharing a live object or process.

The adapter exposes fixed operations such as `pipeline.inspect`,
`pipeline.outdated`, `pipeline.run` and `pipeline.cancel`; neither frontend nor
Agent may submit arbitrary R code through it. Pipeline execution uses a
broker-managed noninteractive R process tied to project and environment
revisions. It is not a second interactive Workspace R.

A later composed `pipeline build -> document render` command is orchestration
over two durable jobs. It first displays the targets that may run, stops if the
pipeline fails, registers declared file outputs, then renders a saved Quarto
document against the recorded revisions and environment. Provenance is marked
incomplete when document inputs are implicit, network-derived or not declared
as file targets; Rho must not infer dependencies from matching filenames.

### WS7: Debugging And Package Development

Begin only after WS1-WS6 have stable contracts and evidence.

Candidate debugging capabilities:

- breakpoints and conditional breakpoints where Ark supports them;
- step, continue, stop, call stack, selected frame, and bounded local values;
- visible handling of `browser()` and `recover()`;
- manual takeover without confusing debugger state with ordinary Console idle.

Candidate package workflows:

- document, test, build, and check as typed jobs;
- structured test/check Problems linked to source and logs;
- explicit build artifact and environment evidence;
- no construction of arbitrary shell commands in the frontend or Agent.

## Delivery Sequence

### Phase A: Complete The `0.3.x` Scientific Foundation

Reconciled status: implementation and automated milestone evidence are present;
representative-project and installed/manual acceptance remain open.

The scoped implementation packages for WS1 and the `0.3.x` portions of WS3
have landed. Complete their representative-project integration workflow,
cross-package validation, manual review, and documentation/release integration.
Do not add post-`0.3.x` viewer, artifact, or environment capabilities while
closing this gate.

Gate:

> A second user can reproduce a selected QC result from project files,
> environment evidence, a recorded run, and its artifacts without relying on
> chat text.

### Phase B: Daily Editing Intelligence

Reconciled status: partially implemented. RA-RC1 is accepted; RA-RC2, Air
completion/navigation/hover help, and `lintr` have implementation packages.
The broader WS2 Help, references, quick-fix, and refactor contract remains open.

Deliver RA-RC1 and later RA-RC2 according to the authoritative Wave program in
the active roadmap. After the Wave 7 selection gate, deliver the initial WS2
completion, navigation, diagnostics, and local Help capabilities as separate
Wave 8-9 packages. Neither reproducibility package may be bundled into WS2.

The WS2 package sequence is: retain Monaco; complete the Air versus R
`languageserver` compatibility checkpoint; select and integrate one primary
language backend; then add normalized `lintr` diagnostics. A provider failure
must leave editing, saving and Workspace execution available.

Gate:

> A user can first explain recorded differences between two project runs, then
> in the separate WS2 package discover and use an installed-package API,
> navigate the relevant project code, run an example, and diagnose a source
> issue without leaving Rho; optional intelligence failure never blocks either
> evidence inspection or editing and execution.

### Phase C: Change And Document Review

Reconciled status: partially implemented overall. The vanilla bounded viewer,
complete supervised-CLI Git review/mutation/hardening workflow, chunk surface,
and render polling exist. The end-to-end render/Artifact review gate remains
open; Git installed-app acceptance remains separate.

First extend the accepted viewer contract without changing its data authority.
The current focused package retained the vanilla table and deferred TanStack
Table. Current WS4 uses the supervised Git CLI rather than `gitoxide`; its
guarded frontend mutations, adversarial hardening, and replacement detection
are implemented. Deliver richer WS5 artifact review without redefining WP3.

Gate:

> A user can inspect a change, stage only selected content, render a document,
> follow a diagnostic to source, and verify the resulting artifact and its
> provenance before committing.

### Phase D: Managed Long-Running Work

Reconciled status: partially implemented as an in-memory Quarto job prototype
and read-only `targets` inspection. Durable job lifecycle, cancellation,
restart recovery, and pipeline execution remain open.

Deliver WS6 using typed local operations before any remote execution adapter.

Gate:

> A long render or scientific operation survives UI navigation, exposes
> truthful state, can be cancelled or diagnosed, and produces no duplicate run
> after broker restart or reconnect.

After the Quarto job adapter passes this gate, deliver `targets` inspection as
a read-only package, stop for review, and only then authorize pipeline
execution and composed pipeline-to-document production.

### Phase E: Advanced Developer Workflow

Reconciled status: not started.

Deliver the feasible Ark-backed portion of WS7, followed by package workflows.

Gate:

> A package developer can stop at a breakpoint or run a package check, inspect
> structured state and failures, return to normal Workspace execution, and
> retain links among source, environment, run, logs, and artifacts.

## Cross-Cutting Acceptance Requirements

Every implementation work package derived from this proposal must include:

- an explicit user workflow and out-of-scope list;
- typed commands and bounded response schemas;
- normalized project-root validation and stale-revision behavior;
- success, empty, unavailable, stale, cancelled, failed, and restart states;
- browser/mock parity for every user-visible desktop state;
- unit and integration tests at the R, Rust, and frontend boundaries affected;
- Windows Rust validation using the documented Rtools GNU toolchain;
- path fixtures containing spaces and non-ASCII characters where files or
  project roots are involved;
- evidence that existing dirty worktree changes were not absorbed or reverted;
- manual visual acceptance for complex viewers, dialogs, diffs, and responsive
  layouts;
- documentation that distinguishes implemented behavior from proposals.

Automated checks prove contract behavior, not public-release readiness. Final
installer acceptance, SmartScreen behavior, installation, complete user
workflow, recovery, and uninstall remain separate release gates.

## Success Measures

Product evaluation should use workflow outcomes rather than pane count:

- time and commands required to move from an error to its source and help;
- percentage of environment mutations with complete before/after evidence;
- percentage of exported artifacts linked to a source run and environment;
- ability to complete ordinary work when Agent, help enrichment, or completion
  is unavailable;
- rate of stale or rejected mutations caught before execution;
- number of workflows requiring an external terminal or RStudio;
- user ability to identify what changed, why it changed, and how to reproduce
  a selected result.

Telemetry is not required to begin. Manual workflow timing and structured test
evidence are sufficient until a separate privacy-reviewed telemetry decision
exists.

## Open Decisions

| Decision | State on 2026-08-02 |
| --- | --- |
| Primary language backend | Resolved: Air is the selected primary backend; Monaco remains the editor |
| Bioinformatics classes beyond implemented V1 | Open; requires one focused class/view contract at a time |
| `gitoxide` versus supervised Git CLI | Resolved for current V1: retain the supervised Git CLI; a future migration requires separate evidence and must not change Rho's command contract |
| Quarto adapter versus general job schema | Partially resolved for the prototype; durable lifecycle, cancellation, restart reconciliation, and Artifact linkage remain open |
| Minimum stable Ark debugger contract | Open |
| Accepted `targets` API/version and declared-input evidence | Open; read-only inspection does not resolve execution semantics |
| Release milestone names for Phases B-E | Open pending earlier acceptance gates |

These decisions should be resolved one workstream at a time. Approval of this
proposal establishes direction and sequencing; it is not permission to
implement all workstreams in one change.

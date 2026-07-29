# Implemented Baseline Hardening Plan

Status: proposed broader repair plan; BH1-BH3 accepted through focused
handoffs, BH4 separately active, and BH5 not authorized

Date: 2026-07-26
Scope: project isolation, project-switch concurrency, durable-store migration,
history retention, and incremental module boundaries in the implemented Rho
baseline

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`;
- `docs/plans/proposed-2026-07-26-interface-modernization-plan.md`;
- `docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`;
- `docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`.

Implementation entry rule: each package in this plan requires explicit approval
before product code changes begin. BH1 was authorized on 2026-07-26 under
`active-2026-07-26-bh1-project-scoped-durable-identity-handoff.md` and is now
accepted. BH3 was authorized on 2026-07-27 under
`active-2026-07-27-bh3-transactional-schema-v8-migration-handoff.md` and is
now accepted. BH2 was authorized on 2026-07-28 under
`active-2026-07-28-bh2-project-switch-state-machine-handoff.md` and is now
accepted. BH4 was authorized on 2026-07-29 under
`active-2026-07-29-bh4-retention-privacy-artifact-lifecycle-handoff.md`.
BH5 remains unapproved. Once approved, BH1-BH3 are correctness and privacy repairs
to the implemented baseline and take precedence over post-`0.3.x` features
that read, compare, retry, or aggregate durable runs or Agent history.
Complete each checkpoint and stop for review before beginning the next one.

## Summary

Rho already persists runs, Problems, Agent turns and approvals, plot payloads,
Artifact records, environment snapshots, and environment-operation requests.
Several of those records, however, do not carry a durable normalized project
identity. Their list, history, detail, clear, and retry paths can therefore use
global records after the user changes projects.

The most serious current consequences are:

- recent Agent conversation from one project can be added to a model request
  made from another project;
- Runs and Problems from different projects can appear in the active project;
- retry can execute code from a historical run against the current Workspace R
  project without proving that both projects are the same;
- switching projects has no single contract for active execution, Agent turns,
  approvals, or environment operations;
- schema upgrades and destructive history actions do not yet provide the
  migration and retention guarantees required by a long-lived scientific
  workbench.

This plan repairs those foundations before new evidence features depend on
them. It does not add a new project database, execution runtime, approval lane,
Artifact model, or frontend framework.

## Goals

This plan will:

- bind every newly admitted durable operation to one canonical project
  identity;
- prevent project A records or prompts from appearing in, influencing, or
  executing within project B;
- define deterministic project-switch behavior for active and waiting work;
- replace opportunistic schema patching with a transactionally versioned v8
  migration and historical fixtures;
- preserve provenance while distinguishing hide, payload prune, record delete,
  and file delete semantics;
- establish bounded storage and privacy lifecycle rules;
- split oversized implementation modules along existing ownership boundaries
  without changing user-visible behavior.

## Non-Goals

This plan does not authorize:

- a second Workspace R or project runtime;
- inferred project ownership from source paths, timestamps, current UI state,
  Workspace cwd, Artifact filenames, or chat text;
- automatic retry or migration of an unscoped historical run;
- merging Agent approvals, file-edit review, and environment-operation
  requests;
- a second run, Problem, audit, Artifact, or project-history store;
- Run Comparison, Reproducibility Audit, Git, Quarto jobs, posture, or broad
  interface implementation;
- React or another frontend framework solely to split the current JavaScript;
- deleting durable provenance because a user clears a visible panel;
- claiming public-release readiness from these automated repairs alone.

## Findings In The Implemented Baseline

### BH-F1: Agent conversation is not project-scoped

`agent_turns` records workspace and revision fields but no normalized project
root. `recent_agent_conversation()` selects recent completed turns globally,
and the Agent coordinator adds them to the next model prompt. Agent history and
approval list commands are global as well.

This is a privacy and behavioral isolation defect, not merely a presentation
problem. Frontend filtering alone is insufficient because prompt construction
and approval continuation occur behind the UI.

### BH-F2: Runs, Problems, and retry are not project-scoped

The durable run model has no authoritative project identity. Run and Problem
queries are global, while retry reads stored arguments and dispatches them to
the currently active Workspace R. The current workspace identity and revision
checks do not prove that the stored run belongs to the active project.

Retry must fail closed unless the stored run and current broker project have
the same canonical identity.

### BH-F3: Project switching has no concurrency contract

Project switching updates Workspace R cwd, active store metadata, session
state, and file watching. It does not first resolve every active run, Agent
turn, waiting approval, or environment-operation request. Different surfaces
can therefore retain state whose ownership no longer matches the active
project.

### BH-F4: Store migration is cumulative rather than versioned

The store currently creates the latest table shapes, accepts several older
schema versions, ensures columns individually, and then writes the current
version. That approach does not provide an auditable per-version transaction,
explicit backfill policy, historical fixture matrix, or reliable recovery from
an interrupted future migration.

### BH-F5: Clear and retention semantics are underspecified

Agent history, plot history, and Artifact records contain different mixtures
of presentation history, large payloads, and durable provenance. A generic
physical delete can remove evidence that another record still references.
Rho also lacks explicit project quotas, pruning order, database maintenance,
and privacy behavior for prompts, logs, plot payloads, and emergency editor
recovery data.

### BH-F6: Core implementation files have crossed ownership boundaries

The frontend application, Tauri command module, coordinator, and store module
now each contain multiple independently evolving domains. Further features
will increase merge conflicts and make project-scope omissions easier unless
commands, queries, and state transitions are grouped by their existing domain
ownership.

## Governing Contracts

### Canonical Project Identity

The Rust broker owns a `ProjectIdentity` derived from the explicitly selected,
normalized project root. The first implementation may persist the canonical
root string as the identity, but all comparisons and queries go through one
normalization and equality helper so a future opaque project ID can be added
without changing every feature API.

Requirements:

- normalize once at project admission using the broker's Windows path rules;
- persist the canonical identity on every new run and Agent turn;
- obtain approval ownership through its parent turn and also persist the
  project identity where independent recovery or indexing requires it;
- retain explicit `project_root` ownership on Artifact and environment records;
- never accept a frontend-supplied root as authority when broker state is
  available;
- use the stored identity, not the current root, for historical detail and
  provenance lookup;
- reject cross-project detail, retry, continuation, and mutation by default.

Workspace ID and project revision remain execution-state evidence. They do not
replace project identity: a restarted Workspace R can receive a new workspace
ID while still serving the same project.

### Legacy And Unscoped Records

Migration must not guess ownership. A historical run or Agent turn may be
backfilled only when an existing authoritative field proves its project under
a documented deterministic rule. Current UI state, last-opened project,
source paths, timestamps, Artifact filenames, and nearby records are not
proof.

Records without proof remain explicitly `legacy_unscoped`. They may be shown
only in a separately labelled legacy-history view or exported through a
deliberate diagnostic action. They are excluded from:

- normal project Runs, Problems, Agent history, and approval lists;
- model conversation context;
- retry and approval continuation;
- project audit and run comparison;
- automatic deletion or reassignment during project switching.

The migration report records scoped, unscoped, and rejected counts without
including prompt, source, output, or path contents.

### Query And Command Isolation

Project-owned APIs accept or inject one broker-authoritative project identity.
Isolation must be enforced in store queries and command admission, not only in
the frontend.

The following operations require project filters and ownership checks:

- list and detail for runs and Problems;
- run retry and cancellation recovery;
- Agent turn list, detail, recent conversation, and clear/hide actions;
- approval list, decision, continuation, and recovery;
- plot and Artifact list, detail, clear, export, and deletion;
- environment snapshot and environment-operation request lookup;
- any future audit, comparison, task, job, Git, or render aggregation.

Cross-project administrative diagnostics, if ever added, require a separate
typed command and must not reuse ordinary project UI endpoints.

### Project-Switch Concurrency

Project switch is a broker-owned state transition with preflight, resolution,
commit, and recovery phases. It is not a sequence of unrelated UI refreshes.

V1 rules:

- block switching while Workspace R has an active scientific execution;
- block switching while an Agent turn is running;
- block switching for every waiting approval or decision capable of later
  continuation or mutation; return a typed blocker that identifies and can
  navigate to the owning decision;
- block switching while a direct environment operation is applying;
- allow switching when only completed or terminal records remain;
- require the user to accept, decline, or cancel a waiting decision before
  switching; never hide, transfer, or leave it pending while another project
  becomes active;
- if cancellation is offered later, it must reach a terminal durable state
  before the switch commits;
- perform Workspace root synchronization before publishing the new project as
  active, and restore the old active identity if synchronization fails;
- emit one bounded switch outcome that the frontend and browser mock consume.

The UI may explain the blocking operation and navigate to it. It must not
silently cancel, reassign, or hide active work to make switching succeed.

### Retention And Provenance

Rho distinguishes four actions:

1. `hide`: remove an item from the ordinary UI without deleting durable
   evidence;
2. `prune_payload`: remove reconstructable or high-volume payload while
   retaining identity, metadata, digest, status, and provenance links;
3. `delete_record`: delete a durable record only after referential checks and
   an explicit confirmation appropriate to its impact;
4. `delete_file`: remove a project output through its own reviewed path and
   preserve a truthful missing/deleted Artifact state.

`Clear` must name which of these actions it performs. Run-to-Artifact and
environment evidence must not become silently false. Initial quotas and
retention defaults require a focused decision during BH4; until then, fixes
must preserve existing data and may add measurement without automatic pruning.

Emergency editor recovery data remains project-scoped, bounded, and visibly
clearable. Successful durable session recovery should remove obsolete
emergency copies. Sensitive content must not be added to telemetry or migration
reports.

### Artifact Model Boundary

For this repair plan:

- `plot_artifacts` is the bounded plot-display history and may contain prunable
  rendering payloads;
- `artifact_records` is the durable exported work-product and provenance
  record;
- both use the same canonical project identity and producing-run checks;
- plot payload pruning must not delete an exported Artifact record;
- no new fields or features should deepen the dual model before BH4 decides
  whether plot history remains a display cache or becomes an Artifact subtype.

WP3 remains the V1 Artifact authority. Any later unification is a separately
reviewed, additive, migration-safe change.

## Work Packages

### BH1: Project-Scoped Durable Identity

Priority: P0

Deliverables:

- add canonical project identity to run and Agent-turn draft, summary, detail,
  persistence, and indexes;
- make run, Problem, Agent history, recent conversation, and approval queries
  project-scoped;
- enforce stored-project equality in run retry and approval continuation;
- update Tauri commands, coordinator calls, frontend state, and browser/mock
  handlers together;
- exclude legacy-unscoped records from ordinary project endpoints;
- add two-project isolation fixtures and regression tests.

Acceptance gate:

> With projects A and B using the same application store, no run, Problem,
> Agent prompt, model reply, approval, or retry from A is listed, sent to a
> model, continued, or executed while B is active, and the inverse is also
> true.

Required negative tests include identical source filenames, rapid project
switching, Workspace R restart, failed runs, waiting approvals, and direct
store records that lack a project identity.

### BH2: Project-Switch State Machine

Priority: P0

Entry: BH1 accepted.

Deliverables:

- define one broker preflight result covering active run, Agent turn,
  approval, and environment operation;
- implement blocked, synchronized, committed, and failed/restored outcomes;
- keep old project state active until Workspace R synchronization succeeds;
- refresh only the newly committed project's files, sessions, Runs, Problems,
  Agent history, approvals, plots, Artifacts, and environment state;
- add deterministic browser/mock scenarios and visible non-destructive UI
  feedback;
- test failure between preflight, Workspace synchronization, persistence, and
  watcher replacement.

Acceptance gate:

> Project switching either commits one internally consistent project across
> broker, Workspace R, persistence, watcher, and UI, or leaves the previous
> project active with an explicit reason; it never publishes a mixed state.

### BH3: Transactional Schema v8 Migration

Priority: P0/P1

Entry: BH1 schema and legacy policy reviewed before merge. Migration may be
implemented in the same release branch as BH1 but has its own evidence gate.

Deliverables:

- introduce ordered migration functions with one transaction per supported
  version transition and an explicit final schema assertion;
- define the v7-to-v8 project-identity columns, nullability, indexes, and
  legacy-unscoped representation;
- provide fixture databases for every supported historical schema version;
- verify data preservation, idempotent reopen, foreign-key behavior, malformed
  metadata rejection, and rollback on injected failure;
- record a pre-migration backup or recoverable copy policy appropriate to the
  installed desktop application;
- add a bounded, content-free migration outcome for diagnostics;
- stop using a growing undifferentiated `ensure_column()` sequence for future
  semantic migrations.

Acceptance gate:

> Every supported historical fixture opens or fails according to a documented
> rule; a failed migration leaves a reopenable prior database or recoverable
> backup, and no record is silently assigned to the wrong project.

### BH4: Retention, Privacy, And Artifact Lifecycle

Priority: P1

Entry: BH1-BH3 accepted.

Deliverables:

- inventory stored prompts, responses, events, outputs, tracebacks, snapshots,
  plot payloads, Artifact metadata, and emergency editor data;
- define per-project measurement, quotas, retention defaults, pruning order,
  database maintenance, export, and deletion behavior;
- replace ambiguous Clear actions with hide, prune, or delete language and
  explicit effects;
- preserve referentially valid tombstones or metadata when payloads/files are
  removed;
- decide the long-term plot-display versus durable-Artifact relationship;
- add privacy-facing documentation and tests that deletion does not leak data
  into another project or remove unrelated project records.

Acceptance gate:

> A user can understand and control what is retained for one project, reclaim
> large payload storage without destroying the evidence graph, and delete
> selected durable data without affecting another project.

### BH5: Incremental Module Boundaries

Priority: P2

Entry: BH1-BH3 accepted. BH5 can proceed alongside BH4 only as behavior-neutral
refactoring with focused regression evidence.

Deliverables:

- extract store migration, run, Agent/approval, Artifact, and environment query
  modules behind the existing public store contract;
- group Tauri commands by project/session, runs/problems, Agent/approvals,
  environment, and Artifacts;
- split frontend command/mock registration, project/session state,
  runs/problems, Agent, environment, Artifact, and view rendering modules;
- keep one generated or tested command inventory so real Tauri and browser/mock
  support cannot drift silently;
- preserve static Tauri assets and current user-visible behavior.

Acceptance gate:

> Existing workflows and protocol tests remain unchanged while each durable
> domain has one discoverable command, query, mock, and test ownership path.

## Verification Matrix

| Risk | Automated evidence | Manual evidence |
| --- | --- | --- |
| Cross-project Agent context | captured provider request contains only active-project turns | switch A/B and inspect restored timelines and approvals |
| Cross-project run visibility | store and command A/B isolation tests | Runs and Problems change coherently after switching |
| Unsafe retry | mismatched and unscoped run IDs fail before dispatch | retry from current project works; foreign retry is unavailable |
| Mixed switch state | injected failure tests at every transition boundary | active work blocks switching with a useful route back |
| Migration corruption | historical fixtures, rollback, reopen, and idempotence tests | upgrade a copy of a representative user database |
| Provenance loss | referential and pruning tests retain required metadata | clear/prune language matches observed effects |
| Mock drift | command inventory parity and deterministic mock scenarios | browser and installed app show equivalent states |

Focused automated validation should include:

- `rho-store` unit and historical-fixture tests;
- coordinator tests that inspect the exact bounded Agent history supplied to
  the provider adapter;
- Tauri command tests for project injection and fail-closed retry/approval;
- frontend browser/mock tests for project switch, empty/loading/error states,
  and long Unicode paths;
- the existing `0.2.x` and `0.3.x` regression suites affected by store,
  execution, Agent, environment, plot, and Artifact changes.

On Windows, Rust validation uses the documented Rtools GNU toolchain path.
Passing automation is not a substitute for representative installed-app or
release acceptance.

## Failure And Recovery Rules

- If active project identity is unavailable, reject project-owned admission;
  do not create a global record.
- If a stored record has no authoritative identity, classify it as legacy
  unscoped and disable execution or continuation.
- If project normalization fails, retain the current project and surface the
  error without changing Workspace R cwd.
- If switch synchronization succeeds but a later commit step fails, recovery
  must either restore the old Workspace root or enter an explicit blocked
  recovery state; it must not claim either project is ready while identities
  disagree.
- If migration fails, do not advance schema metadata and do not start the
  application against a partially migrated store.
- If payload pruning fails, retain the record and report no reclaimed storage.
- Serialization failures remain visible; no command may report completion when
  durable state was not written.

## Coordination With Other Documents

### Active `0.3.x` handoff

The handoff remains authoritative for WP1-WP4 behavior and final milestone
acceptance. BH1-BH3 are baseline correctness repairs and may be approved before
milestone closure if they are required to make representative-project evidence
truthful. They must not broaden WP1-WP4 capability scope. Existing `0.3.x`
evidence affected by schema, project filtering, or switch behavior must be
rerun before milestone acceptance.

### Reproducibility Audit And Run Comparison

This plan owns the durable run-project identity and migration prerequisite.
RA-RC1 owns the later read-only comparison interface and derived comparison
semantics. RA-RC1 remains blocked until BH1-BH3 are accepted; it must consume
the canonical APIs from this plan and must not introduce a second identity or
legacy backfill rule.

### RStudio-Inspired Workflow

That proposal continues to own post-`0.3.x` capability direction. New Help,
Git, Quarto, job, debugger, and build records must use the same canonical
project identity and switch admission contract. BH5 may extract modules but
cannot implement those capabilities.

### Human/Agent Posture And Interface Modernization

Posture may project project-owned work into Direct, Monitor, or Review views;
modernization may style switch blockers, retention actions, and legacy states.
Neither proposal owns persistence, project reassignment, deletion semantics,
or concurrency policy. Visual Phase 1 work that does not touch those contracts
may still be approved independently.

### Intuitive Interaction And Guided Workflows

That proposal owns user-facing terminology, switch blockers, recovery actions,
and retention consequences projected from this plan. It cannot offer
cancel-and-switch before BH2, or hide/prune/delete behavior before BH4. Minimal
messages delivered with BH1-BH4 must remain truthful and should follow its
plain-language consequence and recovery structure.

### Public Workbench Protocol, CLI, And MCP

WB1-WB3 consume the canonical identity, scoped queries, fail-closed legacy
policy, migration, and switch-concurrency contracts from BH1-BH3. Public
adapters must not assign missing ownership to the current workspace. WB2 public
events may add a project-owned projection only through reviewed migration; BH4
continues to own Output payload retention and deletion semantics.

### Release And Acceptance

This plan does not retroactively change the exact `0.2.0-dev.12` candidate or
its GO/NO-GO record. Shipping these repairs requires a new candidate identity,
affected automated evidence, and installed-app acceptance. Existing release
evidence remains evidence for the exact build on which it was collected.

## Recommended Sequence And Stop Points

1. Approve BH1 contract and the v8 schema shape together.
2. Implement BH1 plus the minimum BH3 migration needed to persist identity.
3. Stop for privacy/isolation and historical-database review.
4. Implement BH2 and stop for project-switch failure-path review.
5. Complete remaining BH3 backup, fixture, and recovery evidence.
6. Decide BH4 retention defaults and Artifact direction before implementation.
7. Perform BH5 incrementally, one domain at a time, after behavioral gates are
   stable.
8. Re-run affected `0.3.x` acceptance evidence.
9. Only then authorize RA-RC1 or another feature that aggregates durable
   project evidence.

## Definition Of Done

This plan is complete only when:

- all project-owned durable entities admitted by current workflows carry a
  canonical project identity;
- project A/B isolation holds at store, broker, model-context, command, mock,
  and UI layers;
- retry and approval continuation fail closed for foreign or unscoped records;
- project switching is one tested state transition with deterministic recovery;
- schema v8 migrations pass supported historical fixtures and failure recovery;
- Clear, hide, prune, record deletion, and file deletion have distinct tested
  semantics;
- retention and emergency-recovery privacy behavior is documented;
- affected `0.2.x`/`0.3.x` regression evidence has been rerun;
- manual installed-app evidence is recorded separately from automation;
- the cross-review and roadmap reflect the accepted implementation state.

Until those conditions are met, implementation presence must not be reported
as completed baseline hardening, milestone acceptance, or release readiness.

## Open Decisions

These decisions must be closed at their named checkpoints rather than guessed
during implementation:

1. whether persisted identity in v8 is only a canonical root or a stable
   opaque `project_id` plus canonical root;
2. whether any existing authoritative record can deterministically backfill
   old runs or Agent turns, with proof reviewed case by case;
3. the installed-app backup location, retention count, and recovery UI for a
   failed database migration;
4. default per-project payload budgets and whether automatic pruning is
   permitted;
5. whether plot history remains a prunable display store or migrates to an
   Artifact subtype after WP3 compatibility review.

# Intuitive Interaction And Guided Workflows Proposal

Status: proposed product interaction design; implementation not authorized

Date: 2026-07-26
Scope: task-oriented interaction, progressive disclosure, guided recovery,
plain-language decisions, and low-friction daily workflows

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/project/active-document-cross-review.md`;
- `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`;
- `docs/plans/proposed-2026-07-20-human-agent-workbench-posture-design.md`;
- `docs/plans/proposed-2026-07-26-interface-modernization-plan.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md`;
- `docs/design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md`.

Implementation entry rule: this proposal requires explicit authorization and
must land as small workflow packages. UX1 may define copy, component, and
usability-test contracts without changing behavior. A package that changes
Agent routing, project switching, retention, durable state, or top-level
navigation waits for its owning backend or posture contract. Do not implement
this proposal as one frontend rewrite.

## Accepted Interaction Decisions

Accepted on 2026-07-26:

1. The default Agent composer has one `Ask Rho` entry. Rho begins in the least-
   authority policy lane capable of understanding the request and escalates
   only when a typed protected action is required. Ask/Plan/Act remain explicit
   broker policy classes and remain available through an advanced Agent control
   for expert use; they are not a permanent three-way choice in the default
   composer.
2. V1 blocks switching to another project while any approval capable of later
   continuation or mutation remains waiting. The user is routed to the pending
   decision and must accept, decline, or cancel it before project switching can
   commit. Human/Agent posture and Direct/Monitor/Review switching inside the
   same project remain allowed and preserve the pending decision.

These decisions close the corresponding UX4 and BH2 presentation questions.
They do not authorize implementation or weaken broker policy.

## Summary

Rho exposes a capable scientific workbench, but ordinary tasks still ask users
to understand internal concepts before knowing what to do. Visible concepts
include Workspace R, Agent runtime, Ask/Plan/Act, state and project revisions,
approval request IDs, session versus project clearing, and technical
environment-operation names. These are valuable for policy, diagnostics, and
audit, but they should not be prerequisites for editing code, running an
analysis, fixing a problem, or accepting a safe change.

This proposal makes the primary experience task-oriented:

> The user states a goal, Rho chooses the safe workflow, and the user is asked
> for one concrete decision only when a meaningful consequence requires it.

Technical truth remains available through progressive disclosure. Simplicity
comes from better defaults, clear consequences, and guided recovery, not from
hiding failures, weakening approvals, or pretending an operation succeeded.

## Product Outcome

A first-time R user should be able to:

1. open a project and identify the next useful action;
2. open or create a script without understanding session internals;
3. run the intended code and see exactly what was run;
4. find the result, warning, plot, table, or report produced by that run;
5. ask Rho for help without first choosing a policy mode;
6. understand a proposed action and its consequence before accepting it;
7. recover from common failures using one recommended next step;
8. switch projects without carrying work or history across boundaries;
9. manage visible history and storage without destroying reproducibility
   evidence accidentally.

Experts retain access to code, revisions, request IDs, provider details, raw
logs, provenance, and exact environment changes without organizing the primary
workflow around those details.

## Design Principles

### Goals Before Mechanisms

Primary labels describe the user's goal:

- `Run selected code`, not an execution protocol name;
- `Use locked package versions`, not only `renv restore`;
- `Record current package versions`, not only `renv snapshot`;
- `Apply changes to 2 files`, not `Approve`;
- `Stop analysis`, not only `Interrupt R`;
- `Open result`, not `Inspect artifact record`.

The mechanism appears as secondary text when useful.

### One Obvious Next Step

Every empty, waiting, failed, or completed state has at most one visually
primary next action. Secondary actions remain available but do not compete with
the recommended path. If no safe recommendation exists, Rho states what is
missing instead of presenting equally weighted controls.

### Recognition Before Recall

Controls carry enough context to recognize their effect. Users do not need to
remember what `Act`, a revision number, a prior toast, or an unlabeled icon
means.

### Progressive Disclosure Without Loss Of Truth

Information uses three layers:

| Layer | Purpose | Typical content |
| --- | --- | --- |
| Primary | complete the task | outcome, consequence, recommended action |
| Details | understand and review | changed files, code, packages, logs, provenance |
| Diagnostics | troubleshoot internals | workspace ID, revisions, request/run IDs, raw summaries |

Primary content never contradicts or overstates details. Diagnostics remain
copyable, but state and project revisions do not dominate the normal status bar
or Agent header.

### Ask At The Moment Of Consequence

Do not ask for a broad technical choice before its consequence is known.
Read-only help proceeds without a mutation prompt. Execution, file changes,
package changes, deletion, and other protected actions request a specific
decision immediately before admission.

Authorization remains narrow, explicit, and broker-enforced. Convenience does
not become silent session-wide permission.

### Safe Defaults And Reversible Actions

Defaults preserve work. Prefer hide, dismiss, retry, return, restore, and undo
over delete, discard, replace, and reset. If an action is irreversible, state
that before execution and confirm its exact impact.

### Preserve Context And Avoid Dead Ends

After running, fixing, approving, switching a view, or recovering, return the
user to the source, result, or decision that motivated the action. Toasts may
acknowledge success but cannot be the only durable outcome. Errors offer a
supported next action or explain why none is available.

### Expert Control Remains Available

Task-oriented defaults do not eliminate Console input, exact run scope,
context attachments, provider settings, logs, revisions, or provenance.
Expert controls live in stable menus or detail panels.

## Non-Goals

This proposal does not authorize:

- removing Ask/Plan/Act enforcement from the broker;
- treating natural-language intent as mutation permission;
- automatic approval based on confidence, model choice, or prior behavior;
- merging Agent approvals, file-edit review, and environment requests;
- hiding exact code or changes that require review;
- replacing Console or expert commands with chat-only interaction;
- a tutorial carousel, marketing tour, or persistent coach marks;
- another top-level navigation or durable Task model;
- redefining project identity, retention, or switch concurrency;
- adopting a frontend framework solely for this work;
- claiming scientific validity because a guided workflow completed;
- claiming release readiness from automation or screenshots alone.

## Current Interaction Debt

### Internal State Dominates Primary Surfaces

Revision numbers, Workspace R, Agent runtime, provider capability, and request
IDs appear where most users need an outcome and next step. These details have
no ordinary action and belong in diagnostics.

### Agent Intent Must Be Classified In Advance

The composer asks users to choose Ask, Plan, or Act before stating a goal. A
broad session authorization checkbox further separates permission from the
concrete operation it affects.

### Generic Decisions Hide Consequences

`Approve`, `Reject`, and `Cancel` describe dialog mechanics, not whether a
button runs code, writes files, changes packages, or dismisses a suggestion.

### Run Scope And Results Require Inference

A generic Run command can mean selection, current line, or file. Results are
then distributed across Console, Plots, Problems, Runs, Environment, and
Artifacts, leaving users to infer what ran and where the result went.

### Clear Has Multiple Hidden Meanings

Current Clear actions may hide UI, delete a payload, delete a durable record,
or affect a session or project. The effect is not predictable from the label.

### Errors Describe State Instead Of Recovery

Terms such as stale, revision mismatch, runtime, and provider status describe
implementation conditions but do not consistently say what remained safe or
what the user should do next.

### Configuration Appears Before It Is Needed

Provider type, API-key environment name, base URL, and tool-calling capability
are advanced settings. Normal use should focus on selecting a working
assistant or resolving one specific connection problem.

## Interaction Architecture

### Task Context

Every primary action is rendered from a bounded task context:

```text
active project
active document and saved/unsaved state
selection or cursor
active run or Agent work
latest relevant result or Problem
pending decision
available safe recovery actions
```

This is a UI projection over broker and editor state, not a new durable Task
entity. A future posture implementation may add tasks without changing this
interaction contract.

### Primary Action Resolver

Each surface deterministically computes a label, consequence, enabled state,
and disabled reason from explicit state:

| Context | Primary action | Confirmation |
| --- | --- | --- |
| editor selection | `Run selected code` | none for direct user execution |
| cursor on R code | `Run current line` | none |
| renderable document | `Render report` | only if another protected change is required |
| run has warnings | `Review 2 warnings` | none |
| failure has source | `Go to failing line` | none |
| Agent proposes execution | `Run this code once` | exact code review |
| Agent proposes edits | `Apply changes to 2 files` | reviewed diff |
| package restore preview | `Use locked package versions` | environment review |
| work blocks switching | `Return to running analysis` | none |

A model may suggest an action but cannot decide whether it is admitted,
primary, or permitted.

### Result Handoff

Every completed operation returns a bounded handoff:

```text
what completed
where the result is
warnings or incomplete evidence
recommended next action
links to source, run, output, and details
```

The handoff is derived from broker records and cannot claim output, save,
export, or environment success when serialization or persistence failed.

## Detailed Workflow Specifications

### UX-W1: First Open And Empty Project

No project selected:

- message: `Open an R project to begin`;
- primary action: `Open project`;
- secondary action: `Open recent project`, when entries exist;
- details link explains supported project/path behavior.

Empty project selected:

- show project name and location;
- primary action: `Create analysis script`;
- secondary actions: `Open an existing file` and `Ask Rho about this project`;
- use a real create-file dialog, not a browser prompt;
- show filename, file type, and destination before creation.

Existing project with no document:

- show recent supported files;
- primary action opens the most recent available document;
- alternatives include file search and create file;
- never execute startup files or restore hidden `.RData` automatically.

Acceptance: a first-time user opens a fixture project, opens or creates a
script, and identifies Run without using a menu or architecture terminology.

### UX-W2: Files, Unsaved Work, And Recovery

Create-file dialog requirements:

- project-relative path and inferred file type;
- destination preview;
- inline validation for outside-project, duplicate, invalid, and unsupported
  paths;
- primary action `Create file`.

Closing, switching projects, reloading an external change, and exiting use one
decision pattern:

- title names the file or file count;
- primary action `Save and continue`;
- secondary action `Keep editing`;
- destructive action `Discard changes`;
- multiple files use a reviewable list, not sequential confirmations.

Emergency recovery appears only when recovered content differs from durable
state. It lists project-relative files and offers `Review recovered changes`,
`Restore all`, and `Discard recovery`. It never overwrites current files before
review and removes obsolete recovery data after successful save or discard.

Acceptance: no migrated file workflow uses browser `prompt()` or a generic
confirm; every destructive choice states file count and provides a route back.

### UX-W3: Run Code And Find Results

The primary label states scope:

- `Run selected code` for a selection;
- `Run current line` for executable code at the cursor;
- `Run file` from the explicit file action;
- `Render report` for rendering;
- `Run again` only when source scope and project identity still match.

During execution, name the scope, show elapsed time and source, and provide one
`Stop` action when supported. View changes do not lose the active indicator.

Completion prioritizes the most consequential result:

- failure or warning requiring attention;
- new report, plot, or table;
- relevant changed object;
- concise Console result when no richer result exists.

Examples:

- `Finished with 2 warnings` / `Review warnings`;
- `Created qc-plot.png` / `Open plot`;
- `report.html is ready` / `Open report`;
- `Stopped before completion` / `Return to source`;
- `No visible output` / explain that execution completed without displayed
  output.

Acceptance: for selection, line, file, warning, failure, plot, table, and
render fixtures, users can say what ran and locate the result without searching
more than one unrelated panel.

### UX-W4: Problems And Guided Recovery

Every failure presents:

1. plain-language title;
2. what happened;
3. what was not changed or remains safe;
4. one recommended action;
5. useful alternatives;
6. expandable copyable diagnostics.

| Technical state | Primary message | Recommended action |
| --- | --- | --- |
| stale revision | `The file changed before the action could be applied` | `Review updated suggestion` |
| R error with source | `Analysis stopped at analysis.R:42` | `Go to line 42` |
| Agent unavailable | `Rho cannot reach the selected assistant` | `Check connection` |
| missing API key | `This assistant needs an API key` | `Add API key` |
| render unavailable | `This report cannot be rendered yet` | `View setup steps` |
| switch blocked | `An analysis is still running in this project` | `Return to analysis` |
| unsafe historical retry | `This run cannot be repeated safely here` | `Open original project`, when known |
| migration failure | `Rho could not update its history database` | supported restore or diagnostics action |

Problems may offer `Go to code`, `Explain this problem`, `Review suggested
fix`, safe `Run again`, and `Copy technical details`. Explanation visibly
attaches bounded Problem/source context and grants no mutation authority.

Acceptance: users select safe recovery without interpreting stale, revisions,
workspace IDs, or provider capability flags.

### UX-W5: One Agent Entry And Intent Escalation

The default Agent surface presents:

- one input labelled `Ask Rho`;
- visible, removable context attachments;
- an assistant selector only when multiple usable choices matter;
- one Send action;
- contextual examples only in the empty state.

Ask/Plan/Act remain broker policy classes but are not required as a permanent
three-way choice in the default composer. A request begins in the least-
authority lane capable of understanding it. If a protected action is needed,
the Agent produces a typed proposal and the UI escalates at that point.

An advanced Agent control exposes Ask, Plan, and Act for users who need an
explicit policy choice. It is visually secondary, explains the selected
policy, and never changes because the user switches layout or posture. The
default composer remains one entry even when an expert policy is selected.

Rules:

- verbs such as `fix`, `run`, or `update` express intent but do not authorize;
- UI never silently changes from read-only to mutation authority;
- unavailable tools produce a limitation and supported alternative;
- advanced users may access explicit policy behavior if the accepted posture
  design retains it;
- switching layout or posture never changes permission.

The default path removes the broad `Authorize Act R execution for this session`
checkbox. Any future repeated-operation grant needs a separate contract for
operation class, project, duration, revocation, visibility, and audit.

Acceptance: explanation, planning, execution requests, and edit requests use
one entry; read-only work avoids mutation prompts and every protected action
retains typed broker review.

### UX-W6: Consequence-Based Review

Approval records remain separate, but visible reviews consistently answer:

- What will Rho do?
- Why is it needed?
- What will change?
- What will not change?
- Can it be undone?
- What evidence will be recorded?

Request IDs, revisions, raw arguments, and exact code appear under Technical
details. Exact code and diffs remain directly visible when they are the
substance of review.

| Proposal | Primary action | Return/decline |
| --- | --- | --- |
| one R execution | `Run this code once` | `Not now` |
| file edit | `Apply changes to 2 files` | `Keep current files` |
| environment restore | `Use locked package versions` | `Keep current packages` |
| environment snapshot | `Record current package versions` | `Not now` |
| stop work | `Stop analysis` | `Keep running` |
| permanent history deletion | `Delete 24 conversation entries` | `Keep history` |

Avoid Approve/Reject/Cancel when a specific verb exists. Closing means `Decide
later` only when the request may safely remain waiting.

After a decision, keep a durable summary in context, including result link,
review/undo when supported, and truthful failure or decline language.

Acceptance: users predict operation, scope, reversibility, and primary-button
effect for every existing approval lane.

### UX-W7: Project Switching

Project switching projects the BH2 state machine into a simple workflow.

Normal switching marks the current project, lists recent projects, and restores
the selected project as one coherent transition. Internal normalization remains
hidden unless it fails.

Unsaved changes offer `Save and switch`, `Keep working here`, and `Discard
changes and switch` after listing affected files.

Active work presents:

```text
Analysis is still running

Rho will keep this project open until the analysis stops.

[Return to analysis]  [Stop analysis and switch]
```

The second action exists only when safe cancellation is supported, and switch
does not commit until cancellation is terminal. A waiting decision capable of
later continuation or mutation blocks the switch and routes to `Review pending
action`; the user must accept, decline, or cancel it first. Never hide,
transfer, or leave it waiting while another project becomes active. Switching
workbench posture inside the same project remains available and keeps the
pending action visible. A failed switch states which project remains open and
offers one recovery.

Acceptance: users understand a blocker and return to it; no shortcut weakens
atomic switching or cross-project isolation.

### UX-W8: Environment Operations In User Language

| Technical operation | Primary label | Supporting text |
| --- | --- | --- |
| initialize | `Start managing project packages` | `Create a lockfile for reproducible versions` |
| restore | `Use locked package versions` | `Match project packages to renv.lock` |
| snapshot | `Record current package versions` | `Update renv.lock from the project library` |

`renv` remains visible as mechanism and in details. Preview summarizes added,
removed, upgraded, downgraded, unchanged, unavailable, and uncertain packages.
Completion names package, lockfile, Workspace-library, warning, and next-step
effects. Never promise rollback without a tested backend contract.

### UX-W9: Outputs Instead Of Storage Taxonomy

The primary term is `Outputs`, with Plot, Table, Report, and File types.
`Artifact` and provenance remain in details and engineering documentation.

Each output shows name, type, time, status, source/run, availability, primary
action, and `How this was created`. A missing file is not successful. A pruned
plot preview is not confused with deletion of an exported plot file.

### UX-W10: History, Clear, Delete, And Storage

Bare `Clear` is not used for different effects:

| Intent | Label | Explanation |
| --- | --- | --- |
| remove temporary selection | `Dismiss` | no durable effect |
| stop ordinary display | `Hide from this view` | record remains under retention policy |
| reclaim payload | `Free preview storage` | previews affected; evidence retained |
| delete conversations | `Delete conversation history` | project, count, permanence |
| delete output record | `Delete output record` | provenance and file behavior |
| delete project output | `Delete output file` | path, record behavior, reversibility |

Scope is always This session, This project, or an explicit count. Default never
means all projects. Use Undo or trash where supported; otherwise state that
deletion is permanent. UI consumes BH4 semantics and never invents frontend-
only deletion.

### UX-W11: Model And Provider Setup

Normal state shows assistant name and status only when action is needed.
Provider implementation, API-key environment name, base URL, and capabilities
remain advanced settings.

No usable assistant triggers a guided flow: choose service, provide credential
through the supported mechanism, test, select a working model, and return to the
preserved draft. Errors identify the failed step and offer a specific action:
`Add API key`, `Check address`, `Use for questions only`, `Choose another
model`, or `View technical details`.

### UX-W12: Notifications And Persistent Outcomes

Toasts are limited to acknowledgements such as `Saved analysis.R`. They cannot
be the only location for failed persistence, scientific warnings, pending
decisions, interrupted work, recovery failure, missing output, or service setup.
Important outcomes remain in their source, run, Problem, Agent, Output, or
Environment context until resolved or dismissed.

## Language And Content Contract

Use this formula:

```text
specific outcome or problem
short consequence or safety statement
recommended action
optional details
```

Avoid raw internal status alone, blame, false reassurance, vague `Done`, vague
`OK`/`Continue`/`Approve`, double negatives, and raw exception strings as the
only message.

| Internal term | Default term | Internal term remains in |
| --- | --- | --- |
| Workspace R | `R session` or `analysis session` | details/diagnostics |
| Agent runtime | `assistant connection` | assistant diagnostics |
| artifact | `output` plus type | provenance details |
| approval request | exact proposed operation | audit details |
| revisions | no primary label | technical details |
| stale | describe what changed | diagnostic status |
| retry run | `Run again` | run details |
| renv initialize | `Start managing project packages` | environment details |
| renv restore | `Use locked package versions` | environment details |
| renv snapshot | `Record current package versions` | environment details |
| interrupt | `Stop analysis` | technical/session menu |

Review terms in complete workflows, not as an isolated string table.

## State Presentation Contract

| State | Required presentation |
| --- | --- |
| ready | primary action; no redundant success noise |
| loading | name what loads; preserve layout |
| running | name operation/scope; supported Stop action |
| waiting | exact decision at point of work |
| completed | result and next action |
| warning | consequence and result usability |
| failed | preserved work, recovery, diagnostics |
| stopped | distinguish user stop from failure; truthful partial result |
| changed/stale | changed input, disabled old action, refresh/review |
| unavailable | missing capability and setup/fallback |
| empty | reason and context-specific first action |

Color never carries state alone. Dynamic labels and counters use stable
dimensions so they do not shift the layout.

## Accessibility And Input Methods

- workflows are keyboard-complete without drag or hover;
- dialog focus enters on open and returns to its invoker on close;
- result focus changes only when it helps and does not disrupt typing;
- icon-only controls have names and tooltips;
- destructive and safe alternatives differ without color;
- screen-reader announcements are concise and do not repeat streaming logs;
- field errors include correction text;
- zoom, 100%/125% Windows scaling, Unicode paths, and translated strings do not
  clip primary actions;
- time-dependent notifications remain available persistently.

## Work Packages

### UX1: Interaction Foundation And Copy Inventory

Priority: P0 UX foundation

Deliverables:

- inventory primary actions, prompts/confirms, empty states, toasts, errors,
  approval labels, internal IDs, and Clear actions;
- define shared message, consequence, review, result-handoff, and technical-
  details components;
- define terminology and state contracts;
- add deterministic mock fixtures;
- create task-based usability protocol and baseline measurements;
- make no unsupported backend behavior claim.

Acceptance:

> Every decision has a named operation, scope, consequence, recovery behavior,
> and owning backend contract; no ambiguous Clear or generic approval remains
> undocumented.

UX1 may coordinate with modernization Phase 1, retaining separate evidence.

### UX2: First Use, Files, Run, And Results

Priority: P0. Entry: UX1 accepted.

Deliver contextual empty states, product file/recovery dialogs, dynamic Run
scope, persistent result handoff, and focused keyboard/Unicode/parity tests.

Acceptance:

> A novice opens a project, creates or opens a script, runs intended scope,
> locates its result, and recovers work without menus, browser prompts, or
> architecture terminology.

### UX3: Guided Problems And Project Switching

Priority: P0/P1. Entry: UX1 and baseline-hardening BH1-BH3 accepted for changed
history or switching behavior.

Deliver unified recovery presentation, Problem actions, BH2 switch projections,
foreign/legacy fail-closed messages, and active/pending/stale/failure fixtures.

Acceptance:

> Users select safe recovery while tests prove UI cannot bypass admission or
> publish mixed-project state.

### UX4: Agent Entry And Consequence-Based Decisions

Priority: P1. Entry: the accepted single-entry/advanced-policy decision above
is reflected in the posture implementation contract and BH1-BH3 are accepted.

Deliver one Agent entry, least-authority routing presentation, removal of broad
session authorization from default UI, operation-specific reviews, guided
assistant setup, and provider-request tests for isolation and authorization.

Acceptance:

> Users ask, plan, request execution, and request edits through one entry;
> protected actions retain exact broker-owned review.

### UX5: Environment, Outputs, And Retention

Priority: P1. Entry: accepted `0.3.x` behavior and BH4 before implementing hide,
prune, record-delete, or file-delete.

Deliver goal-oriented environment language, Outputs projection, exact history
actions, storage management, and persistent completion/recovery.

Acceptance:

> Users predict package, file, payload, record, and provenance effects before
> acting.

### UX6: Expert Details, Consistency, And Polish

Priority: P2. Entry: UX2-UX5 accepted for implemented scope; coordinate with
accepted posture and modernization structural phases.

Deliver consistent disclosure, keyboard/focus/tooltips/status behavior,
searchable diagnostics, removal of redundant internal badges, and installed-
app acceptance across viewports/scaling.

Acceptance:

> Novice workflows remain direct, expert evidence remains locatable, and
> ordinary work requires no internal identifier.

## Verification And Usability Contract

### Deterministic Fixtures

Browser/mock and Tauri validation cover:

- no, empty, existing, and unavailable projects;
- clean, dirty, externally changed, and recovered files;
- line, selection, file, render, warning, failure, stopped, and no-output runs;
- read-only Agent answer, execution/edit proposals, waiting/declined decisions,
  serialization failure, and unavailable assistant;
- environment initialize, restore, snapshot, no-op, stale, failed, and partial
  evidence;
- ready, missing, pruned, incomplete, and deleted-file outputs;
- normal, blocked, cancelled, failed, and restored project switching;
- all state-contract states, Unicode paths, verbose errors, narrow windows, and
  100%/125% scaling.

Every new visible Tauri state receives a mock handler in the same package.
Screenshot readiness remains fallback evidence when Edge DOM capture is empty.

### Task-Based Usability Scenarios

Test with users comfortable with basic R but unfamiliar with Rho internals:

1. open a project and run a selected expression;
2. find and explain an R error;
3. ask Rho to propose and apply a small correction;
4. review one R execution without prior Ask/Plan/Act teaching;
5. restore packages from a lockfile preview;
6. locate an output created by a run;
7. switch projects while work is active;
8. reclaim preview storage without deleting an exported output;
9. recover work after simulated abnormal close;
10. resolve an unavailable assistant and return to the preserved draft.

Record completion without intervention, time to first correct action, unsafe
attempts, backtracking, consequence understanding, safety understanding after
failure, unexplained terminology, and accessibility blockers.

Initial targets:

- at least `4/5` representative participants complete each P0 scenario without
  intervention;
- at least `90%` predict protected-action consequences correctly;
- `0` cross-project, silent-mutation, or destructive-scope errors;
- median result discovery takes one navigation step after completion;
- no P0 task requires interpreting revisions, workspace ID, or request ID;
- critical workflows are keyboard-complete.

Small samples do not establish broad usability. Repeated misunderstanding is a
finding even when numbers pass.

### Automated Evidence

- exact primary labels and disabled reasons for fixtures;
- admission tests proving presentation cannot bypass policy;
- project A/B and foreign/legacy fail-closed tests;
- focus, keyboard, accessible-name, and live-region checks;
- no raw exception as sole message for mapped failures;
- no bare Clear in implemented scoped surfaces;
- no browser prompt or generic destructive confirm in migrated flows;
- layout/overflow checks;
- Tauri/mock command and state parity.

Automation cannot prove understandable copy or intuitive workflow. Manual
usability and installed-app review remain required.

## Coordination With Other Documents

### Implemented Baseline Hardening

Hardening owns project identity, fail-closed history, switch concurrency,
migration, and retention. This proposal owns their user projection. UX3 cannot
invent cancel-and-switch before BH2; UX5 cannot rename Clear while backend
effects remain ambiguous.

### Human/Agent Workbench Posture

Posture owns Human-first/Agent-first, Direct/Monitor/Review, task direction, and
top-level switching. This proposal owns task-level intent entry, decisions,
recovery language, and disclosure. The accepted contract uses one default
`Ask Rho` entry and an advanced Ask/Plan/Act control. Posture never changes
permission and intent never authorizes mutation.

### Interface Modernization

Modernization owns tokens, icons, component presentation, responsive layout,
themes, and motion. This proposal owns workflow priority, action meaning,
content hierarchy, and recovery. UX1 may supply semantic requirements while
modernization Phase 1 supplies visual foundations.

### Active `0.3.x` Handoff

The handoff owns environment, Viewer, Artifact, and skill contracts. This
proposal may translate them into goal language and handoffs but cannot merge
request lanes, change provenance, or expand feature scope. Rerun affected
milestone evidence after behavioral UI changes.

### RStudio-Inspired Workflow And Reproducibility Audit

Future Help, Git, Quarto, jobs, debugger, and build features adopt this
interaction contract but are not authorized by it. Audit/comparison retain
deterministic evidence authority; Agent explanation stays optional.

### Public Workbench Protocol, CLI, And MCP

That proposal owns external semantic types, local CLI/MCP, event replay, and
external-execution admission. This proposal owns their user-facing projection
inside Rho. WB1/WB2 remain read-only and add no competing frontend; WB3 review
uses consequence-based language and cannot treat MCP invocation as permission.

### Release Acceptance

Workflow, permission presentation, switching, environment confirmation, file
recovery, and deletion changes require installed-app acceptance on the exact
candidate. Automation and browser screenshots do not establish readiness.

## Recommended Sequence

1. Approve UX1 and inventory interactions/copy.
2. Coordinate UX1 components with modernization Phase 1.
3. Complete BH1-BH3 before switch or Agent-history behavior changes.
4. Implement UX2 first: first use, files, Run scope, and result handoff.
5. Implement UX3 over accepted BH2 and error taxonomy.
6. Reflect the accepted single-entry/advanced-policy decision in the posture
   implementation contract.
7. Implement UX4 without weakening broker policy.
8. Close BH4, then implement UX5.
9. Coordinate UX6 with accepted posture and modernization phases.
10. Run installed-app task-based usability acceptance before completion.

## Definition Of Done

This proposal is complete only when:

- ordinary workflows require no knowledge of internal runtimes, revisions,
  request IDs, or Artifact storage terminology;
- default Agent entry does not require preselecting Ask/Plan/Act;
- every protected operation retains typed broker admission and concrete review;
- default UI has no broad unrestricted session Act authorization;
- Run states exact scope and points to results;
- errors state what happened, what remained safe, and recommended recovery;
- project switching truthfully projects atomic switching;
- no bare Clear conceals hide, prune, record-delete, or file-delete;
- environment actions use goal language with exact previews;
- Outputs remain understandable without losing provenance truth;
- important failures and decisions persist beyond toasts;
- P0 workflows pass automated, keyboard, parity, usability, and installed-app
  acceptance;
- cross-review and roadmap reflect accepted implementation status.

Rename to `active-` only for an authorized package and to `implemented-` only
after all in-scope workflows and acceptance gates complete.

## Open Decisions

1. whether a bounded repeated-operation grant warrants a separate contract;
2. which result wins when warnings and several outputs coexist;
3. which deletions support Windows trash or Undo;
4. first UI language and localization process for technical R terminology;
5. whether `R session` or `analysis session` tests clearer;
6. minimum guided assistant setup before advanced provider details appear.

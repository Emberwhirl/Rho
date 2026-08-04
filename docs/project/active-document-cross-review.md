# Rho Active And Proposed Document Cross-Review

Status: active documentation coordination record

Review date: 2026-08-04
Scope: unfinished or acceptance-active specifications, plans, and release gates

Manual acceptance ownership: the runnable example workflow and candidate-level
evidence template are `test/acceptance-project/MANUAL-ACCEPTANCE.md` and
`test/acceptance-project/acceptance-results/CANDIDATE-RESULT-TEMPLATE.md`.
These records are queued and currently NOT RUN; they do not replace exact
release-candidate or package-specific acceptance gates.

## Purpose

This record prevents unfinished documents from being implemented as competing
sources of truth. It records lifecycle status, authority, dependencies, and the
conditions that permit future work. It does not replace the underlying design
or acceptance documents.

## Authority Order

When documents overlap, use this order:

1. accepted ADRs define durable architecture decisions;
2. the active development roadmap defines milestone order and product gates;
3. an active milestone or release contract defines implementation scope,
   schemas, sequencing, and acceptance for that milestone or candidate;
4. an active feature specification governs only its named feature and cannot
   redefine a milestone or release GO decision;
5. proposed direction, posture, and visual plans require explicit authorization
   and cannot amend an active contract implicitly.

At the same level, stop and amend the relevant documents before implementation
when two contracts define different state, persistence, approval, or acceptance
semantics.

## Status And Ownership Matrix

| Document | Status after review | Owns | May proceed when |
| --- | --- | --- | --- |
| `project/active-development-governance.md` | active | required proposal-to-release development lifecycle, risk/test depth, review, versioning, and evidence rules | applies continuously to all non-trivial work |
| `project/active-development-roadmap.md` | active | milestone order and acceptance gates | continuously maintained from accepted evidence |
| `plans/accepted-2026-07-25-0.3x-scientific-workflow-handoff.md` | active implementation contract; WP1-WP4 code landed, automated review accepted with follow-up, milestone manual acceptance open | `0.3.x` environment, viewer, artifact, skill contracts and final acceptance | remaining representative-project and manual UI acceptance; affected evidence reruns after BH1 |
| `release/active-0.2.0-release-hardening-spec.md` | engineering complete; release acceptance active | exact `0.2.0-dev.12` hardening and evidence contract | remaining candidate acceptance only |
| `release/active-0.2-release-checklist.md` | active | sole `0.2.0-dev.12` GO/NO-GO checklist | P0 human evidence against the exact candidate |
| `design/active-2026-07-25-about-and-update-check-design.md` | implementation active; live and installed acceptance open | About/update V1 and Pages gates | its own live/installed acceptance; inclusion in `0.2.0` needs a revised candidate contract |
| `plans/active-2026-07-26-bh1-project-scoped-durable-identity-handoff.md` | accepted; Wave 1 exit gate passed | canonical project identity, project-scoped durable queries/context, retry and approval-continuation admission, and legacy-unscoped fail-closed behavior | BH4 is accepted; BH5 is active |
| `plans/active-2026-07-27-bh3-transactional-schema-v8-migration-handoff.md` | accepted | transactional `v7 -> v8` migration, fail-closed historical rejection, same-directory recoverable backup, and bounded migration diagnostics | BH4 is accepted; BH5 is active |
| `plans/active-2026-07-28-bh2-project-switch-state-machine-handoff.md` | accepted | broker-owned project-switch preflight, blocked/synchronized/committed/failed-restored outcomes, and deterministic switch recovery | BH4 is accepted; BH5 is active |
| `plans/active-2026-07-29-bh4-retention-privacy-artifact-lifecycle-handoff.md` | accepted | project-scoped retention, truthful hide/prune/delete semantics, artifact and plot lifecycle rules, tombstones/retained metadata, and privacy-facing documentation/tests | BH4 verification, independent review, and acceptance gate are complete |
| `plans/active-2026-07-31-bh5-incremental-module-boundaries-handoff.md` | accepted | behavior-neutral extraction of store and command modules by durable domain (runs, Agent, Artifacts, environment, project/session) | BH5 extraction and regression evidence complete per domain |
| `plans/active-2026-07-31-ra-rc1-run-comparison-handoff.md` | accepted | read-only deterministic two-run comparison over existing durable records | RA-RC1 is accepted; UX1 active |
| `plans/active-2026-07-31-ux1-interaction-foundation-handoff.md` | accepted | interaction inventory, terminology contract, state presentation contract, mock fixtures, usability protocol | UX1 accepted; UX2 may proceed |
| `plans/active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md` | active; implementation and automated/browser verification complete 2026-08-02 | simplified Agent entry and current Agent-first Direct presentation only | policy and authority boundaries preserved; installed-app acceptance remains open; broader UX4 work still requires separate authorization |
| `plans/active-2026-08-02-agent-first-intuitive-modernization-spec.md` | active; implementation and automated/browser verification complete 2026-08-02 | second-round Agent-first navigation, progressive activity disclosure, and presentation density | internal posture/surface values and all authority boundaries preserved; installed-app acceptance remains open |
| `plans/active-2026-08-03-agent-first-adaptive-work-surface-spec.md` | active; UX4-AWS1 implementation and automated/browser verification complete 2026-08-03 | simple default Agent-first Task surface and explicitly opened file/run/Artifact/audit work surfaces over existing entities | installed-app acceptance remains open; no new Task schema or audit scope |
| `plans/active-2026-08-04-interface-modernization-foundation-shell-spec.md` | active; M1 implementation and automated/browser verification complete 2026-08-04 | presentation-only semantic tokens, shared controls, local icons, shell hierarchy, tab roles, focus, and responsive geometry | installed-app/display-scale acceptance open; themes and workflow-surface redesign remain proposed |
| `plans/active-2026-08-04-interface-modernization-workbench-hierarchy-spec.md` | active; M2 implementation and automated/browser verification complete 2026-08-04 | Human-first editor hierarchy, existing tab and panel geometry presentation, and correct restoration of the existing `human_preset` value | installed-app/display-scale acceptance remains separate; themes remain proposed |
| `plans/active-2026-08-04-interface-modernization-scientific-agent-surfaces-spec.md` | active; M3 implementation and automated/browser verification complete 2026-08-04 | presentation-only status language, scientific/Agent state hierarchy, and distinction among existing review lanes | installed/display-scale acceptance remains separate; `0.3.x` manual gates remain open; Phase 4 remains proposed |
| `plans/active-2026-08-04-plot-payload-normalization-repair-spec.md` | active; PLOT-PAYLOAD-1 implemented and automated/browser verified 2026-08-04; installed acceptance open | canonical PNG base64 ingress plus compatible historical preview/export | WP3 provenance/export, BH4 retention, and M3 presentation boundaries preserved; rebuilt installed-app confirmation remains open |
| `plans/active-2026-08-04-windows-project-path-console-window-repair-spec.md` | active; WIN-PATH-GIT-1 implemented and automated verification complete 2026-08-04 | Workspace R project-path projection and Windows no-console policy for existing supervised Git commands | canonical containment, project identity, switching/recovery, and all Git guards preserved; installed confirmation remains open |
| `plans/active-2026-08-02-console-logs-separation-spec.md` | active; CL1 implemented and automated/browser evidence passed | frontend-only separation of the Workspace R Console transcript from operational and Agent Logs | installed-app/manual acceptance remains open and separate |
| `plans/active-2026-08-02-ws4-reviewable-git-mutations-spec.md` | active; implementation and automated/browser verification complete 2026-08-02 | guarded local Git review, hunk/file stage/unstage, confirmed restore, and commit UI over the supervised CLI | installed-app acceptance remains open; repository replacement/adversarial hardening remain separate |
| `plans/active-2026-08-03-ws4-adversarial-git-hardening-spec.md` | active; WS4-G2 implementation, review, and automated verification complete 2026-08-03 | fail-closed repository/path/output admission and adversarial backend fixtures for the existing supervised Git workflow | repository replacement remains separate; no UI, schema, remote, or credential scope |
| `plans/active-2026-08-03-ws4-repository-replacement-spec.md` | active; WS4-G3 implementation, review, and automated verification complete 2026-08-03 | repository-instance-bound stale guards and disposable replacement/recovery fixtures | no Git identity persistence, frontend/schema, remote, credential, clone, or init scope |
| `plans/active-2026-08-03-ws3-broker-data-query-spec.md` | active; WS3-Q1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | Workspace-owned literal search, stable sort, matched paging, visible-page export replay, and frontend/mock query states | richer value presentation remains separate; no schema, Workspace mutation, public protocol, or TanStack scope |
| `plans/active-2026-08-03-ws3-type-missing-presentation-spec.md` | active; WS3-Q2 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | additive Workspace-owned column type/cell-state metadata and truthful frontend/mock rendering | WS3-Q1 query/export authority remains unchanged; no schema, mutation, public protocol, tree, plot, or TanStack scope |
| `plans/active-2026-08-03-render-cancellation-reconciliation-spec.md` | active; P2-3A implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | exact render-job cancellation, restart reconciliation, and truthful frontend/mock terminal states | Runs remain durable authority; Artifact linkage stays separate P2-3B scope; no second job store or execution authority |
| `plans/active-2026-08-03-render-artifact-linkage-spec.md` | active; P2-3B implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | exact completed render job to existing durable `render_output` Artifact presentation | WP3 remains Artifact authority; P2-3A terminal truth unchanged; no schema, second record, or broader Viewer scope |
| `plans/active-2026-08-03-ws1-lockfile-inventory-spec.md` | active; WS1-L1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded read-only lockfile/installed union comparison and Environment presentation | WP1 project-root/status authority preserved; dependency/source and all package mutation remain separate |
| `plans/active-2026-08-03-ws1-dependency-source-spec.md` | active; WS1-L2 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | evidence-bound direct/transitive role and credential-safe package source presentation | WS1-L1 union/comparison authority preserved; WS2 navigation and all package mutation remain separate |
| `plans/active-2026-08-03-ws1-package-mutation-spec.md` | active; WS1-M1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | single-package install/update/remove through the dedicated environment request lane | accepted WP1 lifecycle/evidence authority preserved; WS1 inventory is read-only evidence; no lockfile, arbitrary source, global-library, or general network authority |
| `plans/active-2026-08-03-ws2-local-help-location-spec.md` | active; WS2-H1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded installed package, local Help record, and safe source-reference presentation after project-definition miss | accepted Go-to-Definition and hover lanes reused; full Rd/examples/vignettes and WS1 provenance remain separate |
| `plans/active-2026-08-03-ws2-bounded-project-references-spec.md` | active; WS2-R1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded token-aware project reference discovery and editor navigation | accepted Go-to-Definition and project file containment remain authoritative; rename/refactor and persistence remain separate |
| `plans/active-2026-08-03-ws2-installed-help-and-example-spec.md` | active; WS2-H2 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded installed Rd/version/vignette presentation and confirmed ordinary Workspace example execution | WS2-H1 location truth and existing Run/Problems/execution authority preserved; no package mutation, Agent citation, or hidden Rd execution |
| `plans/active-2026-08-03-ws2-diagnostic-grouping-quick-fix-spec.md` | active; WS2-D1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded lintr normalization, deterministic Problems grouping, and stale-safe reviewed editor-buffer quick fixes | existing Problems and Agent persistent file-edit lanes preserved; no automatic save, multi-file edit, schema, or new write authority |
| `plans/active-2026-08-03-ws2-agent-local-help-link-spec.md` | active; WS2-AH1 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | explicit Workspace-derived Local Help context linked to one durable Agent answer | WS2-H1/H2 retain Help truth; Agent turn/event persistence is reused; no model-derived evidence, schema, execution, or approval authority |
| `plans/active-2026-08-03-ws2-refactor-review-spec.md` | active; WS2-R2 implementation, review, and automated/browser verification complete 2026-08-03; installed acceptance open | bounded project-token rename and same-file whole-line extract-function proposals applied only to editor buffers | WS2-R1 owns reference discovery; WS2-D1 owns single diagnostic fixes; no automatic save, Agent/Git/environment mutation, schema, or semantic scope claims |
| `plans/active-2026-08-03-ws2-formatting-review-spec.md` | active; WS2-F1 implementation and automated/browser verification complete 2026-08-03; installed acceptance open | optional Workspace R/styler formatting preview bound to one open document version, with editor-buffer-only Apply/Save/Undo | refactor/quick-fix contracts retain their own edit semantics; no frontend formatter, provider fallback, automatic save, Agent/Git/environment mutation, or semantic correctness claim |
| `plans/active-2026-08-03-ew-cr2-structural-claim-review-spec.md` | active; implementation and automated/browser verification complete after five repair commits 2026-08-03; installed acceptance open | project-scoped claim records, exact source/Artifact anchors, same-project Evidence links, and deterministic structural review statuses | Evidence entries remain EW-CR1 authority; WP3 owns Artifact provenance; BH1/BH3 own identity/migration; no semantic verdict, Agent authority, export, public protocol, or publication acceptance |
| `plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md` | proposed broader direction; BH1-BH5 accepted, RA-RC1 authorized, and Waves 4-14 not authorized | BH1-BH5 baseline-hardening direction beyond the focused active handoffs | BH5 acceptance; RA-RC1 active |
| `design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md` | proposed; independently cross-reviewed | task-level interaction, intent entry, consequence-based decisions, guided recovery, progressive disclosure, and user-facing terminology | UX1 may define contracts; behavioral packages wait for their owning hardening, posture, or feature entry gates |
| `design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md` | proposed; independently cross-reviewed | WB1 public read-only semantic contract, WB2 authenticated local CLI/MCP/events, and WB3 broker-admitted external R execution | `0.3.x` and BH1-BH3 accepted; each WB package separately authorized and stopped for review |
| `design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md` | proposed; independently cross-reviewed; RA-RC1 authorized under `active-2026-07-31-ra-rc1-run-comparison-handoff.md` | read-only deterministic audit and two-run comparison semantics | `0.3.x` milestone acceptance plus an approved RA-RC1 interface checkpoint and durable run-project identity contract |
| `design/proposed-2026-07-26-evidence-workspace-and-claim-review-design.md` | proposed; independently cross-reviewed | project-scoped scholarly evidence entries, citation normalization, claim-to-evidence linkage, and bounded claim-review semantics | `0.3.x` milestone acceptance, BH1-BH3 acceptance, RA-RC1 acceptance, and a separately authorized EW-CR1 handoff |
| `design/proposed-2026-07-26-rstudio-inspired-workflow-design.md` | proposed umbrella direction; partially implemented through separately accepted packages; reconciled 2026-08-02 | post-`0.3.x` scientific capability direction across WS1-WS7 | remaining WS1/WS2/WS3/WS4/WS5/WS6/WS6A scope and all WS7 work require separate focused authorization; implementation and manual acceptance remain distinct |
| `plans/proposed-2026-07-20-human-agent-workbench-posture-design.md` | proposed | Human/Agent posture and Direct/Monitor/Review information architecture | open decisions close and a separate posture package is approved |
| `plans/proposed-2026-07-26-interface-modernization-plan.md` | proposed umbrella; focused M1-M3 implemented with automated/browser verification 2026-08-04 | visual tokens, icons, component presentation, responsive behavior, themes | installed/display-scale acceptance remains open; Phase 4 requires separate approval |
| `plans/proposed-2026-08-01-next-phase-task-plan.md` | proposed coordination plan; focused P2/P3 packages reconciled 2026-08-02 | current decomposition of remaining acceptance gates and proposal gaps | each unchecked work package requires a focused handoff; P1 gates remain blocking |
| `architecture/proposed-aisdk-family-change-proposals.md` | proposed and deferred | catalog of possible upstream seams | a concrete current gap and separate cross-repository approval exist |

## Implemented Status Corrections

- `implementation/implemented-wp2-data-viewer-interface.md` is implemented in
  `8982b12`; its focused evidence is in `verification/wp2/`.
- `implementation/implemented-wp4-project-skills-interface.md` is implemented
  in `2415c3f` and hardened in `3d45af2`; its focused evidence is in
  `verification/wp4/`.
- These corrections do not close the `0.3.x` milestone. Package implementation,
  focused verification, milestone acceptance, and public release are separate
  states.

## Resolved Cross-Document Conflicts

### Navigation and layout state

The Human/Agent posture and task-oriented Task/Runs/Review navigation are now
implemented through the focused UX4 contracts. The adaptive-work-surface
contract owns the simple Agent-first Task default and contextual file, run,
Artifact, and audit surfaces. The modernization plan may style these states and
the Human-first Code/Analyze/Agent selector but cannot replace them, create a
competing top-level state, or change persistence semantics. The focused
2026-08-04 M1 contract authorizes presentation-only foundation and shell
hierarchy work. The separate M2 contract owns Human-first editor hierarchy,
existing tab/panel geometry presentation, and correction of the existing
`human_preset` restoration path without adding persistence or top-level state.
Scientific/Agent workflow-surface redesign and themes remain unauthorized.

The focused M3 contract may restyle and reorganize projections of existing
Runs, Problems, Plots, Environment, Agent events, approvals, and file-edit
proposals. It cannot redefine their status values, persistence, revisions,
mutation consequences, approval ownership, or recovery actions. Direct UI
environment requests and Agent approvals remain visibly and operationally
separate. Phase 4 remains unauthorized.

The intuitive-interaction proposal may improve task-level wording, empty
states, Run scope, result handoff, and recovery without defining another
top-level navigation. Posture continues to own Human-first/Agent-first and
Direct/Monitor/Review. Modernization continues to own visual presentation.

### Agent intent and permission presentation

The intuitive-interaction proposal owns one default natural-language entry and
consequence-based escalation. It does not remove broker Ask/Plan/Act policy or
make natural-language intent an authorization. The posture proposal owns any
expert-visible placement of those policy modes and top-level Agent navigation.

The accepted decision uses one default `Ask Rho` entry, starts in the least-
authority policy lane capable of understanding the request, and retains
Ask/Plan/Act in an advanced Agent control. Posture changes do not change
permission, and protected actions retain their typed approval, file-edit, or
environment-operation lane.

### Scientific operations and approval lanes

The active `0.3.x` contract owns direct environment-operation requests and
their dedicated dialog. Agent approvals, file-edit acceptance, and environment
operations remain separate broker records and decision surfaces. Posture and
modernization work may project or restyle them but cannot merge them.

### Artifacts and review

Implemented WP3 artifact records and provenance are the V1 authority. The
RStudio-inspired proposal may sequence richer artifact capabilities. The
posture proposal may define how artifacts are navigated and reviewed, but any
version, link, annotation, finding, or acceptance schema must be an additive,
migration-safe extension of WP3 after a focused design.

### Scholarly evidence workspace and claim review

The evidence-workspace proposal owns project-scoped scholarly evidence entries,
citation normalization, bounded evidence excerpts, and claim-to-evidence
linkage. It does not replace WP3 Artifact provenance, RA-RC internal evidence,
package help, or a full manuscript/publication system.

The accepted separation is:

- WP3 Artifact provenance answers what source, run, and environment produced a
  project result;
- RA-RC answers whether internal project evidence is reproducible and how runs
  differ;
- the evidence workspace answers which external scholarly evidence a project
  claim cites and whether that linkage is structurally reviewable.

An external citation does not satisfy internal reproducibility evidence, and a
clean internal audit does not prove that a manuscript claim is literature-
grounded. Claim-review statuses therefore remain bounded to `linked`,
`missing_evidence`, `unresolved_source`, `incomplete_evidence`, and
`cross_project_rejected`; they are not semantic truth verdicts.

The RStudio-inspired proposal continues to own broader post-`0.3.x`
capability sequencing. The evidence-workspace proposal narrows only the
scholarly evidence/claim slice and explicitly restricts core implementation to
small-footprint permissive-license components and open-data providers. Hosted
platforms and heavier literature services remain optional later connectors and
may not become the sole core dependency.

### Reproducibility audit and run comparison

The reproducibility proposal is a read-only derived evidence layer over
existing run, environment snapshot, Problem, and WP3 Artifact records. It does
not create a second audit database, durable review-finding lifecycle, Artifact
acceptance state, task model, job system, or repair channel. Its deterministic
facts remain independent of optional Agent explanation.

RA-RC1 is the first recommended post-`0.3.x` evidence workstream, but it is
blocked until baseline-hardening BH1-BH3 provide canonical authoritative
project identity, fail-closed historical commands, and accepted migration
evidence. Project
identity must not be inferred from source paths, current UI state, timestamps,
or Artifact filenames. RA-RC2 static project audit follows only after RA-RC1
acceptance and retains explicit parser, scan, and evidence limitations.

### Implemented baseline hardening

The baseline-hardening plan owns repair of project identity, project-scoped
queries and model context, retry/continuation admission, project-switch
concurrency, schema migration, and retention semantics. It does not own a new
scientific capability or UI information architecture.

BH1-BH3 are prerequisites for any proposed feature that reads, compares,
continues, or executes historical project records. Existing WP1-WP4 contracts
remain authoritative for their feature behavior; affected evidence must be
rerun after hardening. Legacy records without authoritative ownership remain
explicitly unscoped and cannot be assigned from paths, timestamps, current UI
state, or filenames. Interface and posture proposals may present hardening
states but cannot redefine their persistence or concurrency rules.

The intuitive-interaction proposal projects BH2 switch blockers and BH4
retention semantics into user language. It cannot offer `Stop and switch`,
Undo, hide, prune, or delete behavior until the corresponding backend contract
exists and is tested.

For BH2 V1, any waiting approval capable of later continuation or mutation
blocks switching to another project. The user must accept, decline, or cancel
it first. Switching Human/Agent posture or Direct/Monitor/Review within the
same project remains allowed and preserves the pending decision.

### Background jobs

The RStudio-inspired workflow proposal owns the future broker job capability
contract. A posture implementation may display those jobs in Monitor or Review
but cannot define a second runtime, policy, or persistence model.

Quarto is the first scheduled broker-owned local-job adapter in Wave 13. The
RStudio-inspired proposal owns its typed render/job behavior; implemented WP3
continues to own V1 Artifact records and provenance. Quarto exit status defines
process success, while parsed diagnostics are bounded projections into the
existing Problems model. The adapter must not authorize a generic shell or
arbitrary process command.

`targets` follows the accepted Quarto/local-job contract in Wave 14. The
`targets` package owns `_targets` metadata and pipeline semantics; Rho owns
project/environment admission, durable job state, cancellation/restart
reconciliation and Artifact links. A pipeline process is not Workspace R or
Agent R, and importing a result into Workspace R is a separate recorded action.

### Editor Intelligence And Problems

Monaco remains the frontend editor. Air and R `languageserver` are alternative
providers behind one Rho-owned bounded language-service contract, not parallel
authorities. Wave 8 selects one primary provider; Wave 9 integrates it before
adding `lintr`. Provider results are bound to canonical project identity and
document versions and cannot redefine BH1-BH3 project ownership or switching.

The existing Problems model remains authoritative. Language-service, `lintr`,
Quarto and later job diagnostics identify their producer and are normalized,
bounded and deduplicated; no provider receives its own durable Problems store.
Formatting, quick fixes and refactors continue through reviewed file edits and
cannot bypass Agent proposal/Accept or direct user save semantics.

### Viewer Component Boundary

TanStack Table may own frontend virtualization, focus, selection and column
presentation in Wave 10. Implemented WP2 remains authoritative for supported
object classes, server-side pages, sorting/filtering semantics, byte and
dimension limits, state revisions and stale-object rejection. Implemented WP3
continues to own export and provenance; frontend table state cannot claim a
full-object export or current scientific truth.

### Git Ownership And Mutation

The RStudio-inspired proposal owns the future typed Git capability and prefers
`gitoxide` as an implementation candidate. BH1 owns canonical project identity;
Git must independently validate repository identity and current diff/revision.
Git history does not replace Rho runs, approvals or Artifact provenance.

Wave 11 is read-only. Wave 12 mutations require an exact selected file or hunk,
preserve unrelated dirty work, and use a Git-specific policy/recovery contract.
The public Workbench Protocol cannot expose Git mutation before the internal
contract is accepted. Credentials, remotes and network mutation remain outside
Waves 11-12.

### Public Workbench Protocol, CLI, and MCP

The public-protocol proposal owns the externally consumable semantic projection,
its independent version/schema/error contract, authenticated local CLI/MCP
transports, project-scoped event replay, and the later external-execution
admission contract. It does not replace the current internal framed protocol,
desktop frontend, coordinator, store, approval lanes, or Workspace R authority.

WB1-WB2 remain read-only and wait for `0.3.x` plus baseline-hardening BH1-BH3.
No public adapter may fill missing record ownership from the active workspace,
source path, timestamp, or filename. WB3 additionally requires a separate
security/approval checkpoint; external host confirmation is evidence, not Rho
authorization by default. A new Web control plane, thin-desktop migration,
remote gateway, and non-loopback deployment remain outside WB1-WB3.

### Implementation sequences

The `0.3.x` work-package sequence remains the historical authority for the
current scientific milestone. Other documents' Phase A-D or Phase 1-4 labels
are local to those documents and do not unlock, supersede, or run inside a
`0.3.x` package without an explicit contract amendment.

The cross-proposal schedule is the Wave 0-14 Implementation Program in
[`active-development-roadmap.md`](active-development-roadmap.md). This record
defines the coordination constraints that apply to that schedule:

The current program state is **Waves 1-14 implementation code committed (2026-08-01)**.
BH1-BH5 are accepted with verification evidence. RA-RC1, WB1, WB2, UX4, RA-RC2,
WS2 (Air selected), WS3 (basic table), WS4 (git CLI), WS6 (async Quarto job),
WS6A (targets read-only inspection), and WS9 (lintr) are committed. Per-wave
verification and manual acceptance evidence are pending for Waves 4-14; each
exit gate must be independently closed. The next-phase task plan
(`proposed-2026-08-01-next-phase-task-plan.md`) decomposes the remaining work
into sequenced work packages.

| Wave | Coordination result |
| --- | --- |
| 0 | `0.3.x`, exact `0.2.0-dev.12` release acceptance, and About/update acceptance may proceed independently; no track's evidence closes another track |
| 1 | BH1 is the primary implementation; UX1 and modernization Phase 1 may run only as contract, inventory, fixture, usability-baseline, token, icon, dimension, and behavior-neutral component work |
| 2 | BH3 retains a migration gate even when developed with BH1 schema work; BH2 waits for BH1 and owns project-switch truth; UX cannot promise switching or recovery semantics early |
| 3 | RA-RC1 is the first new post-`0.3.x` capability and stops for review; it remains read-only and cannot create a second evidence store |
| 4 | UX2 owns the novice first-use-to-result workflow; modernization may style it but cannot introduce structural posture navigation |
| 5 | WB1 owns the public read-only semantic boundary; no CLI, MCP, or external execution contract may become authoritative first |
| 6 | WB2 owns authenticated local CLI/MCP/events and remains read-only; cross-platform transport validation consumes the accepted WB1/WB2 contract |
| 7 | RA-RC2 precedes a separately selected EW-CR1, UX3, UX4, or UX5 package; BH4 precedes retention/deletion, posture precedes UX4 Agent-entry placement, and EW-CR1 requires accepted `0.3.x`, BH1-BH3, and RA-RC1 evidence |
| 8 | Retain Monaco and compare Air with R `languageserver`; select one primary backend before product integration |
| 9 | Integrate the selected language backend, then normalize optional `lintr` findings into Problems; providers never write files directly |
| 10 | TanStack Table may enhance the UI only; implemented WP2/WP3 remain data, bounds, staleness, export and provenance authorities |
| 11 | `gitoxide` read-only status/diff/history only, bound to canonical project and repository identities |
| 12 | Selected Git mutations require their own stale/rejection/failure/recovery gate; no credentials or remotes |
| 13 | Freeze a narrow local-job contract through Quarto rendering; no arbitrary process execution or second Artifact store |
| 14 | Stop after read-only `targets` inspection, then separately authorize execution and pipeline-to-Quarto composition |

Only one new post-`0.3.x` product-capability stream may be implemented at a
time. Independent acceptance/release work and behavior-neutral design-system
foundation may run in parallel. Parallel work must not depend on an unaccepted
schema, public protocol, navigation state, approval lane, project-switch rule,
or retention behavior.

Moving between waves is not implicit authorization. For each bounded package,
record entry evidence, activate or create its focused implementation handoff,
update this matrix, and name the next mandatory stop point. Later packages in
the same proposal remain proposed.

### Release boundaries

The active release checklist is the sole GO/NO-GO authority for the exact
`0.2.0-dev.12` candidate. About/update V1 was implemented afterward and has its
own Pages and installed-app gates. It cannot be included in, block, or validate
that candidate retroactively; inclusion requires a revised candidate and new
affected evidence.

### aisdk family work

No upstream `aisdk` family change is on the current `0.3.x` path. The proposal
is a deferred catalog. Every external repository change requires a newly
demonstrated gap and separate approval; `aisdk.bioc` remains deferred beyond
`0.3.x`.

## Remaining Open Gates

All installed-app/UI items below are intentionally consolidated under the
candidate checklist and example workflow named above. Completing automated or
browser evidence does not check them off.

- complete the `0.3.x` representative-project reproducibility workflow
  and manual three-viewport UI acceptance;
- retain the passing 2026-07-26 final cross-package validation evidence and
  rerun it after any affected repair (BH1-BH5 and Waves 4-14 may have shifted
  storage, query, migration, or switching behavior);
- retain the accepted WP3 runtime DOM evidence; fresh `1024 x 768` and narrow
  captures remain part of manual acceptance;
- retain the current WP4 package-check result of zero errors, warnings, and
  notes; the local roxygen version mismatch prevented re-documentation;
- complete `0.2.0-dev.12` P0 installed-application acceptance and distribution
  decision;
- complete About/update live endpoint and exact installed-candidate acceptance;
- close per-wave verification and manual acceptance evidence for Waves 4-14;
- define additive artifact acceptance semantics before posture Phase C;
- approve only one Phase-3 capability workstream at a time per the next-phase
  task plan.

## Implementation Start Checklist

Before implementing any unfinished document:

1. follow `active-development-governance.md` and classify the change/risk;
2. identify the owning row in the matrix above;
3. verify its entry condition is satisfied with locateable evidence;
4. confirm no higher-authority active contract forbids or narrows the change;
5. amend conflicts before editing product code;
6. keep browser/mock behavior aligned with Tauri state changes;
7. preserve dedicated mutation and approval lanes;
8. report version/NEWS outcome, automated evidence, manual acceptance,
   worktree state, and release decision as separate facts.

# Rho Active And Proposed Document Cross-Review

Status: active documentation coordination record

Review date: 2026-07-26
Scope: unfinished or acceptance-active specifications, plans, and release gates

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
| `plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md` | active; WP1-WP4 code landed, milestone acceptance open | `0.3.x` environment, viewer, artifact, skill contracts and final acceptance | only integration review, regression repair, and milestone closure without an amendment |
| `release/active-0.2.0-release-hardening-spec.md` | engineering complete; release acceptance active | exact `0.2.0-dev.12` hardening and evidence contract | remaining candidate acceptance only |
| `release/active-0.2-release-checklist.md` | active | sole `0.2.0-dev.12` GO/NO-GO checklist | P0 human evidence against the exact candidate |
| `design/active-2026-07-25-about-and-update-check-design.md` | implementation active; live and installed acceptance open | About/update V1 and Pages gates | its own live/installed acceptance; inclusion in `0.2.0` needs a revised candidate contract |
| `plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md` | proposed; independently cross-reviewed | canonical durable project identity, project-switch concurrency, schema v8 migration, retention semantics, and behavior-neutral module boundaries | explicit approval; BH1-BH3 precede features that aggregate or execute historical project records |
| `design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md` | proposed; independently cross-reviewed | task-level interaction, intent entry, consequence-based decisions, guided recovery, progressive disclosure, and user-facing terminology | UX1 may define contracts; behavioral packages wait for their owning hardening, posture, or feature entry gates |
| `design/proposed-2026-07-26-public-workbench-protocol-cli-mcp-design.md` | proposed; independently cross-reviewed | WB1 public read-only semantic contract, WB2 authenticated local CLI/MCP/events, and WB3 broker-admitted external R execution | `0.3.x` and BH1-BH3 accepted; each WB package separately authorized and stopped for review |
| `design/proposed-2026-07-26-reproducibility-audit-and-run-comparison-design.md` | proposed; independently cross-reviewed | read-only deterministic audit and two-run comparison semantics | `0.3.x` milestone acceptance plus an approved RA-RC1 interface checkpoint and durable run-project identity contract |
| `design/proposed-2026-07-26-rstudio-inspired-workflow-design.md` | proposed | post-`0.3.x` scientific capability direction and sequencing | one focused workstream is approved after `0.3.x` acceptance or explicit rescheduling |
| `plans/proposed-2026-07-20-human-agent-workbench-posture-design.md` | proposed | Human/Agent posture and Direct/Monitor/Review information architecture | open decisions close and a separate posture package is approved |
| `plans/proposed-2026-07-26-interface-modernization-plan.md` | proposed | visual tokens, icons, component presentation, responsive behavior, themes | Phase 1 may be separately approved; structural phases wait for posture coordination |
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

The posture proposal owns any future Human/Agent top-level state and
Direct/Monitor/Review navigation. The modernization plan may style current
Code/Analyze/Agent controls but cannot freeze a competing top-level state or
persistence model. Until posture is accepted, structural modernization beyond
the visual foundation is not authorized.

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

- record the complete `0.3.x` representative-project reproducibility workflow;
- run and record the final cross-package validation suite;
- resolve or explicitly accept WP3 DOM-capture evidence limitations;
- retain WP4 R package check warnings/notes as visible debt until corrected;
- complete `0.2.0-dev.12` P0 installed-application acceptance and distribution
  decision;
- complete About/update live endpoint and exact installed-candidate acceptance;
- close posture open decisions before structural navigation implementation;
- define additive artifact acceptance semantics before posture Phase C;
- resolve durable run-to-project identity before RA-RC1 implementation;
- approve and complete baseline-hardening BH1-BH3 before any feature aggregates
  or executes historical project records;
- accept WB1 before CLI/MCP/event work, and accept read-only WB2 before any WB3
  external execution work;
- approve only one post-`0.3.x` capability workstream at a time.

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

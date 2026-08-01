# BH4 Retention, Privacy, And Artifact Lifecycle Handoff

Status: accepted

Authorization date: 2026-07-29
Authorized by: project owner
Owning direction:
`proposed-2026-07-26-implemented-baseline-hardening-plan.md`
Change/risk class: D3 / R3 safety-critical foundation
Baseline for authorization: `55104e6`

## Authorization And Program Position

BH4 is explicitly authorized as the only active post-BH3/BH2 Wave 2 baseline
hardening package. This authorization does not reactivate BH1-BH3, does not
activate BH5, UX1, RA-RC1, WB1, or any other proposed package.

Wave 1 is accepted and closed at the BH1 isolation gate. BH3 transactional
migration is accepted on current-source evidence. BH2 project-switch state
machine is accepted on current-source evidence. The `0.3.x`
representative-project and manual UI acceptance tracks remain open, but they do
not block this bounded retention/privacy repair.

BH4 begins only as a focused contract/implementation package for project-owned
retention, prune/delete semantics, and Artifact lifecycle truthfulness. BH5 and
all later packages remain unauthorized until separately activated.

## Accepted Decisions

### Retention and deletion vocabulary

- BH4 must replace ambiguous `Clear` language with explicit `hide`, `prune`,
  `delete record`, or `delete file` terminology and truthful effects.
- BH4 V1 must distinguish bounded presentation history from durable evidence
  and provenance.
- Reclaiming payload/file storage must not silently erase unrelated durable
  evidence or cross-project records.

### Privacy and project boundary

- Retention, pruning, and deletion behavior is project-scoped and may not leak
  data into another project.
- Deletion in one project must not remove or mutate unrelated project records.
- Privacy-facing behavior for prompts, responses, logs, plot payloads,
  Artifact metadata/files, and emergency editor recovery data must be
  documented and testable.

### Artifact and evidence boundary

- BH4 must preserve referentially valid tombstones or metadata when payloads or
  files are removed.
- BH4 owns the decision on the long-term relationship between bounded
  plot-display history and durable Artifact records.
- Export/provenance semantics must remain truthful when payloads are pruned or
  files are deleted.

### Storage policy boundary

- BH4 V1 must define per-project measurement, quotas, retention defaults,
  pruning order, and database maintenance behavior.
- Storage pressure behavior must be bounded, explicit, and non-destructive
  beyond the action the user selected.
- BH4 does not authorize background heuristics that silently delete durable
  provenance.

## Scope

BH4 implements:

- inventory and classification of stored prompts, responses, events, outputs,
  tracebacks, snapshots, plot payloads, Artifact metadata, files, and
  emergency editor data;
- one truthful action model for `hide`, `prune`, `delete record`, and
  `delete file`;
- project-scoped retention measurement, quotas, defaults, pruning order, and
  maintenance rules;
- referentially valid tombstone or metadata behavior when payloads/files are
  removed;
- tests and documentation proving deletion/pruning does not leak across
  projects or destroy unrelated records.

BH4 may amend only the broker/store/desktop/frontend surfaces directly needed
to make retention and deletion semantics truthful, plus the documents/tests
required to keep that contract accurate.

## Non-Goals

BH4 does not authorize:

- BH5 module extraction beyond the smallest refactors needed to land BH4;
- recovery UI, cancel-and-switch, or any new switch behavior owned by BH2;
- RA-RC1, evidence workspace, Workbench Protocol, Git, jobs, editor, or
  navigation work;
- deleting durable provenance merely because a user clears a visible panel;
- cross-project cache sharing, second stores, or inferred ownership rules;
- public-release claims from BH4 implementation alone.

## Required Invariants

1. Every retention/prune/delete action is project-scoped and cannot delete or
   mutate another project's retained data.
2. Large payload storage can be reclaimed without breaking the evidence graph or
   orphaning durable records.
3. User-facing wording matches actual behavior; `hide`, `prune`, and `delete`
   are not synonyms.
4. When payloads/files are removed, surviving records remain referentially
   valid through tombstones or retained metadata.
5. BH1-BH3 project identity, migration, switch isolation, and blocker/recovery
   behavior remain unchanged.

## Implementation Slices

### BH4-A: Retention inventory and action vocabulary

- inventory retained data classes and current `Clear` behaviors;
- define one bounded action vocabulary with truthful user-facing effects;
- stop for privacy/terminology review before destructive behavior broadens.

### BH4-B: Project-scoped quotas, prune order, and tombstones

- implement per-project measurement, quotas, retention defaults, and prune
  order;
- add tombstone/metadata preservation where payloads/files can be removed;
- stop for storage/evidence review before UI behavior broadens.

### BH4-C: Deletion controls, docs, and affected validation

- wire delete/prune/hide behavior through the current desktop/frontend path;
- add privacy-facing documentation and affected tests;
- rerun the affected matrix and stop for BH4 acceptance review.

Each slice must leave the repository buildable and testable. No slice may land
an ambiguous or cross-project destructive behavior as a temporary state.

## Required Verification

Focused and full affected coverage must include:

- hide/prune/delete actions remain confined to the active project;
- pruning payloads preserves referentially valid Artifact or plot-history
  records;
- deleting a file does not silently delete unrelated metadata/evidence;
- storage measurement and quota enforcement are per-project, not global
  leakage;
- emergency editor or other recovery data follows documented privacy behavior;
- browser/mock and desktop wording remain truthful for the implemented action
  set.

Required final commands are expected to include at least:

```powershell
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test --workspace
cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test
```

Add narrower targeted tests while iterating. Record any unrun installed-app or
manual acceptance as not yet run.

## Version And Documentation Decision

Authorization alone does not change application or R package versions and does
not require a `NEWS.md` entry. Before BH4 acceptance, decide version/NEWS
impact from the implemented behavior and update the broader proposal, roadmap,
cross-review, and verification evidence from true facts only.

## Acceptance Gate

BH4 is accepted only when:

> A user can understand and control what is retained for one project, reclaim
> large payload storage without destroying the evidence graph, and delete
> selected durable data without affecting another project.

## Next Mandatory Stop

Stop at BH4 acceptance review. Do not begin BH5 or any later package until the
project owner separately authorizes it and the cross-review matrix is updated.

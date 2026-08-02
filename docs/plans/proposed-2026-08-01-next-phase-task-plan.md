# Next-Phase Task Plan

Status: proposed coordination plan; reconciled after focused P2/P3 packages

Date: 2026-08-01
Last reconciled: 2026-08-03
Scope: post-Waves-1-14 implementation sprint, closing acceptance gates and
completing remaining proposal capabilities

Cross-reviewed against:

- `docs/project/active-development-roadmap.md`;
- `docs/design/proposed-2026-07-26-rstudio-inspired-workflow-design.md`;
- `docs/design/proposed-2026-07-26-evidence-workspace-and-claim-review-design.md`;
- `docs/plans/proposed-2026-07-26-interface-modernization-plan.md`;
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`.

Implementation entry rule: each phase requires explicit authorization before
product-code work begins. This plan defines the decomposition and sequence; it
does not authorize implementation. Each work package must be separately
authorized with a focused handoff.

## Background

Waves 1-14 implementation code is committed in the current source baseline.
Focused follow-up packages for data-viewer completion, render polling, package
inventory, project-local go-to-definition, evidence workspace, chunk discovery
and batch execution, and Git conflict resolution are also committed. The
roadmap, NEWS, and version metadata reflect baseline `0.4.0-dev.0`.

This plan remains `proposed` as an umbrella coordination record. Completed
items below were authorized by their own accepted specifications; unchecked
items remain unauthorized until a focused contract is activated.

## Phase 1: Close Acceptance Gates (blocking)

These are the remaining Wave 0 items from the roadmap. No new capability work
should begin before they are resolved.

### P1-1: M1 Release Acceptance

- [ ] Clean-install acceptance on Unicode paths
- [ ] Clean-install acceptance on paths with spaces
- [ ] Clean-install acceptance on large projects (2,000+ files)
- [ ] Repeatable manual acceptance record for the complete QC correction
  workflow
- [ ] Explicit decision about unsigned internal versus signed public
  distribution

### P1-2: 0.3.x Milestone Acceptance

- [ ] Representative-project reproducibility workflow verification
- [ ] Manual UI review
- [ ] Rerun affected cross-package automated suite (BH1-BH5 modifications
  may have shifted storage, query, migration, or switching behavior)

## Phase 2: Complete Existing Implementation Gaps

Capabilities with committed code that fall short of their proposal contracts.

### P2-1: WS4 Git Completion

Current state: the supervised system Git CLI now has a guarded review surface
for working/staged files and hunks, explicit restore confirmation, staged
revision-bound commit, conflict resolution, browser/mock parity, and adversarial
repository hardening and repository-bound replacement guards. All planned WS4
capability items are complete; installed-app acceptance remains separate.

- [x] Hunk-level stage and unstage
- [x] File restore with explicit user confirmation
- [x] Resolve explicitly selected conflict content
- [x] Decide the current V1 implementation boundary: retain the supervised Git
  CLI rather than migrating to `gitoxide`; any future migration is separate
- [x] Fail-closed fixtures for worktrees, nested repositories, symlinks,
  case-only paths, non-UTF-8 metadata, and large diffs
- [x] Repository replacement handling
- [x] Complete staging/commit UI and browser/mock parity for all accepted
  mutation commands

### P2-2: WS3 Table Interaction Completion

Current state: server-owned paging/sort, page-size selection, a frozen
identifier column, row-count presentation, and keyboard navigation are
implemented in the existing vanilla table.

- [x] Server-owned paging and sort authority
- [x] Page-size selection and row-count presentation
- [x] Frozen identifier column
- [x] Current keyboard navigation contract
- [x] Broker-owned filtering and search
- [x] Richer type/missing-value presentation and any separately justified
  column interaction; TanStack Table remains deferred

### P2-3: render_document_job Robustness

Current state: asynchronous submission, frontend polling, exact cancellation,
restart reconciliation, completion/failure feedback, and render Artifact
linkage are implemented.

- [x] Frontend job-status polling and completion/failure feedback
- [x] Cancellation and restart reconciliation
- [x] Render result to Artifact provenance link

## Phase 3: New Capability Implementation

Select one workstream at a time. Each requires a separate focused handoff and
acceptance gate.

### P3-1: WS1 Package And Environment Completion (P0 priority)

From the RStudio-inspired workflow proposal, capability-decision table row 1:

- [x] Searchable installed-package inventory
- [x] Searchable lockfile inventory and installed-versus-locked comparison
- [x] Direct versus transitive dependency and package-source display
- [x] Bounded status and change preview before `renv` initialization,
  restore, or snapshot
- [x] Exact operation, project root, revisions, repositories, and expected
  changes bound to a single-use confirmation
- [x] Dedicated direct-UI environment operation request records
- [x] Before/after immutable environment evidence linked to the operation run
- [x] Truthful failure/cancellation states without rollback claims
- [x] No silent installation of `renv`, `BiocManager`, or other packages
- [x] Individual package install/remove/update workflow, if separately
  authorized; it remains outside the accepted read-only inventory package

### P3-2: WS2 Editor Enhancement

Implemented focused packages and remaining proposal items after selecting Air:

- [x] Dynamic package-function completion and signature help
- [x] Hover help through the Workspace bridge with non-blocking fallback
- [x] Project-local go to definition with Help fallback
- [x] Optional `lintr` findings projected into Problems
- [x] Package source/help locations beyond the current Help fallback
- [ ] Find project references with bounded results
- [ ] Full installed-version Help: arguments, examples, vignettes, package
  version, and recorded execution of a selected example
- [ ] Deterministic diagnostic grouping and reviewable quick fixes
- [ ] Agent answers linked to the resolved local Help record
- [ ] Refactoring: rename symbol and extract function as reviewable
  document-version-bound workspace edits
- [ ] Document-version-bound formatting proposals (never auto-apply)

### P3-3: EW-CR1 Evidence Workspace

From the evidence-workspace-and-claim-review design proposal. Requires
accepted 0.3.x, BH1-BH3, and RA-RC1 evidence.

- [x] Minimal scholarly citation normalization and DOI resolution
- [x] Project-scoped evidence entries linked to a producing run or Artifact
- [x] Project-scoped evidence curation and search surface
- [ ] Structural claim-to-evidence linkage and bounded review status

The minimal EW-CR1 package is complete. Its accepted spec explicitly excludes
structural claim-to-evidence status; that broader semantic review remains owned
by the proposal and is not implied by these completed items.

## Longer-Term Deferred Items

Capabilities mentioned in proposals but deferred to later milestones:

| Item | Document | Reason |
|------|----------|--------|
| WS6A pipeline execution | RStudio-inspired workflow | Targets read-only inspection done; execution needs separate authorization |
| Debugger (DAP) | Roadmap M4 | Ark-dependent; after local workflows are dependable |
| Package document/test/build/check jobs | RStudio-inspired workflow WS7 | Package-development workflows deferred |
| Interface Modernization Phase 2+ | modernization plan | Waits for posture decisions to stabilize |
| Cross-platform beta | Roadmap M3 | After Windows contract is stable |
| Remote execution / Slurm | Roadmap M4 | After local provenance is reliable |

## Execution Sequence

```
P1-1 (M1 release) → P1-2 (0.3.x acceptance)
    ↓
P2-1 (WS4 UI/hardening) → P2-2 (WS3 filter/search) → P2-3 (durable render lifecycle)
    ↓
P3-1 (remaining WS1) → P3-2 (remaining WS2)
    ↓
WS6A execution or WS7 only after separate authorization
```

- Keep no more than one Phase-3 product-capability workstream in
  implementation at a time.
- Acceptance and release tracks may run in parallel when their evidence is
  independent.
- Stop at every work-package checkpoint. Reconcile tests, manual evidence,
  version/NEWS impact, document lifecycle, remaining debt, and worktree
  state before authorizing the next package.

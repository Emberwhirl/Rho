# Next-Phase Task Plan

Status: proposed

Date: 2026-08-01
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
The roadmap, NEWS, and version metadata have been updated to reflect this
(2026-08-01, baseline `0.4.0-dev.0`). No further architecture spikes should
begin before the existing acceptance gates are closed and the remaining
implementation gaps are addressed.

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

Current state: status, log, diff, stage, and commit work via the system git
CLI. Remaining proposal contract items:

- [ ] Hunk-level stage and unstage
- [ ] File restore with explicit user confirmation
- [ ] Resolve explicitly selected conflict content
- [ ] `gitoxide` migration evaluation: decide whether to replace the git CLI
  with `gitoxide` to keep operations inside the Rust broker boundary
- [ ] Fail-closed fixtures for worktrees, nested repositories, symlinks,
  case-only paths, non-UTF-8 metadata, and large diffs
- [ ] Repository replacement handling

### P2-2: WS3 Table Interaction Completion

Current state: sortable columns and keyboard navigation. Remaining proposal
contract items:

- [ ] TanStack Table paging, filtering, and search
- [ ] Frozen identifier columns
- [ ] Complete keyboard navigation contract
- [ ] Server-owned sort/filter/page authority: frontend must not bypass the
  broker for data operations

### P2-3: render_document_job Robustness

Current state: async job submission with fire-and-forget pattern. Remaining
work:

- [ ] Job status callback mechanism (frontend currently never learns whether
  a render completed or failed)
- [ ] Cancellation and restart reconciliation
- [ ] Render result to Artifact provenance link

## Phase 3: New Capability Implementation

Select one workstream at a time. Each requires a separate focused handoff and
acceptance gate.

### P3-1: WS1 Package Management (P0 priority)

From the RStudio-inspired workflow proposal, capability-decision table row 1:

- [ ] Searchable installed and locked package inventory
- [ ] Direct versus transitive dependency and package-source display
- [ ] Bounded status and change preview before `renv` initialization,
  restore, or snapshot
- [ ] Exact operation, project root, revisions, repositories, and expected
  changes bound to a single-use confirmation
- [ ] Dedicated direct-UI environment operation request records
- [ ] Before/after immutable environment evidence linked to the operation run
- [ ] Truthful partial-failure and cancellation states
- [ ] No silent installation of `renv`, `BiocManager`, or other packages

### P3-2: WS2 Editor Enhancement

Remaining items after the Air backend checkpoint:

- [ ] Go to definition for project functions and package source/help locations
- [ ] Find project references with bounded results
- [ ] Refactoring: rename symbol and extract function as reviewable
  document-version-bound workspace edits
- [ ] Document-version-bound formatting proposals (never auto-apply)

### P3-3: EW-CR1 Evidence Workspace

From the evidence-workspace-and-claim-review design proposal. Requires
accepted 0.3.x, BH1-BH3, and RA-RC1 evidence.

- [ ] Scholarly citation normalization
- [ ] Claim-to-evidence linkage
- [ ] Project-scoped evidence curation

## Longer-Term Deferred Items

Capabilities mentioned in proposals but deferred to later milestones:

| Item | Document | Reason |
|------|----------|--------|
| WS5 chunk discovery | RStudio-inspired workflow | Requires WS6 chunk execution first |
| WS6 chunk execution | RStudio-inspired workflow | After render job contract is stable |
| WS6A pipeline execution | RStudio-inspired workflow | Targets read-only inspection done; execution needs separate authorization |
| Debugger (DAP) | Roadmap M4 | Ark-dependent; after local workflows are dependable |
| Build pane (WS8) | RStudio-inspired workflow | Package-development workflows deferred |
| Interface Modernization Phase 2+ | modernization plan | Waits for posture decisions to stabilize |
| Cross-platform beta | Roadmap M3 | After Windows contract is stable |
| Remote execution / Slurm | Roadmap M4 | After local provenance is reliable |

## Execution Sequence

```
P1-1 (M1 release) → P1-2 (0.3.x acceptance)
    ↓
P2-1 (WS4 Git) → P2-2 (WS3 table) → P2-3 (render job)
    ↓
P3-1 (WS1 packages) → P3-2 (WS2 editor) → P3-3 (EW-CR1)
```

- Keep no more than one Phase-3 product-capability workstream in
  implementation at a time.
- Acceptance and release tracks may run in parallel when their evidence is
  independent.
- Stop at every work-package checkpoint. Reconcile tests, manual evidence,
  version/NEWS impact, document lifecycle, remaining debt, and worktree
  state before authorizing the next package.

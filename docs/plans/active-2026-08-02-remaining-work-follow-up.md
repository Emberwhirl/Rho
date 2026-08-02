# Remaining Work Follow-up

Status: active coordination record

Date: 2026-08-02
Owner: Rho product and release workstream
Source of truth: [`proposed-2026-08-01-next-phase-task-plan.md`](proposed-2026-08-01-next-phase-task-plan.md)

## Current Count

The reconciled next-phase checklist has **16 open items** and **33 completed
items**. The 16 open items are concrete acceptance or capability gaps. Six
additional longer-term directions remain deliberately deferred and are not
included in that checklist count.

| Follow-up lane | Open items | Next gate |
|---|---:|---|
| M1 and `0.3.x` acceptance | 8 | Record representative manual and installed-candidate evidence |
| WS4 Git completion | 0 | Capability complete; installed-app acceptance remains separate |
| WS3 table interaction | 0 | Capability complete; installed-app acceptance remains separate |
| Render job robustness | 0 | Capability complete; installed-app acceptance remains separate |
| WS1 package/environment completion | 0 | Capability complete; installed-app acceptance remains separate |
| WS2 editor enhancement | 7 | Select one editor/help/refactor package |
| Structural claim-to-evidence review | 1 | Activate the semantic linkage contract |
| **Total** | **16** | |

For near-term planning, this is **8 product implementation items** plus **8
acceptance/release items**. The latter comprise six manual validations, one
distribution decision, and one affected-suite rerun. The manual validations
are now staged under `test/acceptance-project/`; staging the instructions and
fixtures does not count them as passed.

The staged acceptance project is example-driven rather than control-only. Its
generated `working-project` is an isolated Git repository and provides a
deterministic single-cell QC analysis, deliberate Agent correction, editor
intelligence sample, render inputs, Git hunk/restore exercise, a real merge
conflict, Unicode/space paths, 2,000+ files, and an oversized-file boundary.
Automated fixture checks are recorded in
`docs/verification/manual-acceptance-fixture/verification.md`; installed-app
execution remains with the user and remains open.

## Immediate Active Work

The user authorized the following presentation-only package on 2026-08-02:

- simplify the default Agent conversation input so one `Ask Rho` entry is
  primary and Ask/Plan/Act policy is progressively disclosed;
- improve the Agent-first Direct surface information hierarchy, space use, and
  responsive behavior.

The owning implementation contract is
[`active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md`](active-2026-08-02-agent-entry-and-direct-surface-polish-spec.md).
This work did not remove or complete any capability and acceptance items at
the time it was completed. It is a bounded slice of the separately deferred
interface modernization direction.

Implementation and automated/browser verification completed on 2026-08-02.
Installed-app acceptance remains open, so the package and this tracking record
remain active.

A second authorized presentation slice,
[`active-2026-08-02-agent-first-intuitive-modernization-spec.md`](active-2026-08-02-agent-first-intuitive-modernization-spec.md),
also completed implementation and automated/browser verification on 2026-08-02.
It improves navigation terminology and progressive disclosure without closing
any capability or acceptance items.

The authorized WS4-G1 package,
[`active-2026-08-02-ws4-reviewable-git-mutations-spec.md`](active-2026-08-02-ws4-reviewable-git-mutations-spec.md),
completed implementation and automated/browser verification on 2026-08-02.
It closes hunk stage/unstage, confirmed file restore, and complete current
staging/commit UI/mock parity. Installed-app execution remains open. The
checklist was therefore **25 open / 24 completed**.

The authorized WS4-G2 package,
[`active-2026-08-03-ws4-adversarial-git-hardening-spec.md`](active-2026-08-03-ws4-adversarial-git-hardening-spec.md),
completed implementation, adversarial fixtures, contract review, and the full
affected automated matrix on 2026-08-03. It closes the fail-closed fixture
item without claiming installed-app acceptance. Repository replacement is now
the sole WS4 gap, and the checklist is **24 open / 25 completed**.

The authorized WS4-G3 package,
[`active-2026-08-03-ws4-repository-replacement-spec.md`](active-2026-08-03-ws4-repository-replacement-spec.md),
completed repository-bound SHA-256 revisions, replacement/removal recovery
fixtures, linked-worktree token isolation, contract review, and the complete
affected automated matrix on 2026-08-03. This closes the last WS4 capability
item without closing installed-app acceptance. The checklist is now **23 open
/ 26 completed**.

The authorized WS3-Q1 package,
[`active-2026-08-03-ws3-broker-data-query-spec.md`](active-2026-08-03-ws3-broker-data-query-spec.md),
completed Workspace-owned literal search, stable absolute-column sorting,
matched paging, exact visible-page export replay, browser/mock parity, contract
review, and the complete affected automated matrix on 2026-08-03. This closes
the broker-owned filter/search item without closing installed-app acceptance.
The checklist is now **22 open / 27 completed**, and richer type/missing-value
presentation is the sole WS3 checklist gap.

The authorized WS3-Q2 package,
[`active-2026-08-03-ws3-type-missing-presentation-spec.md`](active-2026-08-03-ws3-type-missing-presentation-spec.md),
completed additive Workspace-owned column type/class/page-missing metadata, aligned
special-value states, truthful frontend/mock rendering, export compatibility,
contract review, and the complete affected automated/browser matrix on
2026-08-03. This closes the last WS3 checklist capability without closing
installed-app acceptance. The checklist is now **21 open / 28 completed**.

The authorized P2-3A package,
[`active-2026-08-03-render-cancellation-reconciliation-spec.md`](active-2026-08-03-render-cancellation-reconciliation-spec.md),
completed exact render job/run identity, job-specific cancellation, submitted
job project-switch blocking, Workspace restart reconciliation, explicit
unknown-job failure, frontend/mock parity, contract review, and the complete
affected automated/browser matrix on 2026-08-03. This closes cancellation and
restart reconciliation without closing render Artifact UI linkage or
installed-app acceptance. The checklist is now **20 open / 29 completed**.

The authorized P2-3B package,
[`active-2026-08-03-render-artifact-linkage-spec.md`](active-2026-08-03-render-artifact-linkage-spec.md),
completed exact coordinator response identity, job projection, project-scoped
run-to-Artifact restart lookup, Last Render provenance presentation, exact
Review Artifact navigation, idempotent browser/mock completion, contract
review, and the complete affected automated/browser matrix on 2026-08-03.
This closes the last Render robustness capability item without closing
installed-app acceptance. The checklist is now **19 open / 30 completed**.

The authorized WS1-L1 package,
[`active-2026-08-03-ws1-lockfile-inventory-spec.md`](active-2026-08-03-ws1-lockfile-inventory-spec.md),
completed an explicit-project-root, bounded lockfile/library union, four
comparison states, deterministic duplicate-library precedence, Installed and
Lockfile UI tabs, browser/mock failure states, contract review, and the full
affected automated/browser matrix on 2026-08-03. This closes searchable
lockfile comparison without authorizing dependency/source presentation or any
package mutation. Installed-app acceptance remains open. The checklist is now
**18 open / 31 completed**.

The authorized WS1-L2 package,
[`active-2026-08-03-ws1-dependency-source-spec.md`](active-2026-08-03-ws1-dependency-source-spec.md),
completed evidence-bound direct/transitive/unclassified roles, bounded graph
failure truth, credential-safe package source presentation, browser/mock
parity, contract review, and the complete affected automated matrix on
2026-08-03. This closes dependency/source presentation without authorizing any
package mutation. Installed-app acceptance remains open. The checklist is now
**17 open / 32 completed**.

The authorized WS1-M1 package,
[`active-2026-08-03-ws1-package-mutation-spec.md`](active-2026-08-03-ws1-package-mutation-spec.md),
completed one-package Install, Update, and Remove through the dedicated
environment request lane, exact project-library and repository binding,
execution-time state checks, Agent parity, recovery truth, contract review,
and the complete affected automated/browser matrix on 2026-08-03. This closes
the last WS1 capability item without closing installed-app acceptance. The
checklist is now **16 open / 33 completed**.

## Follow-up Order

1. Keep the six manual acceptance checks queued in
   `test/acceptance-project/MANUAL-ACCEPTANCE.md` until the user runs them
   against an exact candidate; separately record the distribution decision and
   affected-suite rerun.
2. Select one remaining package at a time from WS2 or structural claim
   review.
3. Reconcile this count whenever an owning focused contract becomes active or
   its evidence gate closes.

## Longer-term Deferred Directions

These six directions remain outside the 16-item checklist and require separate
authorization: WS6A pipeline execution, debugging, package-development jobs,
interface modernization Phase 2+, cross-platform beta, and remote execution.

## Status Rules

- A checked implementation item means code and its declared automated evidence
  exist; it does not imply manual or installed-candidate acceptance.
- Manual acceptance, installed-app acceptance, milestone acceptance, and
  release readiness remain separate facts.
- This document tracks work; each product-code package still needs an owning
  active contract and cross-review before implementation.

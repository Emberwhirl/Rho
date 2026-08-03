# Remaining Work Follow-up

Status: active coordination record

Date: 2026-08-02
Owner: Rho product and release workstream
Source of truth: [`proposed-2026-08-01-next-phase-task-plan.md`](proposed-2026-08-01-next-phase-task-plan.md)

## Current Count

The reconciled next-phase checklist has **9 open items** and **40 completed
items**. Eight are acceptance or release gaps; EW-CR2 is reopened for five
bounded repairs after implementation review. Six
additional longer-term directions remain deliberately deferred and are not
included in that checklist count.

| Follow-up lane | Open items | Next gate |
|---|---:|---|
| M1 and `0.3.x` acceptance | 8 | Record representative manual and installed-candidate evidence |
| WS4 Git completion | 0 | Capability complete; installed-app acceptance remains separate |
| WS3 table interaction | 0 | Capability complete; installed-app acceptance remains separate |
| Render job robustness | 0 | Capability complete; installed-app acceptance remains separate |
| WS1 package/environment completion | 0 | Capability complete; installed-app acceptance remains separate |
| WS2 editor enhancement | 0 | Capability complete; installed-app acceptance remains separate |
| Structural claim-to-evidence review | 1 | Complete five separately committed contract repairs |
| **Total** | **9** | |

For near-term planning, this is **1 reopened product item** plus **8
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

The authorized WS2-H1 package,
[`active-2026-08-03-ws2-local-help-location-spec.md`](active-2026-08-03-ws2-local-help-location-spec.md),
completed bounded installed-package and local Help resolution, a visible Help
fallback after a project-definition miss, package-contained source-reference
checks, browser/mock parity, contract review, and the complete affected
automated matrix on 2026-08-03. This closes package source/help locations
without claiming full Rd rendering, example execution, or installed-app
acceptance. The checklist is now **15 open / 34 completed**.

The authorized WS2-R1 package,
[`active-2026-08-03-ws2-bounded-project-references-spec.md`](active-2026-08-03-ws2-bounded-project-references-spec.md),
completed token-aware references across project R/Rmd/Qmd source, bounded and
truthful partial-result metadata, project-relative navigation, `Shift+F12`,
browser/mock parity, contract review, and the complete affected automated
matrix on 2026-08-03. This closes bounded project references without
authorizing rename/refactor or installed-app acceptance. The checklist is now
**14 open / 35 completed**.

The authorized WS2-H2 package,
[`active-2026-08-03-ws2-installed-help-and-example-spec.md`](active-2026-08-03-ws2-installed-help-and-example-spec.md),
completed bounded installed Rd, package-version, argument, example, and
vignette presentation plus confirmed ordinary Workspace execution of the
exact displayed example. Hidden Rd branches are omitted, and malformed or
truncated examples cannot run. Contract review and the complete affected
automated/browser matrix passed without closing installed-app acceptance. The
checklist is now **13 open / 36 completed**.

The authorized WS2-D1 package,
[`active-2026-08-03-ws2-diagnostic-grouping-quick-fix-spec.md`](active-2026-08-03-ws2-diagnostic-grouping-quick-fix-spec.md),
completed bounded normalized lintr responses, deterministic Problems grouping,
and reviewed mechanical fixes for infix spacing, assignment, and trailing
whitespace. Apply is bound to the active project, file, document version, and
exact expected line, changes only the undoable editor buffer, and requires a
separate Save. Contract review and the complete affected automated/browser
matrix passed without closing installed-app acceptance. The checklist is now
**12 open / 37 completed**.

The authorized WS2-AH1 package,
[`active-2026-08-03-ws2-agent-local-help-link-spec.md`](active-2026-08-03-ws2-agent-local-help-link-spec.md),
completed the explicit resolved-Help-to-Agent flow. A user can attach one
qualified installed Help snapshot to the next question; the selected answer
shows package, topic, installed version, and Help record separately from model
prose, with an exact Open Help action. Model-only, partial, malformed, and
foreign-project contexts fail closed. Contract review and the complete
affected automated/browser matrix passed without closing installed-app
acceptance. The checklist is now **11 open / 38 completed**.

The authorized WS2-R2 package,
[`active-2026-08-03-ws2-refactor-review-spec.md`](active-2026-08-03-ws2-refactor-review-spec.md),
completed bounded Rename Symbol and same-file Extract Function proposals.
Rename consumes only a complete, untruncated token-aware References result;
both operations bind every target to the active project, exact content, and
open document version. The review shows per-file before/after text, Apply
changes editor buffers only, Save remains explicit, and stale or malformed
proposals fail before any target changes. Contract review and the complete
frontend/browser matrix passed without closing installed-app acceptance. The
checklist is now **10 open / 39 completed**.

The authorized WS2-F1 package,
[`active-2026-08-03-ws2-formatting-review-spec.md`](active-2026-08-03-ws2-formatting-review-spec.md),
completed the Workspace R/styler formatting result, exact document-version-bound
review, editor-buffer-only Apply/Save/Undo, provider-unavailable and parse-error
states, stale recovery, mock parity, contract review, and the complete affected
automated/browser matrix on 2026-08-03. The acceptance project now includes
ordinary and malformed formatting examples. Installed-app acceptance remains
open. The checklist is now **9 open / 40 completed**.

The authorized EW-CR2 package,
[`active-2026-08-03-ew-cr2-structural-claim-review-spec.md`](active-2026-08-03-ew-cr2-structural-claim-review-spec.md),
completed schema v9 migration/recovery, transactional same-project claim and
Evidence linkage, exact source/Artifact anchors, five deterministic structural
review statuses, Entries/Claims UI and mock parity, and desktop/narrow browser
verification on 2026-08-03. The acceptance project now contains a rendered
claim-review example and complete linked/missing/incomplete/stale/Artifact
recovery walkthrough. Installed-app acceptance remains open. The checklist is
was initially recorded as **8 open / 41 completed**. A subsequent contract
review reopened EW-CR2 for five bounded repairs, making the current count
**9 open / 40 completed** until all five land and are reverified.

## Follow-up Order

1. Keep the six manual acceptance checks queued in
   `test/acceptance-project/MANUAL-ACCEPTANCE.md` until the user runs them
   against an exact candidate; separately record the distribution decision and
   affected-suite rerun.
2. Run the affected-suite acceptance item against the chosen exact candidate;
   do not substitute the package-level matrix for candidate evidence.
3. Reconcile this count whenever an owning acceptance gate closes or
   its evidence gate closes.

## Longer-term Deferred Directions

These six directions remain outside the 9-item checklist and require separate
authorization: WS6A pipeline execution, debugging, package-development jobs,
interface modernization Phase 2+, cross-platform beta, and remote execution.

## Status Rules

- A checked implementation item means code and its declared automated evidence
  exist; it does not imply manual or installed-candidate acceptance.
- Manual acceptance, installed-app acceptance, milestone acceptance, and
  release readiness remain separate facts.
- This document tracks work; each product-code package still needs an owning
  active contract and cross-review before implementation.

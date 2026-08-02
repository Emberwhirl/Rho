# Remaining Work Follow-up

Status: active coordination record

Date: 2026-08-02
Owner: Rho product and release workstream
Source of truth: [`proposed-2026-08-01-next-phase-task-plan.md`](proposed-2026-08-01-next-phase-task-plan.md)

## Current Count

The reconciled next-phase checklist has **24 open items** and **25 completed
items**. The 24 open items are concrete acceptance or capability gaps. Six
additional longer-term directions remain deliberately deferred and are not
included in that checklist count.

| Follow-up lane | Open items | Next gate |
|---|---:|---|
| M1 and `0.3.x` acceptance | 8 | Record representative manual and installed-candidate evidence |
| WS4 Git completion | 1 | Handle repository replacement |
| WS3 table interaction | 2 | Specify broker-owned filter/search and richer value presentation |
| Render job robustness | 2 | Specify cancellation/restart truth and Artifact linkage |
| WS1 package/environment completion | 3 | Select lockfile comparison or package mutation as a bounded package |
| WS2 editor enhancement | 7 | Select one editor/help/refactor package |
| Structural claim-to-evidence review | 1 | Activate the semantic linkage contract |
| **Total** | **24** | |

For near-term planning, this is **16 product implementation items** plus **8
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

## Follow-up Order

1. Keep the six manual acceptance checks queued in
   `test/acceptance-project/MANUAL-ACCEPTANCE.md` until the user runs them
   against an exact candidate; separately record the distribution decision and
   affected-suite rerun.
2. Complete the sole remaining WS4 item: repository replacement handling.
3. Select one remaining package at a time from WS3, render robustness, WS1,
   WS2, or structural claim review.
4. Reconcile this count whenever an owning focused contract becomes active or
   its evidence gate closes.

## Longer-term Deferred Directions

These six directions remain outside the 24-item checklist and require separate
authorization: WS6A pipeline execution, debugging, package-development jobs,
interface modernization Phase 2+, cross-platform beta, and remote execution.

## Status Rules

- A checked implementation item means code and its declared automated evidence
  exist; it does not imply manual or installed-candidate acceptance.
- Manual acceptance, installed-app acceptance, milestone acceptance, and
  release readiness remain separate facts.
- This document tracks work; each product-code package still needs an owning
  active contract and cross-review before implementation.

# Editor Rename Proposal Recovery

Status: active; original implementation, automated verification, and
replacement-candidate browser interaction complete; exact `0.4.0-dev.31`
installed acceptance rejected the production response projection;
RENAME-RECOVERY-R1 implemented, automated validation and post-verification
contract review pass; hosted integration and exact `dev.32` installed
acceptance open

Date: 2026-08-07
Authorization: user requested implementation of GitHub Issue #8
Change class: D2 bounded editor refactor workflow recovery
Risk: R2 proposal lifecycle, project reference lookup, and review-entry state
Work package: WS2-R2-RENAME-RECOVERY-1

## Problem

Rename Symbol currently opens an empty Review dialog before the bounded project
reference proposal has been built. Lookup, stale-source, or dirty-source
failures therefore present as a generic missing-proposal error and discard the
rename input. The existing bounded reference and editor-buffer safety contract
must remain unchanged.

## Contract

- Capture the selected/cursor symbol and requested replacement before proposal
  construction.
- Keep the Review surface closed while the proposal is being built. Open it
  only after a valid `rho.editor_refactor_proposal.v1` proposal exists.
- On proposal failure, preserve the old symbol context and replacement as the
  default input, show the actionable error, and offer retry or cancel.
- Retry must rebuild against the current project and current source; it must
  not reuse a stale proposal or apply a partial edit.
- Existing bounds, clean-source requirement, exact references, project
  containment, review-before-apply, editor-buffer-only apply, and explicit Save
  semantics remain authoritative.
- F2 and the existing Monaco editor context action remain the short contextual
  entry path; no second rename command or mutation authority is introduced.

## Acceptance

- Successful rename opens Review with a non-null proposal and no empty Review
  state is observable.
- Reference lookup, incomplete response, dirty/divergent source, and project
  switch failures remain unapplied and return to a retryable rename input with
  the previous replacement prefilled.
- Cancel after a failure closes the input without changing any editor buffer.
- F2/contextual Rename still reaches the same request path.

## Verification

The frontend contract test must assert proposal-first Review entry, retry
preservation, and no empty Review opening in `requestRenameSymbol`. JavaScript
syntax, existing refactor/reference UI contracts, affected Rust tests, and
`git diff --check` are required. Installed-app acceptance remains separate.

## Implementation Evidence

The Rename request path now builds the bounded proposal before opening Review.
Lookup, incomplete-reference, dirty/divergent-source, and project-switch
failures clear the transient proposal and return to the same name prompt with
the previous replacement prefilled. F2 and Monaco's contextual Rename action
continue to use this single path; no backend command or mutation authority was
added.

The dedicated recovery contract, existing refactor/reference contracts, full
frontend contract matrix, JavaScript syntax check, `rho-server` tests (47
passed), release metadata check, and `git diff --check` passed on 2026-08-07.
Replacement `0.4.0-dev.31` Chromium interaction opened a nonempty Review for
two files and three exact locations. An injected reference-lookup failure kept
Review closed and opened `Rename symbol - try again` with
`flag_low_quality_qc` prefilled; Cancel closed the retry surface with the
visible source unchanged. A stale apply separately remained unapplied with an
actionable error. Installed-app acceptance remains open.

## RENAME-RECOVERY-R1 Installed Envelope Correction

Exact signed `0.4.0-dev.31` installed acceptance on 2026-08-11 exercised F2
against a clean top-level R file containing three exact occurrences. Rename
preserved the requested replacement and stayed out of empty Review on failure,
so the original recovery behavior held, but every attempt returned to
`Rename symbol - try again`. The installed References surface simultaneously
reported an undefined symbol and zero scanned files. Direct execution of the
same reviewed Workspace R function returned the expected three complete
records.

Cross-review assigns broker-envelope projection to WS2-R1-R1. Rename retains
proposal construction, clean-source, exact-location, review-before-apply, and
retry ownership. `buildRenameRefactorProposal()` must validate the projected
reference record rather than the outer broker envelope. This changes no
reference semantics, refactor bounds, editor-buffer mutation, Save behavior,
approval, persistence, project, or execution authority.

Acceptance requires a deterministic production-envelope regression plus a
fresh exact installed candidate. F2 must open Review only after a non-null
proposal exists, show the expected file/location counts, and leave every
buffer unchanged when Cancel is selected. The existing injected lookup
failure must still keep Review closed, preserve the requested name, and cancel
without mutation. Because this is user-visible installed behavior, the repair
requires a fresh application development-candidate identity and NEWS entry;
`0.4.0-dev.31` is rejected and non-composable.

Rename now projects the reference command's standard broker envelope before
symbol and completeness validation. The existing proposal-first flow,
incomplete/truncated rejection, retry-name preservation, Review boundary,
clean-source checks, target limits, Cancel path, apply, and Undo code are
unchanged. The dedicated envelope regression, refactor and Rename recovery
contracts, every compatible frontend/release contract, complete Rust/R source
matrix, version checks, and `git diff --check` pass. Post-verification review
found no ownership, persistence, project, approval, filesystem, or mutation
deviation. Fresh installed `dev.32` Review/Cancel/failure-recovery evidence
remains required.

# Editor Rename Proposal Recovery

Status: active; implementation and automated verification complete 2026-08-07;
installed acceptance open

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
Installed-app acceptance remains open.

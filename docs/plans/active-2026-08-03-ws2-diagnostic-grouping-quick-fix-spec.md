# WS2 Deterministic Diagnostics And Reviewed Quick Fixes

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D2 bounded editor diagnostics and reviewable in-memory edit
Risk: R2 provider normalization, project/document identity, stale edit
rejection, browser/mock parity, and explicit editor-buffer mutation
Work package: WS2-D1
Mandatory stop: after deterministic diagnostic grouping and a bounded set of
reviewed lintr fixes, complete the R/Rust/frontend matrix, contract review,
version/NEWS and checklist reconciliation, and an independent commit

## Problem

The current Lint action flattens each lintr result into a generic Problem. It
discards the source range, severity, rule, provider version, document version,
scan scope, and any mechanical fix. Repeated findings have unstable IDs based
on the clock, and a clean scan is represented as a fake Problem. The broader
WS2 contract requires deterministic grouping and reviewable, version-bound
quick fixes without letting a diagnostics provider write files.

## Scope And Ownership

- Workspace R owns lintr invocation and normalization. It returns one bounded
  file-scope diagnostic response tied to the caller-supplied document version
  and a digest of the exact saved file scanned.
- Rust validates the project-relative R path and non-negative document version,
  binds the request to the active Workspace, escapes the Probe expression, and
  passes through the additive response.
- Problems remains the only visible diagnostics surface. The frontend groups
  normalized diagnostics deterministically and owns review interaction.
- A quick fix is an in-memory Monaco/fallback-editor proposal. Accept mutates
  only the open editor buffer after exact document-version and source-line
  checks. It never invokes `project_write_file`; the user must Save separately.

This package does not add a Problems store, background linting, language-server
diagnostics, whole-file formatting, multi-file edits, Agent edits, automatic
save, package installation, arbitrary regex fixes, or a new filesystem command.

## Diagnostic Response Contract

`rho_lint_file(path, document_version)` returns a fixed JSON-safe record:

- `provider`: `{name, version, available}`;
- `source_path`, `source_digest`, `document_version`, and `scan_scope = file`;
- `diagnostics`: at most 500 normalized records;
- `truncated`, `incomplete`, `notices`, and nullable `error`.

Each diagnostic contains a stable `diagnostic_id`, source start/end range,
normalized `severity`, original `message`, `rule`, provider identity/version,
document version, scan scope, and nullable `quick_fix`. Paths remain the
validated request path, never an absolute provider filename. Messages, rules,
versions, source lines, replacements, and the complete response are bounded.

Stable ordering is source path, line, column, severity, rule, message, then ID.
The frontend group key is source path plus exact range plus normalized message.
Groups and members use that ordering; provider/rule labels are sorted and
deduplicated. A zero-diagnostic result is an empty state, not a fake Problem.

## Quick Fix Contract

Only these exact lintr rules may produce a fix when a single valid range and
the expected source line are available:

- `infix_spaces_linter`: surround the exact reported infix operator with one
  space on each side;
- `assignment_linter`: replace the exact reported `=` token with `<-`;
- `trailing_whitespace_linter`: remove the exact trailing whitespace range.

The response includes a title, expected complete line, replacement complete
line, and source range. A malformed, ambiguous, multi-line, oversized, or
unsupported rule has `quick_fix = null`.

Selecting Review shows before/after plain text and the exact consequence.
Cancel changes nothing. Accept is enabled only when the same project and file
remain active, the document version exactly matches the scan, and the current
line exactly equals `expected_line`. Any edit, reload, project switch, provider
error, or source mismatch rejects the proposal truthfully. Accept uses the
editor undo stack, leaves the document dirty, and displays `Save to persist`.

## Cross-review

- Existing Run/Problems records remain authoritative for execution failures.
  Lintr diagnostics are transient file-scope Problems and do not enter the
  durable run store.
- Existing Agent file-edit proposals retain their own reviewed persistent-write
  flow. WS2-D1 does not reuse their Accept path because diagnostic fixes must
  not write automatically.
- Later formatting, rename, and extract-function packages own multi-range or
  multi-file edits and their stronger workspace revision contracts.
- WS2-H1/H2 Help, WS2-R1 references, Environment operations, Git mutations,
  execution, approvals, credentials, and project-switch authority are unchanged.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- installed/unavailable lintr, fixed missing/error schema, provider version,
  project-relative path projection, file digest, document version, and scope;
- severity/range/rule normalization, stable ordering/IDs, 500-result and field
  bounds, malformed provider values, and Unicode;
- supported quick fixes, unsupported/multi-range rejection, exact expected and
  replacement lines, and no file/global/search/cwd mutation.

Rust/Tauri:

- relative `.R` path and version validation, escaping, Probe classification,
  active Workspace binding, malformed/oversized rejection, and pass-through;
- no new write command, approval lane, schema, or persistence.

Frontend/mock:

- deterministic groups, range/severity/provider/rule presentation, empty,
  unavailable, error, duplicate, long, and truncated states;
- Review, cancel, accept-to-dirty-buffer, stale version, changed line, wrong
  file/project, save-required, editor undo, focus, narrow window, and safe text;
- two project fixtures with the same path cannot share a proposal.

## Version And Lifecycle

- `rho.bridge` advances from `0.1.8` to `0.1.9` because its exported lint
  response contract changes.
- Application metadata remains `0.4.0-dev.0`; root and package NEWS update
  after evidence.
- The checklist changes from 13 open / 36 completed to 12 open / 37 completed
  only after full verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS2-D1 reaches its stop when bounded diagnostics are normalized and grouped
deterministically, supported mechanical fixes are reviewed and stale-safe,
Accept changes only the editor buffer, all affected tests and browser review
pass, versions/docs are reconciled, and the package is independently committed.

## Implementation And Review Evidence

Implementation, contract review, and affected automated/browser verification
completed on 2026-08-03. Workspace R returns a fixed bounded response and only
the three authorized mechanical fixes. Rust keeps `workspace.lint_file` a
project-relative, version-bound Probe. Problems groups exact range/message
matches, and Apply rejects project, file, document-version, or expected-line
drift before using the editor undo stack. No Tauri write command, approval
lane, persistence schema, or automatic Save was added.

The independent contract review found and resolved two integration gaps. First,
`lintr` was used as an optional provider but was not declared in `Suggests`;
the reviewed integration adds that declaration with the `rho.bridge` 0.1.9
version and NEWS entry. Second, frontend insertion order could reverse two
diagnostic groups even when the provider order was stable; the final frontend
now explicitly sorts diagnostic groups and members by the contract fields.
No remaining blocking deviation from this contract was found.

Verification completed with 447 passing `rho.bridge` expectations and two
Windows symlink skips, 32 passing `rho-server` tests, 83 passing `rho-desktop`
tests, Rust format checks, JavaScript syntax and adjacent frontend contract
checks. Browser review covered found, duplicate, empty, unavailable, error,
truncated, and long states; Cancel, Apply-to-dirty-buffer, Undo, stale-version,
and changed-line rejection were exercised. Installed-app/manual acceptance was
not run and remains staged under `test/acceptance-project`.

The checklist is reconciled to 12 open / 37 completed. Application metadata
remains `0.4.0-dev.0`; `rho.bridge` is 0.1.9. This contract remains active only
because installed-app acceptance is still open.

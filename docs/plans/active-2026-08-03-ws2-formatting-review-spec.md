# WS2-F1: Document-Version-Bound Formatting Review

Status: active implementation contract; implementation and automated/browser verification complete 2026-08-03; installed-app acceptance open

Date: 2026-08-03
Owner: WS2 editor intelligence
Parent: [`accepted-2026-08-01-ws2-editor-intelligence-checkpoint.md`](../design/accepted-2026-08-01-ws2-editor-intelligence-checkpoint.md)

## Problem And Scope

Rho has reviewable diagnostic fixes and refactors, but no whole-document
formatting path. A formatter must not write a file or silently change a draft:
the user needs an exact before/after review tied to the editor state from which
the preview was produced.

This package adds one bounded formatting proposal for an open editable `.R`
document. It does not format `.Rmd`/`.qmd` prose, save files, run code, mutate
the project, or add a second language-service process.

## Authority And Provider

- Monaco remains the editor and the frontend owns only review/apply state.
- Ark/Air remains the primary editor backend and Workspace R remains the
  authoritative execution boundary.
- `workspace.format_r_source` is a read-only broker probe. Workspace R invokes
  the optional `styler` package as the selected formatting provider.
- Rho does not implement a JavaScript formatter, use `formatR` as a fallback,
  or silently substitute another provider. If `styler` is absent, the result is
  `unavailable` and no proposal is created.
- The provider version and warnings are returned as metadata; they are not a
  semantic correctness claim.

## Contract

### Request

```json
{
  "path": "examples/analysis.R",
  "source": "x<-1+2\n",
  "document_version": 7,
  "expected_workspace": {}
}
```

The broker validates `path` as a project-relative `.R` path and binds the
request to the active workspace identity. `source` is the exact open editor
buffer, including its line endings and final-newline state. `document_version`
is a non-negative Monaco/editor version.

Bounds:

- source and formatted output: at most 1 MiB each;
- path: at most 1,000 UTF-8 bytes, no controls, no traversal or absolute form;
- response warnings and error text: at most 2,000 UTF-8 bytes;
- one active document per proposal.

### Response

Successful provider response:

```json
{
  "kind": "rho.editor_format_result.v1",
  "ok": true,
  "status": "formatted",
  "provider": "styler",
  "provider_version": "1.2.0",
  "path": "examples/analysis.R",
  "document_version": 7,
  "before": "x<-1+2\n",
  "after": "x <- 1 + 2\n",
  "changed": true,
  "warnings": [],
  "error": null
}
```

`status` is `formatted` or `unchanged`. Provider absence returns `ok: false`,
`status: unavailable`, `error.code: formatter_unavailable`, and no `after`
content. A provider/parse failure returns `ok: false`, `status: error`,
`error.code: formatter_error`, and no `after` content. The original `before`
content remains available for diagnostics and is never treated as applied.

### Frontend proposal

The frontend wraps a successful response as
`rho.editor_format_proposal.v1` with:

- canonical active project root;
- project-relative path;
- exact `before` and `after` text;
- a bounded content fingerprint of `before`;
- the open document version;
- provider/version/warning metadata.

The proposal is rejected before Apply when the project root, path, document
version, exact content, or fingerprint no longer matches. A missing or closed
document is also rejected. No disk read is required for formatting because the
proposal is explicitly for the open editor buffer; external disk changes are
reported through the existing draft/conflict machinery.

### Review, Apply, Save, Undo

- Review shows the complete bounded before/after text and provider metadata.
- Apply changes only the editor buffer and marks it dirty. It never calls a
  project write/create command.
- Save remains an explicit user action through the existing Save command.
- Undo restores the exact pre-Apply buffer only when the buffer still equals the
  applied `after` content and version; otherwise Undo stops with a visible
  stale message.
- Unexpected failure after Apply rolls the buffer back to the exact `before`
  content and reports the failure.
- A no-op (`unchanged`) response may be reviewed but cannot create a mutation.

### Failure And Recovery

The UI exposes loading, unchanged, formatted, unavailable, provider-error,
stale, applied, undone, and recovery states. A new request is required after a
stale or provider failure. Formatting never creates an approval request, Agent
mutation, durable file edit, Git change, or environment operation.

## Implementation Slice

1. Add `rho_format_r_source` to the Workspace R bridge and load it through the
   existing broker bootstrap environment.
2. Add the typed `workspace.format_r_source` probe and desktop command with
   path/source/version bounds and mock parity.
3. Add a Format Document editor action and reuse the bounded review surface for
   before/after, Apply-to-buffer, Save, and Undo.
4. Add R, coordinator, frontend contract, and browser-preview checks plus the
   acceptance-project example.

This package stops after automated and browser/mock verification. Installed-app
acceptance is a separate user-owned gate.

## Verification Matrix

Automated:

- `testthat::test_local('r/rho.bridge')` covers formatted, unchanged, malformed,
  bounded, and provider-unavailable response shapes where the provider is
  available;
- `cargo fmt --all -- --check`;
- `cargo test -p rho-server` and `cargo test -p rho-desktop`;
- `node --check desktop/dist/app.js`;
- `node scripts/test-editor-format-ui.mjs` and all existing frontend/mock
  contract scripts;
- `git diff --check`.

Browser/manual fixture:

- `test/acceptance-project/examples/editor-formatting.R` contains an ordinary
  spacing issue; `editor-formatting-malformed.R` is a deliberately malformed
  example for provider refusal;
- run Format Document, inspect complete before/after text, Apply, Save, Undo,
  then edit the buffer and verify stale rejection;
- record missing `styler` as an unavailable skip, never as a pass.

## Acceptance And Definition Of Done

This package is complete only when the response contract, real desktop command,
mock preview, review/apply/undo behavior, negative/stale recovery, tests,
documentation status, NEWS entry, and committed diff all agree. It does not
close installed-candidate or milestone acceptance.

Implementation evidence for this slice is complete: the R bridge, broker/Tauri
command, desktop/mock behavior, review/apply/undo state machine, and acceptance
fixture are checked in. `rho.bridge`, `rho-server`, `rho-desktop`, frontend
contract scripts, `cargo fmt`, syntax, and diff checks passed on 2026-08-03.
Browser preview evidence covered formatted, unchanged, unavailable, provider
error, stale, applied, and undone states at 1280x720 with no horizontal
overflow. Installed-candidate execution remains user-owned.

## Version And Documentation Impact

The current development identity remains `0.4.0-dev.0`; the Cargo workspace,
Tauri bundle, desktop frontend package, and lockfile must agree. Add the
user-visible formatting behavior to the `0.4.0-dev.0` NEWS section after the
implementation evidence exists.

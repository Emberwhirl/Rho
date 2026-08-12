# WS2 Bounded Project References

Status: active; WS2-R1 source/browser implementation complete; exact
`0.4.0-dev.31` installed acceptance rejected the desktop response projection;
WS2-R1-R1 envelope correction implemented, automated validation, post-
verification contract review, and exact four-identity hosted source matrix
pass; upstream integration and exact `dev.32` installed acceptance open

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D2 bounded cross-boundary read-only editor workflow
Risk: R2 project-owned source discovery, path containment, partial-result
truth, browser/mock parity, and editor navigation
Work package: WS2-R1
Mandatory stop: after one bounded project-reference surface, complete the
R/Rust/frontend matrix, contract review, version/NEWS and checklist
reconciliation, and an independent commit

## Problem

The acceptance project and WS2 checklist ask users to find project references,
but Rho currently implements only first-definition lookup. Users cannot inspect
where a symbol is used across project R source without leaving Rho. A raw text
search would also misreport comments and strings as code and could silently
scan outside the project through links or return an incomplete result as if it
were exhaustive.

## Scope And Ownership

- Workspace R owns token discovery because it is the selected Ark/Air-backed
  editor intelligence authority. Rust owns canonical active-project identity,
  request bounds, escaped Probe dispatch, and additive response pass-through.
- Add `workspace.find_project_references` and
  `editor_find_project_references`; do not add persistence, a search index, a
  second language server, or a durable Problems producer.
- Search supported project `.R`, `.Rmd`, and `.qmd` files only. Return
  project-relative paths; never return or open an arbitrary external path.
- Add a visible References context tab. `Shift+F12` and the Monaco navigation
  action query the symbol at the cursor; selecting a row opens that project
  file at the exact line and column.
- The existing `test/acceptance-project/examples/editor-intelligence.R`
  `flag_low_quality` definition/call remains the primary manual example.

This package does not implement rename, replace, reference mutation, semantic
scope disambiguation, package/dependency references, generated-code indexing,
full-text search, or a general search panel.

## Request And Response Contract

Request:

- `name`: one non-empty symbol text with at most 128 UTF-8 bytes and no control
  characters;
- `project_root`: the normalized active root supplied by the desktop/broker,
  never `getwd()`;
- `limit`: clamped to 1-200, default 100.

Response:

- `name`: validated request text;
- `references`: ordered records with project-relative `file`, positive `line`
  and `column`, bounded `preview`, and `kind` (`definition` or `reference`);
- `matched_count`: matches observed within the bounded scan, including records
  omitted by the result limit;
- `files_scanned` and `bytes_scanned`: actual bounded work performed;
- `truncated`: true when `matched_count` exceeds the returned result limit;
- `incomplete`: true when file, per-file byte, total-byte, parse, or containment
  limits prevent an exhaustive supported-file scan;
- `notices`: bounded stable reason codes explaining incomplete results.

Bounds are 500 candidate files, 1 MiB per file, 8 MiB total source bytes, 200
returned references, 1,000 UTF-8 bytes per relative path, and 240 UTF-8 bytes
per preview. Files are sorted by normalized project-relative path before scan;
references are sorted by file, line, and column.

## Discovery And Safety Contract

- Candidate paths are normalized and accepted only when their resolved path is
  the project root or a descendant. Symlink/junction escapes are skipped and
  set `incomplete` with a containment notice.
- Hidden/project-owned runtime and dependency trees (`.git`, `.rho`, `renv`,
  `.Rproj.user`, `node_modules`, and `target`) are excluded.
- Parseable R source uses R parse-data tokens and exact token text, so comments
  and strings are not references. R Markdown/Quarto search is restricted to R
  fenced chunks with source-line offsets.
- For a syntactically incomplete source region, a bounded line-level parse may
  recover independently parseable lines. The response still sets `incomplete`
  with a parse notice; it never claims semantic completeness.
- A match at the left side of an assignment to `function` is a `definition`;
  all other exact symbol tokens are `reference`. This is a presentation hint,
  not lexical-scope or binding proof.
- Reads do not load packages, execute project code, change the working
  directory, write files, or attach namespaces.

## UI Contract

- References is an unframed context surface with symbol, result count, status,
  incomplete/truncation notice, and one keyboard-focusable row per result.
- Loading, found, empty, incomplete, truncated, and error states are explicit.
- A row shows relative `file:line`, kind, and bounded source preview. Activating
  it opens the existing project document, reveals the exact line, places the
  cursor at the returned column, and focuses the editor.
- Result text uses DOM text APIs. Long paths/previews wrap without document
  overflow. The currently selected row has a visible focus state.
- Browser/mock mode provides found, empty, incomplete, truncated, error, and
  long Unicode path states plus a deterministic `project-references` preview.

## Cross-review

- The accepted Go-to-Definition contract retains first project-definition
  lookup and Local Help fallback. WS2-R1 is a separate multi-result read-only
  query and does not change F12 behavior.
- Existing project file APIs retain canonical root, supported-file, and safe
  open authority. Returned relative paths must still pass `project_read_file`
  containment before display navigation.
- Problems remains the diagnostics authority. References are ephemeral editor
  query results and are not persisted or projected as Problems.
- Future rename/refactor packages must bind edits to document versions and
  reviewed proposals; this package grants no mutation authority.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- definition and references across sorted `.R`, `.Rmd`, and `.qmd` fixtures;
- exact identifiers including dots, backticks, and Unicode; comments/strings
  excluded; definition/reference classification;
- malformed name/root, missing root, ignored directories, path containment,
  working-directory independence, and JSON serialization;
- result, file, per-file byte, total-byte, path, and preview bounds;
- syntax-error partial recovery with explicit incomplete notice;
- two-project isolation with identical filenames and symbols.

Rust/Tauri:

- request validation, limit clamp, R escaping, Probe classification, canonical
  active root, workspace identity, malformed rejection, and additive response
  pass-through.

Frontend/mock:

- `Shift+F12`, loading/found/empty/incomplete/truncated/error states, safe row
  rendering, file navigation, focus, long Unicode path wrapping, mock parity,
  and desktop/narrow viewport review.

## Version And Lifecycle

- `rho.bridge` advances from `0.1.6` to `0.1.7` because it adds a distributed
  project-reference response contract.
- Application metadata remains `0.4.0-dev.0`; root and package NEWS update
  after evidence.
- The checklist changes from 15 open / 34 completed to 14 open / 35 completed
  only after full verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS2-R1 reaches its stop when exact source-token references are visible and
navigable through bounded project-relative results, partial scans remain
truthful, no new read/mutation authority is introduced, all affected tests and
browser review pass, versions/docs are reconciled, and the package is
independently committed.

## Implementation And Evidence

Implementation, contract review, and automated/browser verification completed
on 2026-08-03 without authority, schema, or scope deviations:

- Workspace R walks supported project source without following links or
  entering runtime/dependency trees, resolves only contained normalized paths,
  and returns project-relative token matches from R files and R document
  chunks. Comments, strings, and prose are excluded.
- Parse, containment, file-count, per-file, total-byte, path, preview, and
  result bounds produce stable incomplete/truncated metadata. Two projects with
  identical filenames and symbols remain isolated, and the scan does not use
  or change the working directory.
- Rust validates symbol and root byte/control bounds, clamps the result limit,
  escapes the R expression, and dispatches one Workspace-identity-bound Probe.
  No persistence, approval, network, package load, code execution, or mutation
  lane changed.
- `Shift+F12` and the Monaco navigation action open a References context tab.
  Rows use DOM text APIs and must match the current safe project file list
  before existing file-open containment checks run.
- Browser/mock review covered found, empty, incomplete, truncated, error, and
  long Unicode path states at `1280 x 720`. The actual context panel was 279px
  wide, narrower than the 330px context track used by the existing <=960px
  layout; long paths wrapped with no document/panel overflow. The heading
  received focus, tabs remained reachable through bounded horizontal scroll,
  row activation opened the example file, and no page console errors appeared.
- Independent review found and resolved three issues: project-root requests now
  have a 1,000-byte bound, extreme direct-R limits no longer emit coercion
  warnings, and mock paths/tab overflow now exercise truthful navigation.

Automated evidence:

- focused `rho.bridge` reference contract: 32 passed; one file-symlink fixture
  skipped because this Windows session could not create file symlinks;
- complete `rho.bridge`: 358 passed; two Windows file-symlink fixtures skipped;
- `rho-server`: 30 passed;
- `rho-desktop`: 83 passed;
- Rust formatting, JavaScript syntax, Project References UI, Local Help UI,
  Agent-first UI, Console/Logs UI, Environment lockfile UI, and
  `git diff --check`: passed.

`rho.bridge` advances to `0.1.7`; application metadata remains
`0.4.0-dev.0`. Root and package NEWS are updated, and the checklist is
reconciled to 14 open / 35 completed. Exact installed-app/manual acceptance,
including the staged example and narrow installed window, remains open; this
contract therefore stays active and no milestone or release-readiness claim is
made.

## WS2-R1-R1 Installed Response-Envelope Correction

Exact signed `0.4.0-dev.31` installed acceptance on 2026-08-11 rejected the
frontend transport projection. Workspace R returned three exact references
for a clean top-level fixture and one exact reference for a clean nested file,
but the installed References panel rendered `undefined`, zero files, and zero
matches. F2 Rename consequently reopened `Rename symbol - try again` without
ever opening Review. The same source passed browser/mock because its
`editor_find_project_references` fixture returned the inner reference record
directly.

The production Tauri command truthfully returns the standard broker envelope
whose `execution` member is the command record. The frontend consumed that
envelope as though it were the record. Cross-review found the same mock/desktop
shape drift in the read-only editor consumers for package-function completion,
hover Help, chunk discovery, and lint diagnostics. This correction therefore
owns one shared, non-guessing transport projection rule for these editor probes:
accept the production envelope by selecting its object-valued `execution`,
while retaining the direct record form used by deterministic fixtures.
References, Rename, Go to Definition, package functions, hover Help, chunks,
and lint must consume the projected record before validating fields. The
existing Local Help projection delegates to the same helper; Format retains its
typed Rust projection. Malformed or missing records continue through their
existing empty/error or fallback paths; no backend response, request, project,
scan, diagnostics, Help, chunk, persistence, or mutation authority changes.

Browser/mock parity must use the production envelope for References, Go to
Definition, package functions, Help, chunks, and lint. A deterministic frontend
regression must prove direct, enveloped, and malformed forms; assert that every
listed consumer projects before field access; assert production-shaped mocks;
and prevent the installed `undefined`/zero-match regression. JavaScript syntax,
bounded References, refactor, Rename recovery, Local Help, chunks, lint, and all
compatible frontend contracts must pass before review. A fresh installed
candidate must show three exact fixture references and a nonempty Rename
Review, then smoke one completion/hover result, chunk record, and lint response;
`dev.31` evidence cannot satisfy that gate.

Implementation uses one pure direct-or-object-valued-`execution` projection and
applies it before field access in every listed consumer. Production-shaped mock
envelopes cover all listed commands. The dedicated regression executes direct,
enveloped, null, and array-valued cases and statically binds every consumer and
mock to the projection. JavaScript syntax, all 56 frontend/release contracts,
locked Rust format/check/tests, complete `rho.bridge` and `rho.agent` suites,
and `git diff --check` pass. Post-verification review found no response guessing,
backend/schema/request change, new mutation path, project-identity bypass, or
consumer-policy transfer; the implementation matches this contract with no
blocking deviation. Exact implementation head
`111c911d516413408f8315199c63379ba16844d8` passed macOS-26 stable/1.88.0 and
Windows stable/1.88.0 in Rust Compatibility run `31550939335`. Upstream
integration and fresh installed evidence remain open.

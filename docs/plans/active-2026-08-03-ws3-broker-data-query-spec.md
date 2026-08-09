# WS3 Broker-owned Data Query

Status: active implementation contract; implementation and automated/browser
verification complete; installed-app acceptance open

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 bounded cross-boundary viewer workflow
Risk: R2 Workspace R query, Tauri contract, artifact export, and visible UI state
Work package: WS3-Q1
Mandatory stop: after broker-owned search/sort, matching export, browser/mock
parity, complete affected validation, contract review, count reconciliation, and
an independent commit

## Problem

The Data Viewer has a search input and sortable headers, but search currently
filters only rows already loaded in the browser. Sort state is sent by the
frontend but ignored by Tauri, the coordinator, and Workspace R; header and
page-size actions also call a nonexistent `fetchDataViewerPage` function.
Consequently the visible interaction can disagree with server-owned paging and
visible-page export.

## Authority And Scope

- Workspace R remains the sole authority for the selected object, view
  materialization, search matches, sort order, and page window.
- The broker/Tauri boundary forwards typed query intent and continues to bind
  requests to the exact workspace/project revisions and view token.
- The frontend renders query state and submits intent. It never filters or sorts
  the returned page locally.
- Visible-page CSV/TSV export must replay the exact query, sort, row window, and
  column window used to render the page before writing an Artifact.
- No new object class, persistence schema, external process, package install,
  Workspace mutation, public Workbench Protocol change, or TanStack Table
  migration is authorized.

## Query Contract

The existing `workspace.read_data_view` request gains optional fields:

- `query`: trimmed literal UTF-8 search text, empty or null for no search;
- `sort_column`: zero-based absolute view-column index, null for original order;
- `sort_direction`: `asc` or `desc` when a sort column is present.

Rules:

- Query is case-insensitive literal matching, never regex or executable R.
- Query searches row names and every cell in the selected view. To return an
  exact match count, searchable scope is limited to 50,000 source rows and
  100,000 source cells. Larger scopes reject with `search_scope_exceeded` and
  report both limits; they never return a partial match set.
- Query text is capped at 256 UTF-8 bytes and rejects NUL/newline controls.
- Sorting applies to the filtered source-row indices before paging. It uses the
  absolute column index, so duplicate/blank labels are unambiguous.
- Supported sort values are atomic vectors, factors, dates, and date-times.
  Unsupported list/complex columns reject with `unsupported_sort_column`.
- Sort is stable for equal values and places missing values last in both
  directions. Invalid indices/directions reject without falling back.
- Search and sort never mutate the selected object.

The response page retains existing bounds and adds:

- `source_total_rows`: original selected-view row count;
- `total_rows`: exact post-query match count used by row paging;
- `query`, `sort_column`, and `sort_direction` as normalized applied state;
- absolute zero-based `index` on each projected column.

## UI And Failure States

- Search input debounces for 250 ms, resets row offset, and loads through the
  broker. Clearing search restores the unfiltered first page.
- Header selection cycles ascending, descending, original order and resets row
  offset. Header identity uses column index, not label.
- Loading, no matches, filtered count, search-scope rejection, unsupported sort,
  stale view, and ordinary failure remain visible without hiding the selected
  object or fabricating rows.
- Row pagination uses match count; horizontal pagination preserves query/sort.
- Export Page replays exact normalized page query/sort and records them in
  additive Artifact metadata.
- Browser/mock mode implements the same query, sorting, paging, clearing, and
  export behavior. Narrow layout must keep search and actions usable without
  document-level horizontal overflow.

## Required Tests

Workspace R:

- literal case-insensitive match across row names and off-page cells;
- query then stable ascending/descending sort then paging;
- duplicate column names sorted by absolute index;
- missing values last, zero matches, empty query recovery;
- query byte/control rejection, invalid sort index/direction, unsupported list
  sort, exact scope boundary, over-scope failure and recovery;
- stale view token rejection, payload/page limits, and two-environment isolation.

Rust/coordinator:

- optional/null and populated query/sort expression construction with escaped
  literal text;
- typed read/export request parity and exact query replay;
- export metadata records normalized query/sort state.

Frontend/mock:

- input debounce and clear submit broker query rather than filtering DOM rows;
- duplicate-label columns use absolute indices;
- sort cycle, matching totals, no results, scope/failure recovery, paging, and
  exported mock content match the visible page;
- deterministic desktop and narrow browser examples remain usable.

## Cross-review

- The implemented WP2 viewer contract remains authoritative for object/view
  allowlists, view tokens, workspace revision binding, payload/row/column bounds,
  Artifact export, and optional Bioconductor support.
- The broader RStudio-inspired proposal and next-phase plan own WS3 sequencing.
  WS3-Q1 closes only broker-owned filter/search and corrects the already claimed
  sort authority. Richer type/missing-value presentation remains separate.
- Artifact provenance remains store-owned. Additive query metadata does not
  redefine run linkage or file collision/recovery policy.
- WS4, rendering, environment mutation, editor intelligence, and structural
  evidence streams are unaffected.

No schema, approval, credential, execution, project-switch, or release conflict
was found.

## Verification Matrix

```powershell
Rscript -e "devtools::test('R/rho.bridge')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-data-viewer-query-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

Browser verification uses the deterministic `preview=wp2-data-viewer` example
at desktop and narrow widths and exercises real input/header/page controls over
the mock command contract.

## Version, NEWS, And Lifecycle

- `rho.bridge` changes its internal exported query contract and advances from
  `0.1.0` to `0.1.1` with package NEWS.
- Application version stays `0.4.0-dev.0`: this package extends the current
  unreleased development bucket and does not create a distributed candidate.
- Root `NEWS.md` records user-visible search/sort only after the complete
  affected matrix passes.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS3-Q1 reaches its stop when search/sort/paging/export have one Workspace-owned
contract, all negative/boundary/recovery/isolation tests pass, browser/mock and
Tauri behavior match, the existing sort defect is regressed, the package version
and NEWS are reconciled, and richer value presentation remains the sole WS3
capability gap.

## Implementation And Evidence

Implementation completed on 2026-08-03 without contract deviations:

- Workspace R now validates and normalizes literal query/sort intent, searches
  the complete bounded source view, performs stable missing-last sorting by
  absolute column index, then applies row and column windows.
- Tauri and the coordinator forward the same optional fields for reads and
  exports. Export metadata records the normalized query and sort returned by
  Workspace R.
- The frontend uses a 250 ms broker debounce, keeps query failures separate
  from object support, shows exact matched/source counts, and no longer filters
  loaded DOM rows. A monotonic request guard prevents late older responses from
  replacing newer query/sort state. Browser/mock mode includes a 60-row
  `qc_paged` example.
- `rho.bridge` advanced from `0.1.0` to `0.1.1`; package and application NEWS
  record only implemented behavior. The application remains `0.4.0-dev.0`.

Automated evidence:

- `Rscript -e "devtools::test('R/rho.bridge')"`: 157 passed, 0 failed,
  0 warnings, 0 skipped.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 23 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 76 passed.
- GNU `cargo fmt --all -- --check`, JavaScript syntax, Data Viewer query UI,
  Agent-first, Console/Logs, Git Review, and `git diff --check`: passed.

Browser evidence at the default desktop viewport and 800 x 900 narrow viewport:

- `qc` search, clear, no-result recovery, ascending/descending/original sort,
  filtered export, and Artifact/file projection completed without console
  errors or document-level horizontal overflow;
- `qc_paged` retained query `S` and descending `reads` sort while moving from
  rows 1-25 to rows 26-50 of 60; the first second-page row was the expected
  stable sorted `cell_35`.

Installed-app and exact-candidate manual acceptance were not run. This document
therefore remains active even though the WS3-Q1 capability checklist item is
closed.

## WS3-Q1-R1 Installed Data View Refresh Correction — 2026-08-08

Installed `0.4.0-dev.20` evidence rejects the selected-object refresh portion
of the viewer acceptance gate. After Workspace R changes, Environment updates
the object inventory (including the new dimensions) but leaves the selected
object detail, view token, and viewer workspace identity bound to the previous
state revision. The next page request therefore truthfully rejects the stale
token, but the UI asks the user to repair state that Rho can refresh safely and
deterministically itself.

WS3-Q1-R1 is an authorized D2/R2 correction owned by the existing read-only
Workspace viewer lane:

- `snapshot_workspace` remains inventory authority. When its returned kernel,
  state, or project identity differs from the identity that owns an existing
  selected data-object detail, the frontend force-reinspects that same object
  and obtains a new view token before reading a page.
- If the identity did not change, ordinary refresh does not issue an extra
  object/page read.
- A successful refresh preserves the selected view key when still available,
  literal query, compatible sort, page size, and bounded row/column window.
  Off-end windows are clamped and retried at the last valid bounded page; the
  frontend never fabricates rows or locally replays query/sort semantics.
- If the object disappeared or became unsupported, the previous page and token
  are cleared and the current state is shown truthfully. A refresh failure keeps
  a visible retryable error rather than presenting old rows as current.
- Object inspection and page reads use monotonic request generations plus the
  captured active project root. Late responses after a newer refresh or project
  switch cannot replace current state.
- Failed executions are included: if Workspace R advanced before returning an
  error, the surviving/mutated selected object is refreshed from the returned
  workspace identity.
- Browser/mock mode must advance the same workspace revision and stale-token
  contract. A deterministic behavior probe must prove successful automatic
  reinspection/page reload, preserved query/sort/window, disappeared-object
  recovery, stale-response rejection, and two-project isolation.

This package adds no Workspace mutation, schema, execution authority, polling,
or public protocol. The replacement behavior is user-visible and ships only
under `0.4.0-dev.21` after the complete affected frontend/browser and existing
Workspace viewer matrices pass. Installed-app acceptance remains a separate
gate.

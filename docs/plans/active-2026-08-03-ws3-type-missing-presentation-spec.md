# WS3 Type And Missing-value Presentation

Status: active implementation contract; implementation and automated/browser
verification complete; installed-app acceptance open

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 bounded cross-boundary viewer presentation
Risk: R2 Workspace R page schema, export compatibility, browser/mock UI
Work package: WS3-Q2
Mandatory stop: after additive type/state metadata, truthful rendering, export
compatibility, complete affected validation, browser review, count
reconciliation, and an independent commit

## Problem

The Data Viewer transports bounded cell text but does not describe column
types. The UI treats null and empty string as the same `NA` display, and R's
current cell formatter collapses `NaN` into null. Users therefore cannot
reliably distinguish missing, empty, non-finite, numeric, categorical, date,
and ordinary character values while reviewing scientific tables.

## Authority And Compatibility

- Workspace R remains authoritative for R value type, class, missing state,
  bounded cell text, search, sort, and paging.
- Existing `cells` remains an aligned array of bounded string or null values so
  current CSV/TSV export and older consumers remain compatible.
- New metadata is additive. The frontend renders it and never infers R type
  from formatted text.
- Export continues to use authoritative `cells`: `NA` exports as an empty
  field, empty character strings remain empty fields, and `NaN`, `Inf`, and
  `-Inf` export as those explicit values.
- No cell editing, type coercion, schema persistence, object mutation, new
  viewer class, TanStack migration, or public Workbench Protocol change is
  authorized.

## Page Schema

Each projected column adds:

- `type`: one of `logical`, `integer`, `double`, `character`, `factor`, `date`,
  `datetime`, `complex`, `list`, or `other`;
- `classes`: bounded R class names for the source column;
- `page_missing_count`: exact `is.na` count over the returned bounded page
  rows for that column.

Each row adds `cell_states`, aligned one-to-one with `cells`, using:

- `value`: ordinary present value;
- `empty`: present zero-length character text;
- `na`: R missing value;
- `nan`: numeric `NaN`;
- `pos_inf` and `neg_inf`: positive and negative infinity.

Rules:

- `NaN` is tested before `NA` because R reports `is.na(NaN)` as true.
- A null cell with absent metadata remains `na` for backward compatibility.
- Unsupported or nested list values retain bounded structural text and `value`
  state; no generic object serialization is introduced.
- Column classes are capped at eight entries and each class name at 128 UTF-8
  characters. Metadata remains inside the existing 1 MiB page budget.
- Query and sort behavior from WS3-Q1 is unchanged. Search uses the same
  authoritative formatted value (`NaN`, `Inf`, `-Inf`, or ordinary text).

## UI Contract

- Headers show a small, restrained type label beneath the column name.
- Header title text exposes visible-page missing count and R classes without adding a
  second permanent toolbar or dense legend.
- Numeric/complex cells align to the right; logical values have a distinct
  restrained style.
- `NA`, `NaN`, `Inf`, `-Inf`, and `""` are visibly distinct. Empty string must
  never be labeled `NA`.
- Screen-reader labels name special values; color is not the only signal.
- Loading, query errors, zero matches, keyboard navigation, narrow layout, and
  visible-page export remain usable.
- Browser/mock mode adds a deterministic `qc_types` example containing every
  state and representative logical/integer/double/character/factor/date types.

## Required Tests

Workspace R:

- exact type/class metadata for logical, integer, double, character, factor,
  Date, POSIXct, complex, and list columns;
- aligned value/empty/NA/NaN/positive-infinity/negative-infinity states;
- exact visible-page missing counts under filtering, sorting, and paging;
- duplicate names, zero rows/columns, payload bounds, stale token, recovery,
  and two-environment isolation remain valid.

Rust/Tauri:

- additive page fields remain JSON-serializable through the read boundary;
- CSV/TSV output preserves ordinary/empty/NA and explicit non-finite values;
- Artifact query/sort metadata replay remains unchanged.

Frontend/mock:

- render uses `column.type` and aligned `cell_states`, with legacy-null
  fallback, and does not infer numeric type from cell strings;
- empty and missing are distinct; special states have accessible text;
- deterministic desktop/narrow `qc_types` examples have no overlap or
  document-level horizontal overflow.

## Cross-review

- WS3-Q1 continues to own query/sort/paging/export replay. WS3-Q2 adds only
  presentation metadata and truthful rendering.
- The accepted WP2 limit, stale-token, object allowlist, and string/null cell
  compatibility contracts remain authoritative.
- Artifact provenance and CSV/TSV collision/recovery policy are unchanged.
- Broader bounded tree navigation, plot inspection, and TanStack remain outside
  this checklist item.

No persistence, approval, credential, execution, project-switch, migration, or
release conflict was found.

## Verification Matrix

```powershell
Rscript -e "devtools::test('R/rho.bridge')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-data-viewer-query-ui.mjs
node scripts/test-data-viewer-types-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

## Version And Lifecycle

- `rho.bridge` changes its additive exported page contract and advances from
  `0.1.1` to `0.1.2` with package NEWS.
- Application version remains `0.4.0-dev.0`; no distributed candidate is
  created.
- Root NEWS and the remaining-work count update only after verification.
- Installed-app/manual acceptance remains open and separate, so the document
  remains active after implementation evidence lands.

## Definition Of Done

WS3-Q2 reaches its stop when every supported state is Workspace-described and
truthfully rendered without breaking search/sort/paging/export, positive and
negative tests pass at each boundary, browser/mock parity is demonstrated,
package version and NEWS are reconciled, and the WS3 checklist count reaches
zero without claiming installed-app acceptance.

## Implementation And Evidence

Implementation completed on 2026-08-03 without contract deviations:

- Workspace R adds bounded type, class, and exact visible-page missing-count metadata
  to projected columns plus aligned cell states for ordinary, empty, missing,
  NaN, and positive/negative infinite values.
- Existing string/null cells remain compatible. Delimited export keeps empty
  and `NA` fields empty while preserving `NaN`, `Inf`, and `-Inf` text.
- The frontend renders restrained type labels, class/missing tooltips,
  accessible special-value labels, and numeric/logical alignment. Legacy null
  cells retain the missing-value fallback.
- Browser/mock mode includes the deterministic six-column `qc_types` example.
- `rho.bridge` advanced from `0.1.1` to `0.1.2`; application version remains
  `0.4.0-dev.0`.

Automated evidence:

- `Rscript -e "devtools::test('R/rho.bridge')"`: 176 passed, 0 failed,
  0 warnings, 0 skipped.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 23 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 77 passed.
- GNU `cargo fmt --all -- --check`, JavaScript syntax, Data Viewer query/type,
  Agent-first, Console/Logs, Git Review, and `git diff --check`: passed.

Browser evidence at the default desktop viewport and 800 x 900 narrow viewport:

- all six projected types and every special state rendered distinctly with
  matching accessible labels and exact class/missing tooltips;
- numeric cells were right-aligned, search for `NaN` returned exactly
  `sample_2`, and type labels survived filtered paging;
- no document-level horizontal overflow, toolbar/viewer overlap, or browser
  console error was observed. Wide tables remained bounded to their own
  scroll container.

Installed-app and exact-candidate manual acceptance were not run. This document
therefore remains active even though the WS3 checklist capability count is
zero.

# Data Viewer JSON Row Shape Repair

Status: active; DATA-VIEWER-ROW-SHAPE-R1 authorized and implemented 2026-08-11;
focused and complete affected source validation plus post-verification contract
review pass; replacement candidate construction and installed acceptance open

Date: 2026-08-11
Authorization: the project owner's standing instruction to continue repairing
and accepting every non-legal Issue and PR until closure, plus exact installed
`0.4.0-dev.30` acceptance on 2026-08-11
Change class: D1 narrow defect correction across an existing typed boundary
Risk: R2 Workspace R bridge, Ark JSON transport, Tauri response, and visible
Data Viewer workflow
Work package: DATA-VIEWER-ROW-SHAPE-R1
Owning contract:
`docs/implementation/implemented-wp2-data-viewer-interface.md`

## Reproduction And Evidence

The exact notarized `0.4.0-dev.30` DMG
`9ffafb568c78f05bfd04a0c0821dddea62c8be326bbbb359eb8932cf35a8e942`
was installed as `/Applications/Rho.app`. Workspace R started, an ordinary
two-column `data.frame` appeared automatically in Environment, and its native
object row retained focus and keyboard activation. Selecting the object always
left the Data Viewer at:

> The source changed; refresh this object before continuing. No data loaded
> yet.

Global Environment refresh, forced reinspection, and selection recovery did
not load a page. The same live Workspace R session returned
`VIEW_OK=TRUE ERROR= ROWS=50` when calling `rho_inspect_data_object()` and
`rho_read_data_view()` directly. Durable runs recorded both
`workspace.inspect_data_object` and `workspace.read_data_view` as completed at
the same state revision with no backend error.

Static and serialization review found the exact mismatch:

- the implemented WP2 JSON contract requires every row's `cells` to be an
  ordered JSON array;
- `rho_viewer_rows_payload()` uses `lapply()` over a data-frame row and retains
  the source column names on both `cells` and `cell_states`;
- `jsonlite` serializes those named lists as JSON objects; and
- `renderDataViewer()` calls `row.cells.forEach()`, so a valid broker page
  throws during presentation. The broad catch then falsely labels the client
  exception `stale_view_revision`.

The current Rust smoke proves only that `rows` is non-empty. Mock pages already
use arrays, so neither boundary catches the real named-list serialization.

## Invariant And Scope

For every supported table, matrix, assay, row-data, or column-data page:

1. `rows` is an ordered JSON array.
2. Every row's `cells` and `cell_states` are unnamed ordered arrays with exactly
   one entry per returned column, including duplicate or non-syntactic column
   labels.
3. Cell/state alignment is positional and does not derive identity from a
   display label.
4. Ark/Tauri transport preserves those arrays end to end.
5. A transport, protocol, serialization, or client-render failure is reported
   as a viewer failure. Only an actual revision/token rejection may be
   presented as stale source state.
6. Existing project, workspace revision, page/token, byte, row, column,
   filtering, sorting, missing-value, and export semantics remain unchanged.

## Authorized Repair

- Strip names from `cells` and `cell_states` at the R bridge response boundary.
- Add R regression coverage for in-memory list shape and encoded JSON array
  shape, including duplicate column labels and missing/special values.
- Extend the real Ark/Tauri smoke to reject any non-array `cells` or
  `cell_states` payload and to prove positional column alignment.
- Validate the row payload before frontend iteration and separate genuine stale
  errors from generic read/render failures. Do not silently coerce a protocol
  object into an unordered array.
- Keep browser/mock `read_data_view` parity and add a focused frontend contract
  for truthful failure classification.

No schema, store record, broker command, project identity, polling cadence,
Workspace mutation, approval, credential, filesystem, network, export, or
public-protocol authority changes. No TanStack dependency or Viewer redesign is
authorized.

## Verification And Recovery Matrix

- R unit: ordinary named data frame serializes both row vectors as arrays.
- R unit: duplicate labels, `NA`, `NaN`, infinities, empty strings, and list
  cells retain positional alignment and existing bounded representations.
- R unit: empty pages, maximum page shape, payload truncation, invalid limits,
  unsupported views, stale tokens, and query/sort behavior remain passing.
- Rust/Ark boundary: an ordinary data-frame page contains non-empty array cells
  and array states with lengths equal to returned columns.
- Frontend/mock: success renders cells; malformed row shape fails visibly as a
  protocol/viewer error; actual stale response remains stale and recoverable.
- Project isolation: existing two-project smoke and project-switch suites remain
  required; no page may survive a project or workspace identity transition.
- Manual installed candidate: create a data frame, select it by mouse and
  keyboard, observe the first bounded page, page/filter/sort it, mutate it to
  force stale state, then explicitly refresh and recover.

Run focused tests first, then JavaScript syntax and all compatible frontend
contracts, complete `rho.bridge`, locked Rust formatting/check/tests, exact
desktop smoke, `rho.agent`, and `git diff --check`. Browser/mock and exact
installed candidate review remain separate facts.

## Version, NEWS, And Stop Point

The distributed `0.4.0-dev.30` candidate is immutable and rejected by installed
acceptance. Any repair requires a new application identity
`0.4.0-dev.31`. Because the exported `rho.bridge` serialized response contract
and bundled package contents change, advance `rho.bridge` from `0.1.13` to
`0.1.14`; `rho.agent` and store schema 12 remain unchanged. Synchronize all
application version authorities and `NEWS.md` only after focused implementation
evidence passes.

Stop after the contract-complete repair, affected validation, independent
contract review, synchronized version/NEWS, and scoped source-integration
handoff. Candidate construction, installed acceptance, MAC5, publication, and
update-site mutation require a fresh `dev.31` release checklist and their own
explicit gates.

## Implementation And Review Evidence

The repair strips R list names at the response boundary, rejects malformed or
misaligned row arrays before frontend iteration, preserves explicit stale
token/revision classification, and extends the real desktop smoke through the
Ark/Tauri result. Regression coverage includes ordinary and duplicate-label
data frames, encoded JSON shape, protocol rejection, truthful error projection,
and positional array alignment.

Focused failing-first coverage reproduced four pre-fix failures: both row
vectors retained names and both encoded as JSON objects. After implementation,
the focused bridge and frontend regressions pass. Complete affected validation
passes all frontend/release contract scripts, complete `rho.bridge` and
`rho.agent` suites, locked Rust check and workspace tests, exact desktop smoke,
formatting, JavaScript syntax, and `git diff --check`.

A separate post-verification review compared the diff to this contract and the
implemented WP2 interface. It found no ownership, revision, bounds, mutation,
credential, network, filesystem, approval, project-isolation, mock-parity, or
schema expansion. The R boundary remains the sole serialization authority; the
frontend validation is fail-closed and does not coerce unordered objects; and
the stale recovery path remains available only for its two existing error
codes. No blocking deviation remains.

Application identity is synchronized at `0.4.0-dev.31`; `rho.bridge` is
synchronized at `0.1.14`; `rho.agent 0.1.5` and store schema 12 remain
unchanged. These are source facts only. Browser/mock review, exact installed
Windows/macOS acceptance, Windows signing disposition, MAC5, publication, and
update-site mutation remain open and non-composable.

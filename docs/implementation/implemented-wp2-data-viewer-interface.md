# Rho WP2 Data Viewer Interface

Status: implemented in `8982b12`; milestone-level acceptance remains separate

Date: 2026-07-25
Code baseline: `cc913a9` (`feat: add reviewed environment operation workflow`)
Contract authority: `docs/plans/active-2026-07-25-0.3x-scientific-workflow-handoff.md`

## Purpose

This document records the reviewed V1 broker contract implemented by WP2. It
remains authoritative for the current paged scientific data-viewer boundary so
later work does not drift into generic object serialization or unbounded table
browsing.

WP2 remains limited to bounded viewers for:

- plain R data frames and matrices already present in Workspace R;
- `SummarizedExperiment`;
- `SingleCellExperiment`.

The design does not authorize arbitrary R evaluation, generic S4 dumps,
metadata export, reduced dimensions, graphs, alternative experiments or nested
slot traversal.

## Request And Response Shape

WP2 uses two typed broker requests.

### `workspace.inspect_data_object`

Purpose: return bounded metadata and the list of supported paged views for one
object already present in Workspace R.

Request JSON:

```json
{
  "type": "workspace.inspect_data_object",
  "expected_workspace": {
    "workspace_id": "desktop_...",
    "state_revision": 12,
    "project_revision": 4
  },
  "arguments": {
    "object_name": "sce"
  }
}
```

Response JSON:

```json
{
  "ok": true,
  "workspace": {
    "workspace_id": "desktop_...",
    "state_revision": 12,
    "project_revision": 4
  },
  "object": {
    "name": "sce",
    "class": ["SingleCellExperiment", "SummarizedExperiment"],
    "display_kind": "single_cell_experiment",
    "dimensions": { "rows": 2000, "columns": 500 },
    "view_token": "sha256:...",
    "views": [
      { "kind": "assay", "key": "counts", "rows": 2000, "columns": 500 },
      { "kind": "row_data", "key": "rowData", "rows": 2000, "columns": 8 },
      { "kind": "col_data", "key": "colData", "rows": 500, "columns": 12 }
    ],
    "truncated": false,
    "truncation_reason": null
  }
}
```

Notes:

- `view_token` is an opaque token generated from the inspected object name,
  class, selected view inventory and current workspace identity.
- Unsupported objects return `ok: false` with `error_code =
  "unsupported_object_class"` and a user-safe message.
- Missing optional packages return `ok: false` with `error_code =
  "optional_package_unavailable"`.

### `workspace.read_data_view`

Purpose: return one bounded page from a supported object view.

Request JSON:

```json
{
  "type": "workspace.read_data_view",
  "expected_workspace": {
    "workspace_id": "desktop_...",
    "state_revision": 12,
    "project_revision": 4
  },
  "arguments": {
    "object_name": "sce",
    "view_token": "sha256:...",
    "view_kind": "assay",
    "view_key": "counts",
    "row_offset": 0,
    "row_limit": 50,
    "column_offset": 0,
    "column_limit": 20
  }
}
```

Response JSON:

```json
{
  "ok": true,
  "workspace": {
    "workspace_id": "desktop_...",
    "state_revision": 12,
    "project_revision": 4
  },
  "page": {
    "object_name": "sce",
    "view_kind": "assay",
    "view_key": "counts",
    "view_token": "sha256:...",
    "total_rows": 2000,
    "total_columns": 500,
    "row_offset": 0,
    "row_limit": 50,
    "column_offset": 0,
    "column_limit": 20,
    "columns": [
      { "name": "cell_001", "label": "cell_001" }
    ],
    "rows": [
      {
        "row_name": "gene_001",
        "cells": ["0", "2", "7"]
      }
    ],
    "truncated": false,
    "truncation_reason": null,
    "payload_bytes": 18234
  }
}
```

Notes:

- All cell values cross the broker as bounded UTF-8 strings.
- Duplicate column names are preserved in `label`; the UI must not invent a new
  semantic identity from display text alone.
- Missing values remain explicit empty JSON values, not literal `"NA"` unless
  the underlying adapter intentionally formats them that way for a given view.

## Limits

The V1 response contract is fixed:

- maximum `row_limit`: `100`;
- maximum `column_limit`: `50`;
- maximum UTF-8 text per cell: `4096` bytes;
- maximum serialized JSON response size per viewer response: `1 MiB`.

Requests above the supported row or column limit are rejected with
`error_code = "page_limit_exceeded"` and the supported maximum in the error
payload. The broker does not silently clamp.

If the response would cross `1 MiB`, the adapter must stop before the boundary,
return the partial page, set `truncated = true`, and provide a concrete
`truncation_reason` such as `payload_limit`, `cell_limit` or `unsupported_cell`.

## Stale Revision Behavior

Viewer paging must be bound to the inspected object and the workspace revision
that produced the inspection response.

Rules:

- every inspect and page request carries `expected_workspace`;
- every page request must echo the latest `view_token`;
- if `workspace_id`, `state_revision` or `project_revision` changed, the broker
  rejects the page with `error_code = "stale_view_revision"`;
- if the token no longer matches the inspected object shape or available view
  set, the broker rejects the page with `error_code = "stale_view_token"`;
- stale responses do not fall back to a fresh read silently; the UI must ask
  for a reload from the new object state.

This keeps table browsing honest when the object is replaced, mutated or
removed between page requests.

## Fixture Version Recording

WP2 test fixtures must record the exact package versions used to generate the
Bioconductor fixture objects. The version record is part of the repository
fixture metadata, not a runtime guess.

Fixture metadata fields:

```json
{
  "fixture_name": "sce_minimal_counts",
  "class": "SingleCellExperiment",
  "bioconductor_version": "3.x",
  "packages": {
    "SummarizedExperiment": "x.y.z",
    "SingleCellExperiment": "x.y.z"
  }
}
```

Rules:

- the metadata file is committed with the fixture object;
- tests assert against the recorded versions when the fixture is loaded;
- optional package absence at application startup remains supported;
- the desktop UI never offers package installation to make a viewer work.

The first implementation change may replace the placeholder `x.y.z` values only
when the actual fixture files are added in the same reviewed package.

## UI States

The initial UI state machine is intentionally small:

- `idle`: no supported object selected;
- `loading`: inspect or page request in flight;
- `ready`: summary plus one visible bounded page rendered;
- `truncated`: page rendered with an explicit boundedness warning;
- `stale`: current page invalid because workspace or object revision changed;
- `unsupported`: selected object exists but the class is outside the approved
  V1 allowlist;
- `missing_dependency`: optional Bioconductor package needed by the object
  class is unavailable;
- `error`: transport, adapter or serialization failure with a retry action.

UI rules:

- the viewer lives in the existing Analyze / Environment workflow and remains
  keyboard navigable;
- pagination controls are disabled while `loading`;
- stale state offers reload, not silent auto-refresh;
- visible-page export is governed by the later implemented WP3 artifact
  contract; it is not part of the WP2 viewer read contract.

## Implemented Boundary

The broker, R adapters, tests, and viewer UI are implemented against this
contract. Implementation and review evidence is recorded in
`docs/verification/wp2/verification.md`. Expansion of supported object classes,
views, limits, or evaluation behavior still requires a reviewed contract
amendment.

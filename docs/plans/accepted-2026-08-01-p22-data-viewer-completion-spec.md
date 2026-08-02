# P2-2 Data Viewer Completion Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P2-2

## Scope

Close the remaining data viewer gaps without introducing TanStack Table
(heavy dependency, deferred). Enhance the existing vanilla table with:

1. Page size selector (25/50/100 rows)
2. Frozen row-name column (first column sticky)
3. Complete keyboard navigation (Tab/Shift+Tab between cells)
4. Row count display in status bar

This spec does **not** authorize:
- TanStack Table integration
- Column resize/reorder
- Multi-sort
- Cell editing

## Requirements

### R1: Page size selector

Add a dropdown next to the navigation buttons: `25 | 50 | 100`. Default 25.
Changing the page size triggers a server fetch with the new row limit.
The `read_data_view` call already supports `row_limit` parameter.

### R2: Frozen identifier column

Fix the existing CSS sticky positioning for the first column (row name).
Currently `.data-viewer-table th:first-child, .data-viewer-table td:first-child`
has `position: sticky; left: 0` but it's incomplete:
- Need `z-index: 2` to stay above scrollable cells
- Need proper background on sticky cells during scroll
- The `#` header column should also be frozen

### R3: Keyboard navigation

- Tab/Shift+Tab: move focus between cells in the visible table
- Keyboard focus ring visible (already via `:focus-visible`)
- Focus trap: Tab from last cell wraps to first cell or exits table

### R4: Row count display

In the existing `#dataViewerMeta` or a new element, show:
`Showing rows 1-25 of 1,234` (format with locale separators).

## Non-Goals

- NO TanStack Table
- NO column resize/reorder
- NO multi-sort
- NO cell editing

## Verification

- `node --check desktop/dist/app.js` passes

## Task Decomposition

1. [ ] Add page size selector (HTML + JS)
2. [ ] Fix frozen first column CSS
3. [ ] Add Tab/Shift+Tab cell navigation
4. [ ] Add row count display
5. [ ] Verify JS + commit

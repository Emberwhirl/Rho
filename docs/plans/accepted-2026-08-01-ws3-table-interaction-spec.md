# WS3-P1: Sortable Data Viewer Columns

Status: accepted focused implementation; broader WS3 inspection scope remains open
Parent: Wave 10 WS3 table interaction

## Scope

Add click-to-sort column headers to the existing data viewer table. Sort is server-side via `read_data_view` with sort params.

## Implementation

### HTML
Add `aria-sort` attribute to column headers for accessibility.

### JS
- Click handler on `<th>` elements toggles sort: none → asc → desc → none
- Sort state: `{ column, direction: "asc"|"desc" }`
- Pass sort params to `read_data_view` request
- Visual indicator: ▲/▼ in header text

### CSS
- `.data-viewer-table th[aria-sort]` — cursor pointer, hover highlight
- Sort indicator color

### Server
- `read_data_view` already accepts `sort_column` and `sort_direction` (or we pass them as additional args)
- If not supported, fall back to client-side sort of current page

## P2: Keyboard Navigation

- Arrow keys navigate cells within visible table
- Tab/Shift+Tab move between toolbar and table
- Focus ring visible

## P3: Responsive Evidence

- `max-width: 100%` and `overflow-x: auto` on table wrapper
- Narrow window (900px) text truncation with ellipsis
- Scroll indicators when content overflows

## Stop point

JS syntax OK. 72 tests pass.

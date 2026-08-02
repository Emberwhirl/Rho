# rho.bridge 0.1.2

- Added additive column type/class/missing-count metadata and aligned cell
  states for ordinary, empty, missing, NaN, and infinite values.
- Preserved explicit `NaN`, `Inf`, and `-Inf` text while retaining null for R
  missing values and compatibility with existing delimited export.

# rho.bridge 0.1.1

- Added bounded, case-insensitive literal search across row names and all view
  cells before paging.
- Added stable Workspace-owned sorting by absolute column index, with missing
  values last and structured rejection for invalid or unsupported requests.
- Data Viewer pages now report source and matched row counts plus normalized
  query/sort state for exact visible-page export replay.

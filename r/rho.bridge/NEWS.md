# rho.bridge 0.1.4

- Added evidence-bound direct, transitive, and unclassified dependency roles
  from the project DESCRIPTION and bounded lockfile requirements graph.
- Added credential-safe repository, remote, URL, and project-local package
  source metadata to lockfile and installed-library inventory rows.

# rho.bridge 0.1.3

- Added a bounded, project-root-explicit lockfile and installed-library union
  with matched, version-mismatch, not-installed, and not-locked states.
- Added truthful missing, malformed, unavailable, source-limit, and file-size
  states while selecting duplicate installed packages by `.libPaths()` order.

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

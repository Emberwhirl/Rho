# WP2 Verification

Date: 2026-07-25

This directory records the evidence used to close WP2.

## Contract Coverage

- Bounded page inspection and reads are implemented in `r/rho.bridge/R/workspace.R`
  through `rho_inspect_data_object()` and `rho_read_data_view()`.
- Desktop broker wiring for `workspace.inspect_data_object` and
  `workspace.read_data_view` is implemented in
  `crates/rho-server/src/coordinator.rs` and `desktop/src-tauri/src/main.rs`.
- The Environment-panel viewer and visible-page export flow are implemented in
  `desktop/dist/app.js`, `desktop/dist/index.html` and
  `desktop/dist/styles.css`.

## Automated Evidence

- `Rscript -e "testthat::test_local('r/rho.bridge')"` passed with `122` tests.
  Coverage includes:
  - zero, exact-limit and over-limit page windows;
  - long strings, list columns, missing values, Unicode and duplicate names;
  - stale tokens;
  - unsupported S4 classes;
  - explicit optional-package unavailability;
  - SummarizedExperiment and SingleCellExperiment fixtures with exact package
    version metadata;
  - payload-byte assertions for inspect/page responses.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server -p rho-desktop`
  passed.
- `target/debug/rho-desktop.exe --smoke-test` passed and wrote
  `wp2-smoke.json`, proving:
  - Workspace R startup;
  - object visibility in Environment;
  - paged data viewing;
  - stale revision rejection after workspace mutation.

## Visual Evidence

- `wp2-viewer-desktop.png`
- `wp2-viewer-narrow.png`

These screenshots were generated from browser preview mode with:

- `file:///E:/YuNotebooks/01_Development/source/Rho/desktop/dist/index.html?preview=wp2-data-viewer&object=qc`

Additional DOM/layout evidence:

- `wp2-viewer-desktop-dom.html`
- `wp2-viewer-narrow-dom.html`

Both DOM captures record:

- `active_context_tab = "environment"`
- `search_with_preview = false`
- `actions_with_table = false`

This verifies that the preview was open on the Environment viewer and that the
key controls did not overlap at desktop and narrow widths.

## Fixture Evidence

- `wp2-bioconductor-fixtures.json`
- `summarized-experiment-minimal.rds`
- `single-cell-experiment-minimal.rds`

The fixture metadata records:

- `Bioconductor 3.23`
- `SummarizedExperiment 1.42.0`
- `SingleCellExperiment 1.34.0`

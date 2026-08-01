# WS1 Package Inventory Spec

Status: accepted

Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P3-1
Related design: `proposed-2026-07-26-rstudio-inspired-workflow-design.md` §WS1

## Scope

This spec defines the **read-only package inventory** surface for the Rho
Environment panel. It does **not** authorize:

- individual package installation, removal, or update;
- library-path management UI;
- CRAN/Bioconductor update checking;
- silent installation of `renv`, `BiocManager`, or any other package.

The existing `environment.initialize` / `environment.restore` /
`environment.snapshot` mutation operations remain unchanged. This spec adds
the browsable inventory that surrounds them.

## Entry Gate

Implementation is authorized. This is a bounded work package: one Tauri
command, one R bridge function, frontend list component, and snapshot
integration. Stop for review after all four items.

## Requirements

### R1: Installed package list

A new Tauri command `list_installed_packages` returns a bounded, searchable
list of packages installed in the Workspace R library paths.

Fields per package:

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | Package name |
| `version` | `String` | Installed version string |
| `library` | `String` | Library path (abbreviated) |
| `priority` | `Option<String>` | `"base"`, `"recommended"`, or `null` |
| `built` | `Option<String>` | R version the package was built under |

Bounding: max 500 packages returned. Exceeding this count sets a `truncated`
flag and a `truncated_reason` message. The response includes `total_count`
so the frontend can show "Showing 500 of 1,234 packages."

### R2: R bridge function

Add `rho_list_installed_packages(limit = 500L)` to the workspace bridge.
It wraps `utils::installed.packages()` and returns a JSON object with
`packages`, `total_count`, and `truncated`.

Existing `rho_installed_packages()` in `workspace.R` already returns
`{values: [...], truncated, incomplete_reason}`. Extend it to also return
`total_count`, then create a workspace-inspectable entry point that the
coordinator can route.

### R3: Coordinator dispatch

Add `"workspace.list_installed_packages"` to the bridge expression router.
Classify as `OperationClass::Probe` (read-only, no mutation). The
expression calls `rho_list_installed_packages()`.

### R4: Frontend package list

Replace the current simple "Loaded packages" section in the Environment
panel with a searchable installed-package list.

Behavior:

- Loaded packages remain highlighted (bold or accent dot).
- A filter text input narrows the displayed list client-side.
- Base/recommended packages are grouped or visually distinguished.
- Each row shows: name, version, library (abbreviated).
- The list re-renders when the environment snapshot refreshes.
- If the list is truncated, show "Showing N of M packages."

### R5: Snapshot integration

The existing `refreshEnvironment()` call already triggers
`snapshot_workspace` which calls `rho_environment_snapshot()`. After the
snapshot returns, the frontend calls `list_installed_packages` to populate
the package list.

Do NOT change the snapshot payload format. The package list is fetched
separately and composed in the frontend.

### R6: Browser/mock parity

Add a mock handler for `list_installed_packages` in `desktop/dist/app.js`
that returns representative package data (base R packages + a few
Bioconductor packages) for browser-mode preview.

## Non-Goals

- NO package install/remove/update mutations
- NO library path management
- NO CRAN/Bioconductor update checking  
- NO lockfile editor or diff viewer (that's a separate WS1 sub-package)
- NO changes to the public Workbench Protocol
- NO changes to `environment.initialize` / `environment.restore` /
  `environment.snapshot` lifecycle

## Verification

- `cargo test --workspace` passes
- `node --check desktop/dist/app.js` passes
- `cargo fmt --all -- --check` passes
- Browser mock renders a package list without errors
- The package list in the Environment panel shows real data from a
  workspace snapshot refresh

## Task Decomposition

1. [ ] Add `rho_list_installed_packages()` to `r/rho.bridge/R/workspace.R`
2. [ ] Add `"workspace.list_installed_packages"` dispatch to coordinator
3. [ ] Add `list_installed_packages` Tauri command to `main.rs`
4. [ ] Add frontend package list UI to `app.js` + `index.html` + `styles.css`
5. [ ] Add browser mock handler
6. [ ] Verify: build + tests + fmt + JS syntax

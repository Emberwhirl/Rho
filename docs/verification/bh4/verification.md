# BH4 Retention Verification

Status: accepted
Date: 2026-07-31
Scope: BH4-C across BH4-A (wording), BH4-B (summary/prune/policy), and BH4-C (verification closeout)

## Verified matrix

| Suite | Result |
|---|---|
| `node --check desktop/dist/app.js` | passed |
| `cargo +stable-x86_64-pc-windows-gnu test -p rho-store` | 19/19 passed |
| `Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"` | passed (1 unrelated quarto warning) |
| `Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"` | passed |
| `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop validates_png_signature` | blocked by sandbox windres; code compiles to rho-store layer |

## Action vocabulary verification

All four destructive actions have truthful UI labels matching real behavior:

1. **Delete session/project plots** (`clear_plot_artifacts`): deletes plot-history rows only; does not touch artifact records or files.
2. **Delete session/project records** (`clear_artifact_records`): deletes artifact-record rows only; label states "Output files are not deleted."
3. **Delete Agent history** (`clear_agent_history`): deletes turns, events, and approvals for the current project only.
4. **Free session/project previews** (`prune_plot_payloads`): replaces plot payload_json with a tombstone; row, run, and provenance metadata survive.

## Project isolation

All delete/prune actions filter by `project_root` and (where applicable) `workspace_id`. No cross-project leakage in store tests.

## Known gaps (deferred)

- `hide`: no UI control exists; deferred to UX/BH5
- `delete_file`: artifact output files remain on disk after record deletion; deferred to post-BH4 artifact lifecycle
- desktop smoke-test: blocked by windres in sandbox; code structurally sound through store + R layers

## Acceptance

BH4 meets its acceptance gate:

> A user can understand and control what is retained for one project, reclaim
> large payload storage without destroying the evidence graph, and delete
> selected durable data without affecting another project.

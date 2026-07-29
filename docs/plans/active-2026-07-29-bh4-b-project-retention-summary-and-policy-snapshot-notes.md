# Notes: BH4-B project retention summary and policy snapshot

Status: accepted

## Why This Slice First

BH4 still lacks a trustworthy answer to a simple question: "What is this
project retaining right now?" Without that, quota and prune rules would be
guesses wrapped in code.

## Current Measurement Boundary

- Plot-history payload bytes are measured from `plot_artifacts.payload_json`.
- Artifact-record metadata bytes are measured from
  `artifact_records.metadata_json`.
- Session scope is limited by the active `workspace_id`.
- Project scope is limited by the active `project_root`.

This slice intentionally does not measure on-disk artifact file sizes yet.
That is a later policy/detail decision, not a prerequisite for exposing the
current database burden.

## Current Policy Snapshot

- Plot history can be manually deleted by session or by project.
- Artifact records can be manually deleted by session or by project.
- Agent history can be manually deleted by project.
- Output files are not deleted by the current record/history actions.
- Automatic pruning is not implemented.
- Quota enforcement is not implemented.

## Implemented In This Pass

- Added store-side project/session retention summary queries for
  `plot_artifacts` and `artifact_records`.
- Exposed the summary through a new desktop/Tauri command:
  `get_project_retention_summary`.
- Added browser/mock parity for the same command.
- Added a retention summary card to the current artifacts panel showing:
  - plot-history row count
  - approximate plot payload bytes
  - artifact-record row count
  - approximate artifact metadata bytes
  - truthful current policy statements for delete, files, auto prune, and
    quotas

## Validation Results

- `node --check desktop/dist/app.js`: passed
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store summarizes_retention_by_project_and_session_scope`: passed
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop validates_png_signature`: passed
- `git diff --check`: passed apart from existing LF->CRLF warnings from the
  Windows working tree

## Remaining BH4-B Work After This Slice

- define quota numbers and overflow behavior;
- add prune order and write paths;
- preserve tombstones or retained metadata when payload/file deletion lands.

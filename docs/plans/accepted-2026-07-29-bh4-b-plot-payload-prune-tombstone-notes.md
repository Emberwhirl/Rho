# Notes: BH4-B plot payload prune tombstone

Status: accepted

## Why This Slice

`plot_artifacts` is the safest place to make `prune_payload` real because it is
bounded display history, not the durable exported output record.

## Intended Contract

- `delete plot history` removes rows.
- `free preview storage` removes only preview payloads.
- exported plot files remain untouched.
- artifact records remain untouched.

## Tombstone Plan

Replace `payload_json` with a small JSON object that records:

- the fact that the payload was pruned;
- when it was pruned;
- the original media type;
- why it was pruned.

This keeps the plot-history row queryable while making preview loss explicit.

## Implemented In This Pass

- Added `prune_plot_artifact_payloads()` in `rho-store`.
- Replaced pruned `payload_json` content with a bounded tombstone object instead
  of deleting plot rows.
- Added a new Tauri command: `prune_plot_payloads`.
- Added desktop/mock controls for `Free session previews` and
  `Free project previews`.
- Updated plot rendering so pruned previews show as `Preview pruned` instead of
  masquerading as a deleted plot.

## Validation Results

- `node --check desktop/dist/app.js`: passed
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store prunes_plot_payloads_with_project_and_session_tombstones`: passed
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop validates_png_signature -- --exact`: passed
- `git diff --check`: passed apart from existing LF->CRLF working-tree warnings

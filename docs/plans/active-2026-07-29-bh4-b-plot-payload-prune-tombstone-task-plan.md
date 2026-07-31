# Task Plan: BH4-B plot payload prune tombstone

Status: accepted

## Goal

Land the first BH4-B write path by pruning plot preview payloads while keeping
plot-history rows and provenance intact.

## Phases

- [x] Phase 1: Fix the slice boundary
- [x] Phase 2: Implement prune/tombstone behavior
- [x] Phase 3: Validate and record results

## Key Questions

1. How do we reclaim plot payload bytes without deleting plot rows?
2. What tombstone metadata is enough to keep the row truthful?
3. How should the desktop say `prune` so it is not confused with delete?

## Decisions Made

- This slice targets `plot_artifacts` only.
- Tombstones stay inside `payload_json` to avoid a new schema bump.
- The first UI wording follows the BH4 design guidance: reclaim preview
  storage, not delete records.

## Validation

- `node --check desktop/dist/app.js`
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store prunes_plot_payloads_with_project_and_session_tombstones`
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop validates_png_signature -- --exact`
- `git diff --check`

## Status

**Closed for BH4-B plot prune slice** - manual plot payload pruning now
reclaims preview storage with tombstones while keeping plot-history rows in
place. Remaining BH4-B work is quota/default/prune-order policy beyond this
single write path.

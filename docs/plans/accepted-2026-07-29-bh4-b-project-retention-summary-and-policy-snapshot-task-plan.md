# Task Plan: BH4-B project retention summary and policy snapshot

Status: accepted

## Goal

Land the first BH4-B vertical slice by making current retention measurable and
visible before any prune/delete policy broadens.

## Phases

- [x] Phase 1: Narrow BH4-B into a read-only slice
- [x] Phase 2: Implement store and desktop summary flow
- [x] Phase 3: Validate and record results

## Key Questions

1. What can we measure now without inventing new retention behavior?
2. Which byte counts are truthful with the current schema?
3. How do we state the current policy without implying quota/prune behavior
   that does not exist yet?

## Decisions Made

- BH4-B starts with a read-only summary instead of immediate prune/tombstone
  writes.
- The first measurement uses current durable columns only:
  `plot_artifacts.payload_json` and `artifact_records.metadata_json`.
- The policy snapshot describes current facts: manual record deletion exists;
  automatic prune/quota behavior does not.

## Validation

- `node --check desktop/dist/app.js`
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-store summarizes_retention_by_project_and_session_scope`
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop validates_png_signature`
- `git diff --check`

## Status

**Closed for BH4-B slice 1** - the project retention summary, policy snapshot,
desktop wiring, mock path, and focused verification are complete. Remaining
BH4-B work is quota/prune/tombstone write behavior, which still requires a
separate focused slice.

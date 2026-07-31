# BH4-C Deletion Controls And Acceptance Notes

Status: accepted
Date: 2026-07-31

## What BH4-C did

BH4-C is a verification and governance closeout slice. No new code. It:

1. Inventoried all four destructive actions and confirmed each UI label is truthful.
2. Ran `node --check`, `cargo test -p rho-store` (19/19), and both R testthat suites.
3. Updated all governance docs to mark BH4 accepted.
4. Created `verification/bh4/verification.md` with full matrix results.

## Acceptance

BH4 meets its gate: a user can understand and control retention per project,
reclaim plot payload storage with tombstone preservation, and delete
selected durable data scoped to one project.

## Remaining known gaps (deferred)

- `hide`: no UI control; deferred to UX/BH5
- `delete_file`: artifact output files stay on disk after record deletion
- desktop smoke-test: sandbox windres limitation; store + R layers confirmed

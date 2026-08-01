# BH4-C Deletion Controls And Acceptance Spec

Status: accepted
Date: 2026-07-31
Scope: BH4-C verification, docs, and acceptance closeout

## Goal

Verify that every delete/prune action is truthful, project-scoped, and
does not silently destroy evidence. Produce acceptance evidence and update
governance docs to mark BH4 complete.

## Rules

1. Every destructive action label in the UI must match its real behavior.
2. No action may cross project boundaries.
3. Pruned plot payloads must preserve the plot row and provenance metadata.
4. Deleted artifact records must state that output files remain on disk.
5. The full affected matrix must pass before acceptance.

## Action inventory (current state)

| UI label | Backend command | Real behavior | Truthful? |
|---|---|---|---|
| Delete session/project plots | `clear_plot_artifacts` | Deletes plot rows | Yes |
| Delete session/project records | `clear_artifact_records` | Deletes rows; files stay | Yes |
| Delete history | `clear_agent_history` | Deletes turns, events, approvals | Yes |
| Free session/project previews | `prune_plot_payloads` | Replaces payload with tombstone; row stays | Yes |

## Out of scope

- `hide` action (deferred to UX/BH5)
- `delete_file` action (deferred to post-BH4 artifact lifecycle)
- automatic quota enforcement (BH4-C is verification only)

## Verification commands

```
node --check desktop\dist\app.js
Rscript -e "testthat::test_local('r/rho.bridge', reporter = 'summary')"
Rscript -e "testthat::test_local('r/rho.agent', reporter = 'summary')"
cargo +stable-x86_64-pc-windows-gnu test --workspace
cargo +stable-x86_64-pc-windows-gnu run -p rho-desktop -- --smoke-test
```

## Acceptance criteria

> A user can understand and control what is retained for one project, reclaim
> large payload storage without destroying the evidence graph, and delete
> selected durable data without affecting another project.

## Related

- [`active-2026-07-29-bh4-retention-privacy-artifact-lifecycle-handoff.md`](../plans/active-2026-07-29-bh4-retention-privacy-artifact-lifecycle-handoff.md)

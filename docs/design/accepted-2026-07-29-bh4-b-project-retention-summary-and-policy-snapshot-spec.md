# BH4-B Spec: Project Retention Summary And Policy Snapshot

Status: accepted

## Goal

Add one truthful read-only view that reports how much plot-history payload and
artifact-record metadata the active project is retaining today, together with
the currently implemented retention policy.

## Scope

BH4-B slice 1 implements:

- a store summary query that measures plot-history and artifact-record storage
  for one project;
- session-scoped and project-scoped counts/approximate byte totals using the
  current durable rows only;
- a desktop/Tauri command that exposes that summary without mutating retained
  data;
- a browser/mock implementation and UI card that shows the summary and the
  current policy snapshot.

## Non-Goals

This slice does not implement:

- automatic pruning;
- quota enforcement;
- payload tombstones;
- file deletion;
- metadata schema changes;
- background cleanup.

## Measurement Rules

1. Measurement is project-scoped. It must never aggregate another project's
   rows.
2. Session measurement is a bounded subset of the active project using the
   active `workspace_id`.
3. Plot payload size is approximated by `length(payload_json)`.
4. Artifact metadata size is approximated by `length(metadata_json)`.
5. The policy snapshot must be truthful about the current implementation:
   manual delete actions exist; automatic pruning and quota enforcement do not.

## Verification

- store tests prove project and session summaries stay isolated;
- desktop build/test compilation proves the new Tauri command and types are
  wired correctly;
- `node --check desktop/dist/app.js` passes.

## Acceptance Gate

BH4-B slice 1 is accepted only when:

> the active project can show a truthful retention summary and policy snapshot
> without deleting, pruning, or mutating retained data.

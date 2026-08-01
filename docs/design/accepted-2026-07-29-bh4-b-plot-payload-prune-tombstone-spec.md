# BH4-B Spec: Plot Payload Prune Tombstone

Status: accepted

## Goal

Implement one real `prune_payload` path for plot history: reclaim preview
payload storage while preserving the plot-history row and its provenance.

## Scope

This slice implements:

- a project-scoped and session-scoped manual prune operation for
  `plot_artifacts.payload_json`;
- a tombstone payload that keeps plot-history records referentially valid after
  preview payload removal;
- truthful desktop/mock wording for reclaiming preview storage;
- display behavior that distinguishes a pruned preview from a deleted record.

## Non-Goals

This slice does not implement:

- automatic pruning;
- quotas or overflow policy;
- artifact-record metadata pruning;
- output-file deletion;
- schema migration or new durable columns.

## Required Behavior

1. Pruning is confined to the active project and optional active session.
2. Pruning does not delete `plot_artifacts` rows.
3. A pruned row keeps enough tombstone metadata to remain inspectable and
   distinguishable from deletion.
4. Exported artifact files and artifact records are untouched.
5. Re-running prune on an already pruned payload is a no-op.

## Tombstone Shape

`payload_json` is replaced with a bounded JSON object containing at least:

- `rho/pruned: true`
- `rho/pruned_at`
- `rho/original_media_type`
- `rho/prune_reason`

## Verification

- store tests prove prune stays project/session-scoped, preserves row counts,
  and reduces measured payload bytes;
- desktop/mock syntax/build checks pass;
- UI wording matches payload prune rather than record deletion.

## Acceptance Gate

This slice is accepted only when:

> a user can free preview storage for plot history without deleting plot rows,
> exported files, or artifact provenance.

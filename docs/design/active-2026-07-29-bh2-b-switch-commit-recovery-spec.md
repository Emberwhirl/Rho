# BH2-B Spec: Synchronized Commit and Recovery

Status: accepted

## Goal

Upgrade project switching from "try a few steps and hope" into a broker-owned commit/recovery sequence with explicit success, restore, and fatal boundaries.

## Required Outcomes

### `ready`

Return `ready` only after all of the following have succeeded for the target project:

1. `workspace.set_project_root`
2. target watcher creation and replacement
3. store active project root update
4. `last_opened_project` update
5. frontend publication of the target project and target session snapshot

### `blocked`

Keep the BH2-A blocker contract unchanged. `blocked` remains a preflight outcome and performs no switch side effects.

### `failed_restored`

If `workspace.set_project_root` succeeded but any later step fails, the desktop must:

1. attempt to restore the previous workspace root;
2. restore the previous store active root;
3. keep or restore the previous watcher;
4. preserve the previous project session and UI identity;
5. return a structured `failed_restored` result with bounded reason data.

### `fatal`

If both the forward path and the restore path fail, return a structured `fatal` result with `restart_required = true` and do not publish the target project to the UI.

## Ordered Commit Sequence

1. Preflight via existing BH2-A blocker contract.
2. Snapshot previous switch state:
   - previous root
   - previous session snapshot
   - previous watcher presence
3. Sync Workspace R to target root.
4. Create/arm target watcher.
5. Update store active project root to target root.
6. Persist `last_opened_project` for target root.
7. Publish target root + target session snapshot to the UI.
8. Stop the previous watcher only after the target watcher is installed.
9. Emit a bounded `success` switch event.

## Ordered Restore Sequence

If any step from 4-7 fails after workspace sync:

1. try to restore Workspace R to previous root;
2. restore store active root to previous root;
3. keep previous watcher or reinstall it if replacement already happened;
4. keep previous UI root and previous session snapshot;
5. emit a bounded `failed_restored` event.

If restore itself fails:

1. do not publish the target root to the UI;
2. return structured `fatal`;
3. emit a bounded `fatal` switch event;
4. require restart for a clean recovery.

## State Rules

- `state.project_root` changes only on committed success.
- `last_opened_project` changes only on committed success.
- Failed restore keeps the previous root and previous session snapshot.
- No mixed state where workspace/store/watcher/UI disagree may be exposed as success.

## Result Shape Additions

`ProjectRestoreResponse` should gain structured recovery fields rather than relying on thrown string errors for BH2-B outcomes. The result must be sufficient for frontend and mock parity.

Suggested fields:

- `status`: `ready | blocked | unavailable | cancelled | failed_restored | fatal`
- `reason_code`: optional bounded machine-readable code
- `message`: optional bounded human-readable summary
- `restored_root`: optional previous root when failed restore succeeds
- `restart_required`: boolean for fatal paths

## Logging

Write bounded switch events for:

- `project_switch_blocked`
- `project_switch_succeeded`
- `project_switch_failed_restored`
- `project_switch_fatal`

Each event should include only bounded identifiers and reason codes, not unbounded payloads.

## Validation Targets

- target watcher failure after workspace sync returns `failed_restored`;
- store update failure after workspace sync returns `failed_restored`;
- `last_opened_project` write failure returns `failed_restored`;
- rollback failure returns `fatal` and `restart_required = true`;
- old session snapshot survives `failed_restored`;
- committed success updates target root, target watcher, target session, and `last_opened_project`.

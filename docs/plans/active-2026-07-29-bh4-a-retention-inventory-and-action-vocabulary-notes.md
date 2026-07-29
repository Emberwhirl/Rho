# Notes: BH4-A retention inventory and action vocabulary

Status: accepted

## Inventory Of Current Implemented Actions

### Agent history

- Frontend button: `#clearAgentHistoryButton`
- Frontend confirmation: `Clear all Agent history?`
- Tauri command: `clear_agent_history`
- Store behavior: deletes `approval_requests`, `agent_turn_events`, and
  `agent_turns` for the active `project_root`
- Truthful current effect: delete conversation history for the active project

### Plot history

- Frontend buttons:
  - `#clearSessionPlotsButton`
  - `#clearProjectPlotsButton`
- Frontend confirmation: `Clear plots from ${scope}?`
- Tauri command: `clear_plot_artifacts`
- Store behavior: deletes rows from `plot_artifacts`
- Truthful current effect: delete plot-history records for the selected scope;
  this is not just payload pruning and not exported-file deletion

### Output records

- Frontend buttons:
  - `#clearSessionArtifactsButton`
  - `#clearProjectArtifactsButton`
- Frontend confirmation: `Clear artifact records from ${scope}?`
- Tauri command: `clear_artifact_records`
- Store behavior: deletes rows from `artifact_records`
- Truthful current effect: delete output records for the selected scope; this
  does not delete output files

## BH4-A Boundary

- In scope now:
  - inventory current behavior
  - replace bare `Clear` UI wording with truthful action names
  - keep browser/mock desktop wording aligned
- Out of scope now:
  - quotas and measurement
  - tombstones or metadata preservation
  - file deletion
  - payload pruning
  - recovery UI or undo flows
  - backend command renames

## Existing Wording Guidance

`docs/design/proposed-2026-07-26-intuitive-interaction-and-guided-workflows-design.md`
already says bare `Clear` should be replaced with explicit labels such as:

- `Hide from this view`
- `Free preview storage`
- `Delete conversation history`
- `Delete output record`
- `Delete output file`

Current desktop behavior only justifies the delete-record/history forms above.

## Implemented In This Pass

- Added BH4-A task-plan, notes, and focused spec files under `docs/`.
- Updated the current desktop button labels/titles so these actions no longer
  present themselves as bare `Clear`:
  - Agent history -> `Delete history`
  - session/project plot actions -> `Delete session plots` /
    `Delete project plots`
  - session/project artifact-record actions -> `Delete session records` /
    `Delete project records`
- Updated confirmations and toasts so they explicitly say whether the action
  deletes records/history and whether output/exported files remain in place.

## Validation Results

- `node --check desktop/dist/app.js`: passed
- `git diff --check`: passed

## Remaining Work

- BH4-B: define quotas, retention defaults, prune order, and tombstone or
  retained-metadata behavior.
- BH4-C: wire full delete/prune/hide behavior and add broader affected
  validation plus acceptance evidence.

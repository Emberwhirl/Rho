# BH4-A Spec: Retention Inventory And Action Vocabulary

Status: accepted

## Goal

Stop using ambiguous user-facing `Clear` wording for actions that already
delete project-owned durable records.

## Scope

BH4-A implements:

- an inventory of current desktop retention/destructive actions in BH4 scope;
- truthful wording for the currently implemented Agent-history, plot-history,
  and output-record deletion actions;
- aligned button labels, titles, confirmations, and toasts in browser/mock
  desktop UI.

BH4-A may amend only the current desktop HTML/JS wording plus the planning/spec
documents needed to keep the BH4-A contract accurate.

## Non-Goals

BH4-A does not implement:

- new deletion behavior;
- backend command renames;
- quotas, retention defaults, prune order, or maintenance;
- tombstones or metadata preservation;
- output-file deletion;
- payload pruning;
- recovery/undo UI.

## Current Behavior Inventory

### Agent history

`clear_agent_history` deletes Agent turns, Agent turn events, and approval
requests for the active project root.

### Plot history

`clear_plot_artifacts` deletes `plot_artifacts` rows for the selected scope.

### Output records

`clear_artifact_records` deletes `artifact_records` rows for the selected
scope.

## Required Wording Rules

1. Bare `Clear` is not used for these BH4-A surfaces.
2. Wording must match current behavior exactly:
   - Agent history uses `Delete Agent history` / `Delete conversation history`
   - plot history uses `Delete ... plot history`
   - artifact records use `Delete ... output records`
3. No wording may imply file deletion or payload-only pruning unless the
   current implementation actually does that.
4. Scope must remain explicit as `this session` or `this project`.

## Verification

- confirm the updated labels/titles/confirmations/toasts match the implemented
  semantics above;
- run:

```powershell
node --check desktop\dist\app.js
git diff --check
```

## Acceptance Gate

BH4-A is accepted only when:

> the current desktop no longer uses bare `Clear` for the implemented
> Agent-history, plot-history, and output-record deletion actions, and the new
> wording does not promise prune/file-delete behavior that does not exist yet.

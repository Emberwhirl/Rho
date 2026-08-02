# P2-1d Git Conflict Resolution Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P2-1

## Scope

Add basic merge conflict awareness to the Git panel. When a merge/rebase is
in progress with conflicts:

1. Detect conflicted files via `git diff --name-only --diff-filter=U`
2. Display conflicted files in the Git panel with resolution options
3. Resolve individual files: accept ours, accept theirs, or mark as resolved
4. After all conflicts are resolved, the user can continue the merge

This spec does **not** authorize:
- inline conflict marker editing in the editor
- three-way merge tool
- merge abort UI

## Requirements

### R1: Conflict detection

A new function `git_list_conflicts(project_root)` that runs
`git diff --name-only --diff-filter=U` and returns a list of conflicted file paths.
If no merge/rebase is in progress, returns an empty list.

Include the merge head info: `git rev-parse --short MERGE_HEAD` for display.

### R2: Conflict resolution

New Tauri commands:

| Command | Args | Action |
|---------|------|--------|
| `git_resolve_conflict` | `{ file_path, resolution: "ours"\|"theirs"\|"mark" }` | `git checkout --ours/--theirs <file>` or `git add <file>` |
| `git_list_conflicts` | (none) | Returns `{ files: [...], merge_head: "..." }` |

### R3: Frontend conflict banner

When conflicts exist, show a banner in the Git panel area (or as a red indicator
next to the branch name):
- "Merge conflict: 3 files need resolution"
- List conflicted files with buttons: "Accept Ours" / "Accept Theirs" / "Mark Resolved"
- After all resolved: show "All conflicts resolved. Commit to continue."

### R4: Mock parity

Mock handlers for `git_list_conflicts` and `git_resolve_conflict`.

## Non-Goals

- NO inline conflict editing
- NO three-way merge
- NO merge abort
- NO rebase continue/abort commands

## Verification

- `cargo check -p rho-desktop` passes
- `node --check desktop/dist/app.js` passes
- `cargo fmt --all -- --check` passes

## Task Decomposition

1. [ ] Add `git_list_conflicts` + `git_resolve_conflict` to git.rs
2. [ ] Add Tauri commands + register in invoke_handler
3. [ ] Add frontend conflict banner (HTML + CSS + JS)
4. [ ] Add browser mock handlers
5. [ ] Verify + commit

# Task Plan: BH4-A retention inventory and action vocabulary

Status: accepted

## Goal
Inventory the currently implemented retention/destructive actions and replace ambiguous user-facing `Clear` wording with truthful action names for the behavior that already exists.

## Phases
- [x] Phase 1: Plan and setup
- [x] Phase 2: Research and spec
- [x] Phase 3: Execute/build
- [x] Phase 4: Review and deliver

## Key Questions
1. Which current desktop actions use bare `Clear` while actually deleting durable records?
2. Which BH4 semantics can be made truthful now without prematurely implementing BH4-B quotas/tombstones or BH4-C full deletion controls?
3. How should current plot, artifact, and Agent-history actions be described so the UI stops lying about what they do?

## Decisions Made
- BH4-A will not change backend deletion semantics or command names yet; it will first make user-facing wording truthful.
- Plot actions are described as deleting plot history/records, not freeing preview storage, because current behavior deletes `plot_artifacts` rows.
- Artifact actions are described as deleting output records, not output files, because current behavior deletes `artifact_records` rows only.
- Agent history action is described as deleting conversation history because current behavior deletes turns/events/approvals for the active project.

## Errors Encountered
- `desktop/dist/app.js` wording patch first missed the exact `clearPlots()` context because the function body had diverged slightly from the earlier read. Resolution: read the exact current block and patch it directly.
- A PowerShell-quoted grep command for final wording checks failed with a string-terminator error. Resolution: rerun with a simpler `rg` invocation.

## Status
**Closed for BH4-A** - Spec, inventory notes, truthful desktop wording, and narrow validation are complete. The next implementation step is BH4-B: quotas, prune order, and tombstone/metadata preservation.

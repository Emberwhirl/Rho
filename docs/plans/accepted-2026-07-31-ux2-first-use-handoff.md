# UX2 First Use, Files, Run, And Results Handoff

Status: accepted
Authorization date: 2026-07-31
Baseline: `2cdf663` (UX1 accepted)
Priority: P0 — Wave 4 primary track

## Scope

Implement UX-W1 through UX-W4 from the intuitive interaction design:

### W1: First Use And Empty Project
- No project: `Open an R project to begin` → `Open project` primary action
- Empty project: `Create analysis script` primary, show project name
- No document: open most recent file or show `Create analysis script`

### W2: Product Dialogs (replace browser prompt/confirm)
- Create file dialog: project-relative path, type inference, validation
- Save/discard dialog: `Save and continue` / `Keep editing` / `Discard changes`
- Export path dialog: project-relative with format validation
- Delete confirmation: named operation, scope, consequence
- External change dialog: reload/keep options

### W3: Dynamic Run Scope And Result Handoff
- Run button label: `Run selected code` / `Run current line` / `Run file` based on editor state
- Completion handoff: bounded card with result type + location + next action
- `Finished with warnings` → `Review warnings` link
- `Created plot.png` → `Open plot` link

### W4: Problems With Recovery Actions
- Problem titles: plain-language, source-linked
- Recommended actions: `Go to line X`, `Run again`, `Explain this problem`
- Current `Explain` / `Retry` / `Open Source` already exist; refine labels

## Out of scope
- Agent entry redesign (UX4)
- Approval consequence-based review (UX4)
- Environment language (UX5)
- Outputs taxonomy (UX5)
- Removing `state`/`project` revision badges from status bar (modernization Phase 1)

## Acceptance
> A novice opens a project, creates or opens a script, runs intended scope, locates its result, and recovers work without menus, browser prompts, or architecture terminology.

## Version
Bump to `0.3.0-dev.11` on completion.

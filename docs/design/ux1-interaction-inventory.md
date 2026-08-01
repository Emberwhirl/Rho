# UX1 Interaction Foundation Inventory

Status: active
Date: 2026-07-31
Phase: UX1 deliverable

## 1. Interaction Surface Inventory

### 1.1 Topbar

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Brand | `Rho workbench` | index.html:37 | keep |
| File menu | `File` → Open/Save/New | index.html:43-47 | add `Open Project` as primary empty-state action |
| Edit menu | `Edit` → Undo/Redo | index.html:51-54 | keep |
| Session menu | `Session` → Interrupt/Restart | index.html:58-61 | rename to `R session`; add `R session status` |
| Tools menu | `Tools` → Agent/Env/Render | index.html:65-69 | keep |
| Help menu | `Help` → Updates/About | index.html:73-77 | keep |
| Project name | project root path | app.js:2366 | truncate to basename, full path in tooltip |
| Run button | `▶ Run` | index.html:95 | dynamic label per UX-W3: `Run selected code` / `Run current line` / `Run file` |
| Restart button | `↻ Restart Workspace R` | index.html:92 | `↻ Restart R session` |
| Interrupt button | `■ Interrupt R` | index.html:93 | `■ Stop analysis` |

### 1.2 Sidebar — Files Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Panel tab | `Files` | index.html:102 | keep |
| Project tree | file names | app.js:2493 | show file type icons |
| Empty state | `Select a project to get started.` | index.html:110 | `Open an R project to begin` with `Open Project` primary action |
| OUTPUTS section | `OUTPUTS` with `plots`/`artifacts` | index.html:111-114 | rename to `Outputs`; `Plots`, `Tables`, `Reports`, `Files` |
| Hidden notice | `Some files are hidden...` | app.js:2567 | keep as detail |

### 1.3 Sidebar — Runs Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Panel tab | `Runs` | index.html:103 | keep |
| Compare toggle | `Compare` / `Exit Compare` | app.js:4196 | keep (RA-RC1 delivered) |
| Run title | `Selection · file.R` etc. | app.js:2834 | keep |
| Origin prefix | `User ·` / `Agent ·` / `System ·` | app.js:2807 | remove origin prefix from primary; put in detail |
| Status | `Completed`, `Failed`, etc. | app.js:2813 | keep with color dot |
| Cancel button | `Cancel` | app.js:4259 | keep |
| Empty state | `No run records yet.` | app.js:4204 | keep |

### 1.4 Console Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Panel tab | `Console` | index.html:175 | keep |
| Input placeholder | `R expression` | index.html:186 | `Type an R expression` |
| Execute button | `↵ Execute` | index.html:186 | keep |
| System messages | `SYSTEM` badge | app.js:2777 | replace `SYSTEM` badge with icon; remove raw `SYSTEM`/`AGENT` origin prefixes |
| Completion | `Render completed · path` | app.js:4486 | `Created report.html` with `Open report` link |

### 1.5 Plots Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Panel tab | `Plots` | index.html:176 | keep |
| Scope toggle | `Session` / `History` | index.html:191-192 | `This session` / `All runs` |
| Export button | `Export PNG` | index.html:195 | `Export as PNG` |
| Prune session | `Free session previews` | index.html:196 | `Free session preview storage` |
| Prune project | `Free project previews` | index.html:198 | `Free project preview storage` |
| Delete session | `Delete session plots` | index.html:200 | `Delete session plot history` |
| Delete project | `Delete project plots` | index.html:202 | `Delete project plot history` |
| Empty state | `No plots yet` | index.html:204 | keep |

### 1.6 Problems Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Panel tab | `Problems` with count | index.html:177 | keep |
| Empty state | `No problems detected` | index.html:238 | keep |
| Explain button | `Explain` | app.js:4413 | `Explain this problem` |
| Retry button | `Retry` | app.js:4423 | `Run again` |
| Open Source button | `Open Source` | app.js:4444 | `Go to source` |
| Problem detail line | `call · Source: path · User · Failed` | app.js:4403-4406 | `Analysis stopped at path:line · message` |

### 1.7 Artifacts Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Header | `Artifacts` | index.html:207 | rename to `Outputs` |
| Delete session | `Delete session records` | index.html:209 | `Delete session output records` |
| Delete project | `Delete project records` | index.html:211 | `Delete project output records` |
| Retention card | `Retention` | index.html:215 | keep |
| Scope badge | `session` / `project` | app.js:4632 | keep |
| Empty state | `No artifacts yet` | index.html:221 | `No outputs yet` |
| Detail title | `Artifact` | index.html:225 | `Output` + type |
| Detail state | `idle` | index.html:226 | `Select an output to inspect` |
| Open source | `Open source` | index.html:232 | `Open source` |

### 1.8 Environment Panel

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Filter | `Filter objects` | index.html:349 | keep |
| Refresh | `Refresh Environment` | index.html:350 | `Refresh` |
| env card | `Project Environment` | index.html:354 | `R environment` |
| Init button | `Initialize renv` | index.html:357 | `Start managing project packages` |
| Restore button | `Restore lockfile` | index.html:358 | `Use locked package versions` |
| Snapshot button | `Snapshot lockfile` | index.html:359 | `Record current package versions` |
| Render card | `Render` | index.html:374 | keep |
| Render hint | `Open .Rmd or .qmd document to render.` | index.html:376 | keep |
| Render button | `Render Active Document` | index.html:377 | `Render report` |
| Render empty | `No render has been run yet.` | index.html:383 | keep |
| Object list empty | `Workspace is empty` | index.html:395 | keep |
| Object preview empty | `Select an object to inspect...` | index.html:425 | keep |

### 1.9 Agent Panel

| Element | Current Label | Files | UX2 Target (UX4 later) |
|---|---|---|---|
| Mode buttons | `Ask` / `Plan` / `Act` | index.html:316-318 | single `Ask Rho` entry; advanced control for explicit policy |
| Session auth | `Authorize Act R execution for this session` | index.html:320 | **remove** from default UI |
| Input placeholder | `Ask about the live R workspace…` | index.html:323 | `Ask Rho about this project…` |
| Send button | `↑ Send` | index.html:342 | keep |
| Context menu | `Choose project file...` etc. | index.html:328-331 | keep as attachment chips |
| Model selector | `Select Agent model` | app.js:3373 | assistant name + status only |
| State badge | `Ready` / `Working` / `Failed` | app.js:3440-3472 | simplify: `Ready` / `Busy` / `Unavailable` |
| Retry button | `Retry Agent` | index.html:256 | `Retry connection` |
| Cancel button | `Cancel Agent turn` | index.html:257 | `Stop` |
| Delete history | `Delete Agent history` | index.html:258 | `Delete conversation history` |
| Revision badge | `rev 1` | index.html:259 | **hide from primary**; move to details |
| Clear history toast | `Deleted Agent history for this project.` | app.js:7277 | `Deleted conversation history.` |

### 1.10 Approval Surface

| Element | Current Label | Files | UX2 Target (UX4 later) |
|---|---|---|---|
| Header | `Approval Required` | index.html:278 | rename per operation type |
| Summary | `tool wants to mutate Workspace R...` | app.js:4136 | `Run R code` with code preview |
| Approve button | `Approve run_r` | app.js:4145 | `Run this code once` |
| Reject button | `Reject run_r` | app.js:4146 | `Not now` |
| Cancel button | `Cancel pending` | app.js:4147 | keep |
| File edit header | `Proposed File Edit` | index.html:292 | `Apply changes to file` |
| Accept button | `Accept` | index.html:308 | `Apply changes` |
| Reject button | `Reject` | index.html:309 | `Keep current file` |
| Undo button | `Undo` | index.html:310 | keep |

### 1.11 Status Bar

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Kernel status | `Starting R…` / `R is busy` / `R idle` | app.js:1827 | keep |
| State revision | `state 1` | index.html:433 | **remove from status bar**; move to diagnostics |
| Project revision | `project 0` | index.html:434 | **remove from status bar** |
| Cursor position | `Ln 1, Col 1` | index.html:437 | keep |

### 1.12 Dialogs

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| New file prompt | browser `prompt()` | app.js:2757 | product dialog with path validation |
| Export path prompt | browser `prompt()` | app.js:4158,5459,5509 | product dialog |
| Confirm delete | browser `confirm()` | app.js:5536,7266,7411,7422 | product dialog with consequence text |
| Confirm discard | browser `confirm()` | app.js:2628 | product dialog: `Save and continue` / `Keep editing` / `Discard changes` |
| External change | browser `confirm()` | app.js:6836 | product dialog with reload/keep options |

### 1.13 Environment Operation Dialog

| Element | Current Label | Files | UX2 Target |
|---|---|---|---|
| Approve button | `Approve and run` | index.html:581 | `Use locked package versions` (restore) / `Start managing packages` (init) / `Record package versions` (snapshot) |
| Reject button | `Reject` | index.html:579 | `Not now` |
| Cancel button | `Cancel` | index.html:580 | `Close` |

---

## 2. Terminology Contract

| Internal Term | Default User-Facing Term | Where Internal Remains |
|---|---|---|
| Workspace R | `R session` | details/diagnostics |
| Agent runtime | `assistant connection` | assistant diagnostics |
| artifact | `output` + type (Plot/Table/Report/File) | provenance details |
| approval request | exact proposed operation (e.g. `Run R code`) | audit details |
| revision (state/project) | (no primary label) | technical details, copy diagnostics |
| stale | describe what changed | diagnostic status |
| retry run | `Run again` | run details |
| renv initialize | `Start managing project packages` | environment details |
| renv restore | `Use locked package versions` | environment details |
| renv snapshot | `Record current package versions` | environment details |
| interrupt | `Stop analysis` | technical/session menu |
| cancel (agent) | `Stop` | agent details |
| Clear (generic) | (banned — use specific verb) | n/a |
| Hide | `Hide from this view` | retention details |
| Prune payload | `Free preview storage` | retention details |
| Delete record | `Delete output records` | confirmation |
| Delete file | `Delete output file` | confirmation |
| Session | `This session` | scope selector |
| Project (scope) | `All runs` or `This project` | scope selector |

---

## 3. State Presentation Contract

| State | Required Presentation |
|---|---|
| ready | primary action visible; no redundant success noise |
| loading | name what loads; preserve layout |
| running | name operation/scope; supported Stop action |
| waiting | exact decision at point of work |
| completed | result and next action (handoff) |
| warning | consequence and result usability |
| failed | preserved work, recovery action, diagnostics |
| stopped | distinguish user stop from failure; truthful partial result |
| changed/stale | changed input, disabled old action, refresh/review |
| unavailable | missing capability and setup/fallback action |
| empty | reason and context-specific first action |

### Current Gaps Against Contract

| Gap | Surface | Fix in |
|---|---|---|
| Run button always shows `Run` regardless of scope | topbar | UX2 (W3) |
| `SYSTEM`/`AGENT` origin badges clutter console | console | UX2 |
| `rev 1` badge always visible in Agent header | agent | UX2 |
| `state 1`/`project 0` always visible in status bar | status bar | UX2 |
| `prompt()` used for new file / export path | multiple | UX2 (W2) |
| `confirm()` used for destructive actions | multiple | UX2 (W2) |
| Approval says `Approve run_r` not `Run this code once` | approval | UX4 (W6) |
| `Clear` button label ambiguous | plots/artifacts | UX5 (W10) |
| `Authorize Act R execution for this session` checkbox | agent | UX4 (W5) |
| Ask/Plan/Act always visible as 3-way choice | agent composer | UX4 (W5) |

---

## 4. Message Component Model

Every user-facing outcome/error message follows:

```
specific outcome or problem
short consequence or safety statement
recommended action
optional details (expandable)
```

### 4.1 Current Messages That Violate

| Current | Violation | Fix in |
|---|---|---|
| `Approval Required` header | no operation name | UX4 |
| `request` badge as request ID | internal ID as primary | UX4 |
| `SYSTEM` badge before every system message | origin as primary | UX2 |
| `Interrupt requested` toast | no scope or what was interrupted | UX2 |
| `Artifact` as detail title | taxonomy instead of goal | UX2 |
| `Retry` button (on problem) | mechanism instead of intent | UX2 |
| `Could not display Agent run X: error` | no recovery advice | UX2 |

---

## 5. Mock Fixture Requirements

UX2-UX6 require deterministic mock fixtures for these representative states:

| Fixture | States Covered |
|---|---|
| No project | empty topbar, sidebar placeholder |
| Empty project | no files, no runs, `Create analysis script` primary |
| Project with files | file tree, active document |
| Clean run | selection runs, plot produced, no warnings |
| Warning run | 2 warnings, `Review warnings` handoff |
| Failed run | R error with source line, `Go to line 42` action |
| Agent unavailable | provider down, `Check connection` action |
| Missing API key | `Add API key` guided flow |
| Stale document | file changed externally, reload/keep dialog |
| Unsaved work | close with dirty files, 3-option dialog |
| Active run blocking switch | `Return to analysis` primary |
| Output missing file | `missing` badge, no false success |
| Pruned plot | `preview pruned` badge, evidence retained |
| Incomplete provenance | incomplete badge, reason displayed |

---

## 6. Task-Based Usability Protocol

10 scenarios for UX2-UX6 acceptance testing:

1. Open a project and run a selected expression
2. Find and explain an R error
3. Ask Rho to propose and apply a small correction
4. Review one R execution without prior Ask/Plan/Act teaching
5. Restore packages from a lockfile preview
6. Locate an output created by a run
7. Switch projects while work is active
8. Reclaim preview storage without deleting an exported output
9. Recover work after simulated abnormal close
10. Resolve an unavailable assistant and return to the preserved draft

**Success criteria**: 4/5 participants complete each P0 scenario without intervention; 90% predict protected-action consequences correctly; 0 cross-project or destructive-scope errors; median result discovery ≤1 navigation step after completion.

---

## 7. Acceptance

> Every decision has a named operation, scope, consequence, recovery behavior, and owning backend contract; no ambiguous Clear or generic approval remains undocumented.

All 15 interaction surfaces inventoried. Terminology contract defined. State presentation contract defined. 13 gaps identified, assigned to UX2/UX4/UX5. Mock fixture requirements listed. Usability protocol drafted.

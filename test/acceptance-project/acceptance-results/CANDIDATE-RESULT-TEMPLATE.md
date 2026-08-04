# Rho Manual Acceptance Result

Status: not run

## Candidate

- Version:
- Source commit:
- Installer path:
- SHA-256:
- Test date:
- Tester:
- Windows version:
- R version:
- Display scaling tested: 100% / 125% / other
- Distribution intent: unsigned internal / signed public / undecided

## Evidence Summary

| Scope | Result | Evidence or failure |
|---|---|---|
| Install, startup, Console/Logs | Not run | |
| Single-cell QC analysis and Data Viewer | Not run | |
| Plots, render, Runs, Problems | Not run | |
| Agent Ask/Plan/Act and reviewed correction | Not run | |
| Agent-first Task/file/run/Artifact/audit surfaces | Not run | |
| Console/Logs installed separation | Not run | |
| M1-M3 hierarchy, state surfaces, keyboard, 100%/125% scale | Not run | |
| Editor completion, Help, references, diagnostics | Not run | |
| Environment, Evidence, Audit, reproducibility | Not run | |
| Data Viewer query/type states and render recovery/linkage | Not run | |
| Environment package review and rejection/recovery | Not run | |
| Git hunk stage/unstage, restore, commit | Not run | |
| Persistence, switching, responsive layout | Not run | |
| Unicode and spaces path | Not run | |
| Large project (2,000+ files) | Not run | |
| Missing/old R and base-probe recovery | Not run | |
| Interrupt, restart, stale approval, Agent dependency recovery | Not run | |
| Uninstall and retained-data observation | Not run | |
| Installed-candidate acceptance | Not run | |

## Phase Record

Use the matching section in `../MANUAL-ACCEPTANCE.md`. Change each item to
PASS, FAIL, or SKIP with a reason. A phase is not PASS if one required item is
blank.

### 0. Candidate And Startup

- [ ] Exact version, source commit, installer path, and SHA-256 recorded
- [ ] Clean-profile install and SmartScreen behavior recorded
- [ ] Start menu, Ark, WebView2, R 4.4+, shell-first startup, and `R idle` verified
- Evidence:

### 1. Core Workbench Tour

- [ ] `rho-workbench-tour.R` produced 24 rows and 8 missing notes
- [ ] Console/Logs, Environment, Data Viewer query/export, Plot history, Run,
      source-linked Problem, and tab-state preservation verified
- Evidence:

### 2. Single-cell QC

- [ ] 240 cells generated; 217 passed; 5 exceeded mitochondrial review threshold
- [ ] Data, summary, plots, provenance, Runs, Environment, and files verified
- Evidence:

### 3. Agent Review

- [ ] Ask and Plan did not execute or mutate
- [ ] Act approval rejected once, then accepted with exact minimal file diff
- [ ] Corrected workflow passed; activity, model selector, cancellation, and
      Manage LLMs states verified
- Evidence or prerequisite skip:

### 4. Editor Intelligence

- [ ] Completion, definition, references, installed Help/example, and Agent Help context
- [ ] Rename, extract, quick fix, formatting, cancel/apply/undo/save, stale rejection
- [ ] External file change, dirty draft preservation, Run selection/line/file
- Evidence or prerequisite skip:

### 5. Documents And Render

- [ ] Chunk discovery/navigation and malformed chunk warning
- [ ] R Markdown and, when available, Quarto render
- [ ] Cancellation, restart reconciliation, source diagnostic, Artifact linkage
- Evidence or prerequisite skip:

### 6. Environment, Evidence, Runs, Audit, Claims

- [ ] Installed/lockfile inventory, dependency source, package review rejection/recovery
- [ ] Project/run/Artifact audit and reproducibility without relying on chat
- [ ] Linked, missing, incomplete, unresolved, Artifact recovery, two-project isolation
- Evidence or prerequisite skip:

### 7. Git Review

- [ ] Two-hunk stage/unstage, cancel/confirm Restore, intended commit
- [ ] Real conflict reviewed in the generated conflict project
- Evidence:

### 8. Persistence, Boundaries, And Modern UI

- [ ] Restart restored project/document/draft/panel/task context
- [ ] Unicode/space project isolation, 2,100-file bound, 9 MiB refusal
- [ ] 900 x 700, 1024 x 680, 1920 x 1080; Windows 100% and 125%
- [ ] Keyboard/focus, menus/dialogs, Human/Agent, contextual review surfaces,
      empty/loading/success/warning/error/unavailable states
- Evidence:

### 9. Candidate Recovery And Uninstall

- [ ] Long Run interrupted and Workspace R recovered
- [ ] Workspace R restart preserved durable/project context
- [ ] Stale Agent approval and single-active-turn behavior
- [ ] Chat-only model and unavailable/restored Agent dependency
- [ ] Unsaved Render blocked; missing Quarto truthful
- [ ] Missing R, R 4.3, and base-probe empty-stderr recovery
- [ ] Uninstall removed application/runtime files; retained data recorded separately
- Evidence or justified skip:

## Failure Record

- First failing phase and step:
- Expected result:
- Actual result:
- Reproduction:
- Screenshot/log/diagnostic path:
- Project/R/durable state changed: yes / no / unknown
- Recovery attempted and outcome:
- Candidate retest required: yes / no

## Completeness Check

- [ ] Every guide phase has PASS, FAIL, or justified SKIP evidence
- [ ] Browser/mock results are not recorded as installed-app evidence
- [ ] Representative workflow and exact installed-candidate results are separate
- [ ] Distribution intent and final release decision are explicit

## Decision

- Manual acceptance: NOT RUN
- Installed-candidate acceptance: NOT RUN
- Release decision: NO-GO until all required evidence and the distribution
  decision are complete

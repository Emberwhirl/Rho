# WS2 Go-To-Definition Spec

Status: accepted

Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent plan: `proposed-2026-08-01-next-phase-task-plan.md` §P3-2
Related design: `proposed-2026-07-26-rstudio-inspired-workflow-design.md` §WS2

## Scope

This spec adds **project-local go-to-definition** for R functions. When the
user's cursor is on a function name and they trigger the command, Rho:

1. Searches open project `.R` files for a definition matching that name
2. If found: opens the file and moves the cursor to the definition line
3. If not found in project files: falls back to opening the function help
   (existing `editor_function_help`)

This spec does **not** authorize:

- find references across the project
- rename symbol refactoring
- extract-function refactoring
- AST-based semantic analysis
- cross-package definition resolution (delegated to existing help system)

## Requirements

### R1: Project function index

A new R bridge function `rho_find_function_definition(name, project_root)`
that searches `.R` and `.Rmd`/`.qmd` files in the project for a definition
matching `name`. It returns the first file path and line number where the
definition is found.

Pattern: lines starting with `name <- function` or `name = function`, with
optional whitespace and assignment variants (`<<-`, `->`).

### R2: Tauri command

`editor_goto_definition(name: String)` — calls the coordinator to dispatch
`workspace.find_function_definition` and returns `{ file, line, column }`
or `null` if not found.

### R3: Frontend behavior

- Trigger: `Ctrl+Click` on a word in the editor, or `F12` key, or
  context-menu "Go to Definition"
- Extract the word at cursor position from Monaco
- Call `editor_goto_definition`
- If project definition found: open the file (or switch to its tab) and
  move cursor to the definition line
- If not found in project: call `editor_function_help` to open help pane
- Editor must already be open in a supported file type (`.R`, `.Rmd`, `.qmd`)

### R4: Browser/mock parity

Add a mock handler that returns a fake definition for common R function
names for browser-mode preview.

## Non-Goals

- NO find references
- NO rename/refactor
- NO AST parsing
- NO formatting proposals
- NO definition search in package source (delegated to help)

## Verification

- `cargo test --workspace` passes
- `node --check desktop/dist/app.js` passes
- `cargo fmt --all -- --check` passes

## Task Decomposition

1. [ ] Add `rho_find_function_definition()` to workspace.R
2. [ ] Add `workspace.find_function_definition` dispatch to coordinator
3. [ ] Add `editor_goto_definition` Tauri command
4. [ ] Add frontend Ctrl+Click / F12 handler
5. [ ] Add browser mock handler
6. [ ] Verify + commit

# WS6 Enhanced Chunk Execution Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent design: `proposed-2026-07-26-rstudio-inspired-workflow-design.md` §WS5
Depends on: WS5 (chunk discovery panel)

## Scope

Extend the WS5 chunk panel with batch execution commands. When chunks are
loaded for a `.Rmd`/`.qmd` document, each chunk row gains "Run Preceding"
and "Run Below" actions in addition to the existing "Run" button.

The R bridge, coordinator dispatch, and Tauri command layer are unchanged.
This is a **frontend-only** capability that composes chunk data already
available in `state.chunks` with the existing `execute_r` Tauri command.

This spec does **not** authorize:
- job-tracked batch execution with progress/status
- auto-refresh of environment/plots after batch runs
- chunk dependency graph or directed acyclic execution
- inline chunk output below source lines

## Requirements

### R1: Run preceding chunks

Each chunk row has a "Run Preceding" button (or a context menu item).
When clicked:

1. Collect all chunks before this chunk (based on `start_line` ordering)
2. Concatenate their `code` into a single execution block, separated by comments
3. Send to Workspace R via `execute_r` with `source_path` set to the document

The concatenated code is prefixed with chunk-label comments:
```r
#| chunk-label: setup
library(dplyr)

#| chunk-label: load-data
data <- read.csv("input.csv")
```

### R2: Run below chunks

Same as R1, but collects all chunks **after** this chunk.

### R3: Run all chunks

A "Run All" button at the top of the chunk list sends all chunks' code
concatenated in document order.

### R4: Frontend UI

- Each chunk row already has a "▶ Run" button (WS5).
- Add two additional compact buttons: "↑ Prec" and "↓ Below".
- Add a "▶▶ Run All" button in a toolbar above the chunk list.
- Each button shows a brief toast confirmation on success, or error toast on failure.

### R5: Mock parity

No new mock handlers needed. The existing `execute_r` mock and chunk mock
already cover the preview scenario.

## Non-Goals

- NO chunk dependency resolution
- NO execution progress tracking
- NO background job integration
- NO auto-refresh after batch execution

## Verification

- `node --check desktop/dist/app.js` passes
- No new Rust code → no cargo check needed

## Task Decomposition

1. [ ] Add "Run Preceding" + "Run Below" buttons to chunk items
2. [ ] Add "Run All" toolbar above chunk list
3. [ ] Implement runPrecedingChunks / runBelowChunks / runAllChunks helpers
4. [ ] Verify JS syntax + commit

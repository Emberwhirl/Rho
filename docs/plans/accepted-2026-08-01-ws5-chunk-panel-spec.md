# WS5 Chunk Panel Spec

Status: accepted
Date: 2026-08-01
Baseline: `0.4.0-dev.0`

Parent design: `proposed-2026-07-26-rstudio-inspired-workflow-design.md` §WS5

## Scope

Chunk discovery and navigation for `.Rmd` and `.qmd` documents. When a
supported document is open in the editor, a Chunk panel appears showing:

1. A list of all code chunks with labels, chunk options, and line numbers
2. Click-to-navigate: clicking a chunk scrolls the editor to its start
3. Each chunk has a "Run" button that sends the chunk code to Workspace R

This is the chunk **discovery + run** surface. Full chunk execution (run
preceding, run below) is deferred to WS6.

This spec does **not** authorize:
- run all preceding / run below chunk
- chunk option editor
- inline chunk output display
- visual Markdown editing

## Requirements

### R1: Chunk discovery R bridge

Add `rho_discover_chunks(path, project_root)` to workspace.R. For `.Rmd` and
`.qmd` files, parse the file and extract code chunks.

A chunk is defined by a line matching `^[\t ]*```\{r[ ,\}]` (start) and
`^[\t ]*` ` `` ` ```` ` (end). Chunk options between `r` and `}` are captured.

Returns a bounded list (max 200 chunks):

```json
{
  "chunks": [
    {
      "label": "setup",
      "options": "include=FALSE",
      "start_line": 5,
      "end_line": 12,
      "code_preview": "library(dplyr)\n..."
    }
  ],
  "total_count": 15,
  "truncated": false
}
```

`code_preview` is the chunk body (first 4 lines, truncated to 500 chars).

### R2: Tauri command

`editor_discover_chunks(path: String)` — dispatches `workspace.discover_chunks`.
Returns `{ chunks: [...], total_count, truncated }` or `null` for unsupported
file types.

### R3: Frontend chunk panel

A new panel (or panel section) in the right context area. Shown only when the
active editor document is `.Rmd` or `.qmd`.

- Lists code chunks with: label (or "unnamed-chunk-N"), chunk options pill,
  line range `L5-L12`, code preview (first 80 chars)
- Clicking a chunk row scrolls the Monaco editor to `start_line` and focuses
- Each row has a small "▶" Run button
- Run button sends the chunk body to Workspace R via `workspace.execute`
  with `source_path` set to the document path and inline `#| label:` comment

Layout: the chunk panel appears below the Environment panel tabs as a
collapsible section. Alternative: a new "Chunks" tab if space permits.

### R4: Browser mock

Mock `editor_discover_chunks` returning sample chunks for a demo `.Rmd`.

## Non-Goals

- NO run preceding / run below
- NO chunk option editing
- NO inline output
- NO visual Markdown

## Verification

- `cargo test --workspace` passes
- `node --check desktop/dist/app.js` passes
- `cargo fmt --all -- --check` passes

## Task Decomposition

1. [ ] Add `rho_discover_chunks()` to workspace.R
2. [ ] Add `workspace.discover_chunks` dispatch to coordinator
3. [ ] Add `editor_discover_chunks` Tauri command
4. [ ] Add frontend chunk panel (HTML + CSS + JS)
5. [ ] Add browser mock handler
6. [ ] Verify + commit

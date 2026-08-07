# Generated Output Review

Status: active implementation contract; OUTPUT-REVIEW-1 implementation and
focused verification complete 2026-08-06; installed acceptance open

Date: 2026-08-06
Authorization: user explicitly requested real Review previews for generated
PNG, CSV, R, and related output files
Change class: D2 bounded output-review workflow repair
Risk class: R2 project-scoped file read and presentation
Work package: OUTPUT-REVIEW-1

## User-Visible Contract

- Selecting a generated file in Agent Outputs opens Review with the output
  preview automatically when the recorded file is available.
- PNG, JPEG, GIF, and WebP files render as bounded image previews. CSV and TSV
  files render as bounded tables. R, Rmd, text, and JSON files render as
  bounded non-executing source content. HTML and Markdown retain their existing
  sandboxed or sanitized preview paths.
- Review metadata prioritizes output type/path, creation time, producing run or
  Workspace R, availability, and only actionable review notes. Internal IDs,
  empty source fields, and low-value implementation details are omitted from
  the primary summary.
- Agent Markdown output supports offline KaTeX rendering for inline and block
  math delimiters while preserving raw Markdown for Copy.
- Files remain project-contained and read-only. Binary content is transported
  as base64 through the existing bounded viewer contract; no file write,
  execution, network access, or approval authority is added.
- Missing, oversized, malformed, or unsupported files remain truthful and do
  not produce a fake preview.
- The Outputs index is a bounded scrolling region. Its header carries the
  aggregate count; individual cards show the filename, useful file type, and
  concise creation/source context without repeating the same generated-file
  label on every card.
- A Workspace R-generated file without a source document association is
  presented as a valid Workspace R output. The audit-level provenance flag is
  not shown as a user-facing warning unless a source association was expected
  but is incomplete.
- A `generated_file` artifact is only created after the recorded relative path
  is verified as a real regular file inside the active project root. A path
  reported by a render or Agent result without a materialized file is not
  presented as a saved output.
- Output availability is separate from provenance and viewer capability:
  `available`, `missing`, `unsupported`, and `in_memory_plot` are distinct
  states. A missing historical file is not presented as an unsupported preview,
  and a Plot payload is not presented as a disk file.
- Viewer errors identify whether the file is missing, unsupported, oversized,
  or malformed. They do not collapse these states into a generic unavailable
  message.
- Artifact detail requests from the frontend use the desktop command's
  camelCase `artifactId` argument contract; a detail lookup failure must not be
  converted into a false "file missing" state when the listed artifact exists.

## Verification

- Rust Viewer tests cover text R content, base64 image content, byte limits,
  project containment, and missing/invalid files.
- Outputs Viewer and Agent output-review frontend contract tests cover image,
  source, table, automatic preview, and metadata projection.
- Artifact and render regression tests cover unmaterialized output paths,
  missing historical files, unsupported existing files, and in-memory Plot
  separation.
- `node --check desktop/dist/app.js`, Rust formatting, and `git diff --check`
  pass. Installed-app visual acceptance remains separate.

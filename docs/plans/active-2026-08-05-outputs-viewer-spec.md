# Outputs And Viewer Specification

Status: active; OUTPUTS-VIEWER-1 authorized 2026-08-05

Date: 2026-08-05
Change class: D2 bounded workflow feature
Risk: R3 untrusted HTML and project-file WebView boundary
Owner: OUTPUTS-VIEWER-1
Next checkpoint: stop after one contract-complete implementation, affected
automation, security review, browser review, documentation reconciliation, and
an independent commit

## Authorization

The user authorized this package on 2026-08-05 after the independent Format
Document repair and menu-organization packages. This active specification is
the focused implementation contract. It authorizes only the package below; it
does not activate the remaining proposed RStudio-inspired workstreams.

## Problem And Evidence

- `Tools > Render Active Document` correctly renders `.Rmd` and `.qmd`, but a
  Markdown file reports `Not renderable` instead of offering a non-executing
  preview.
- Rendered HTML and project `.html` files open as editor source. The existing
  Artifact detail proves availability and provenance but cannot inspect the
  result itself.
- CSV and TSV files use the source editor even when a bounded table is the more
  useful default inspection surface.
- Interactive plots are HTML documents. Treating Viewer as a right-side
  Environment peer would make the inspected result secondary and would mix
  unrelated authorities.
- The existing bottom `Plots` surface already discovers Plot history and Saved
  outputs. Agent-first already provides a dominant Review work surface. These
  are the compatible navigation and inspection foundations.

## Goals

1. Evolve bottom `Plots` into `Outputs`, retaining Plot and Artifact history as
   their existing independent authorities.
2. Open a selected output in a dominant Viewer in the central work area.
3. Support static Plot images, self-contained interactive HTML/htmlwidgets,
   rendered HTML Artifacts, non-executing Markdown preview, and bounded CSV/TSV
   tables.
4. Preserve source access and efficient Source/Preview movement without adding
   a new top-level mode or right-side panel.
5. Make project containment, payload bounds, unsupported resources, loading,
   missing, malformed, stale, and failure states explicit.

## Non-Goals

- PDF, remote URLs, browser navigation, downloads, printing, DevTools, or a
  general-purpose browser.
- Executing Markdown, `.Rmd`, or `.qmd` during preview. Render remains the only
  executable document path for `.Rmd` and `.qmd`.
- Supporting non-self-contained HTML resource directories in V1.
- Creating Viewer, Plot, Artifact, Run, or project persistence or schema.
- Changing Render completion, provenance, retention, Agent approval, execution,
  environment, or project-switch authority.
- Replacing the existing bounded Workspace object Data Viewer.

## Ownership And Authority

- Project identity and containment remain broker/project-store authority.
- Render job terminal truth remains the Render job contract.
- Artifact identity, availability, provenance, and retention remain WP3 and
  P2-3B authority. Viewer reads the exact selected Artifact path; it does not
  rediscover or infer a producing run.
- Plot identity, payload, history scope, and retention remain Plot authority.
- Open documents and unsaved buffers remain editor authority.
- Outputs is a read-only projection over Plot and Artifact records. Viewer is a
  transient inspection state and creates no durable record.

## Information Architecture

### Outputs discovery

- Rename the bottom Dock tab and panel language from `Plots` to `Outputs`.
- The panel keeps the selected Plot preview and history navigator, while Saved
  outputs remains progressive disclosure in the same panel.
- Selecting a Plot preview, a Saved output, or the exact Last Render Artifact
  offers `Open in Viewer` and opens the central inspection surface.
- Agent-first Outputs continues to list existing Plot and Artifact records.
  Selection reuses the existing dominant Review work surface and embeds the
  same Viewer content there.

### Central Viewer

- Viewer occupies the editor work area, never the right context panel and never
  a new Code/Analyze/Agent mode.
- On wide viewports, an open source document and its preview use a Source/Preview
  split. The user may collapse either side through a Source/Preview/Both
  segmented control.
- On narrow viewports, Source/Preview is a segmented switch with one pane shown
  at a time. No horizontal page overflow is permitted.
- `Open Source` selects the existing project document. `Close Preview` returns
  focus to the prior source/output trigger. HTML and tables label the source
  action `Open Source` and `Open as Text`, respectively.

## Type Dispatch

| Input | Default action | Execution | Source action |
| --- | --- | --- | --- |
| Plot record | image Viewer | none | Open producing source when available |
| `.md` | sanitized preview from current editor buffer | none | Source pane/current document |
| `.html` / HTML Artifact | isolated interactive Viewer | inline scripts only inside sandbox | Open Source |
| `.csv` / `.tsv` | bounded table Viewer | none | Open as Text |
| `.Rmd` / `.qmd` | existing Render command; exact completed Artifact opens Viewer | existing Render contract | Open source document |

`Render Active Document` remains unavailable for `.md`, `.html`, `.csv`, and
`.tsv`; their command is `Preview Active Document`. Unsupported extensions
receive a truthful disabled command or `Preview is not available for this file`,
not `Not renderable`.

## Typed Read Contract

The desktop command returns:

```text
ViewerFile {
  contract: "rho.viewer_file.v1",
  project_root: normalized active project root,
  path: normalized project-relative path,
  media_type: "text/html" | "text/markdown" |
              "text/csv" | "text/tab-separated-values",
  content: UTF-8 text,
  size_bytes: integer
}
```

Rules:

- Accept only `.html`, `.md`, `.csv`, and `.tsv`.
- Resolve the requested relative path through the canonical project containment
  guard. Reject absolute, parent, drive-prefixed, symlink-escape, missing,
  directory, non-UTF-8, unsupported, and over-limit inputs.
- The file budget is 4 MiB. The frontend separately rejects an over-budget
  current editor buffer before Markdown parsing.
- The response carries the captured normalized project root. The frontend
  rejects it as stale if the active project changed before presentation.
- Artifact opening first resolves the exact same-project Artifact record, then
  reads only that record's `output_path` through this command.
- There is no write, execution, network, approval, schema, or persistence path.

## Rendering And Security

### Markdown

- Use pinned Marked and DOMPurify browser assets, checked into the static
  frontend vendor tree with their licenses.
- Parse CommonMark/GFM-compatible Markdown without executing source code.
- Sanitize parsed HTML before insertion. Remove scripts, event handlers,
  frames, forms, embedded objects, and unsafe URL schemes. External images are
  not fetched in V1; links may be displayed but open no in-app navigation.

### HTML and htmlwidgets

- Use a sandboxed iframe with `allow-scripts` only. Do not grant
  `allow-same-origin`, top navigation, popups, forms, downloads, modals, pointer
  lock, or storage authority.
- Parse and serialize the document only to place a restrictive CSP before all
  author content and remove refresh/base behavior. Permit inline/data/blob
  script, style, image, font, and media required by self-contained htmlwidgets;
  block `connect-src`, remote/default sources, frames, objects, forms, and base
  navigation.
- The opaque-origin frame cannot access parent DOM or Tauri IPC. Parent code
  accepts no messages or commands from Viewer content.
- Show `Self-contained HTML only` in Viewer metadata. If relative or remote
  resources are detected, show `External resources were blocked`; do not imply
  a complete rendering.

### CSV and TSV

- Use pinned Papa Parse rather than delimiter splitting.
- Parse as text with header detection and explicit delimiter. Render at most
  500 data rows and 100 columns, with truncation metadata for additional data.
- Preserve empty fields as empty cells, escape all cell text through DOM text
  nodes, and expose malformed parse errors without partial-success wording.

## States And Recovery

- Empty: no output selected; Outputs explains where project results appear.
- Loading: central Viewer identifies the requested path/type and disables
  conflicting open actions.
- Success: content, type, boundedness/provenance metadata, and source action are
  visible.
- Warning: blocked HTML resources, truncated table, or incomplete Artifact
  provenance is explicit while available content remains inspectable.
- Failure: missing, unsupported, malformed, non-UTF-8, over-limit, or read error
  leaves the source/editor intact and offers retry or source access where valid.
- Stale/project switch: discard the response, close transient Viewer state, and
  never display project A content in project B.
- Restart: Viewer state is transient; Outputs history reloads from existing Plot
  and Artifact authorities and no incomplete Viewer state is restored.

## Work Package OUTPUTS-VIEWER-1

Authorized implementation:

1. Add the bounded typed desktop read command and project/security tests.
2. Vendor the pinned Markdown parser, sanitizer, and CSV parser with a
   deterministic sync script and license records.
3. Rename Plots presentation to Outputs while preserving internal Plot and
   Artifact keys/contracts.
4. Add central Human-first Viewer and shared content renderers for Plot,
   Markdown, HTML, CSV, and TSV.
5. Reuse the shared content renderer in Agent-first dominant Review.
6. Route exact Render Artifact, Saved output, project file, menu, and editor
   preview actions without changing Render execution.
7. Add real/mock parity, deterministic preview scenarios, UI/security/bounds
   contracts, responsive browser review, NEWS, and implementation evidence.

Mandatory stop: do not add PDF, remote or relative resource serving, Viewer
persistence, new Artifact discovery, browser navigation, or later WS5 review
features in this package.

## Verification Matrix

Backend and security:

- supported type success and exact media type;
- empty, boundary, and just-over 4 MiB payloads;
- absolute/parent/symlink escape, unsupported, missing, directory, and invalid
  UTF-8 rejection;
- two-project isolation with identical relative filenames;
- sandbox omits same-origin/navigation/download authority;
- injected CSP blocks network, frames, forms, objects, base, and IPC access;
- Markdown sanitization removes executable content and unsafe URLs;
- CSV quoted delimiter/newline, empty field, malformed, row/column truncation.

Frontend and workflow:

- `.md` preview uses the unsaved current buffer and does not invoke Render;
- `.Rmd/.qmd` still invoke Render and exact Artifact selection;
- `.html/.csv/.tsv` preview and source actions;
- Plot and Saved output open from Outputs; missing files fail truthfully;
- project switch discards stale content; mock command matches desktop contract;
- loading, empty, success, warning, failure, and unavailable states;
- keyboard focus, Source/Preview/Both, close/retry, wide split, narrow switch,
  long Unicode paths, and no viewport overflow;
- Agent-first output uses its existing dominant Review work surface.

Run focused tests while iterating, then the complete affected Rust crate,
frontend UI contract matrix, JavaScript syntax, Rust formatting, R bridge tests
if the command boundary affects them, and `git diff --check`. Record installed
Tauri and display-scale review separately if not run.

## Cross-Review

- The accepted 0.3.x handoff and WP3 remain authoritative for project identity,
  Plot/Artifact records, provenance, retention, and bounded object viewers.
- P2-3A/P2-3B remain authoritative for Render terminal truth and exact Artifact
  linkage. This package begins only after successful completion and does not
  reinterpret failed/interrupted Render jobs.
- PLOT-UX1 retains Plot history behavior; this package changes the containing
  presentation label and adds an inspection command without changing Plot
  record semantics.
- UX4-AWS1 retains Agent-first surface state. Viewer content is embedded in the
  already authorized dominant Review surface, not a new Agent state.
- M2 retains shell/editor/Dock geometry and menu organization retains command
  grouping. This package adds only Preview/Open in Viewer commands and the
  central transient inspection surface.
- The proposed RStudio-inspired document supplies direction but is not itself
  implemented. This focused active contract resolves its HTML inspection slice
  and explicitly excludes its remaining WS3/WS5 scope.

No schema, persistence, approval, execution, environment, credential, public
protocol, or release-policy conflict was found. The security boundary is new
and is wholly owned by this contract.

## Version, Documentation, And Release

This is user-visible behavior in the existing `0.4.0-dev.0` development line.
Update `NEWS.md` after verification. Do not bump the application or R package
version in this work package; a later named distributable candidate must decide
and synchronize its candidate version before distribution.

Installed-app acceptance is required before a candidate can be accepted:
interactive htmlwidget behavior, iframe isolation, source/preview focus,
Windows 100%/125% display scale, and project switching must be reviewed in the
exact installed build. This source package cannot change release readiness.

## Definition Of Done

OUTPUTS-VIEWER-1 is implementation-complete when all authorized types and entry
points work through one bounded Viewer contract, security and project-isolation
negative tests pass, mock and desktop commands match, affected automated suites
and browser layouts pass, an independent security/contract review has no open
blocking finding, evidence and NEWS are reconciled, only scoped files are
committed, and installed/release gates remain truthfully separate.

## Implementation And Evidence

OUTPUTS-VIEWER-1 implementation and automated/browser verification are complete
on 2026-08-05. The installed-app and display-scale gates remain open.

- Added `rho.viewer_file.v1` with project containment, UTF-8 validation, a
  four-MiB byte budget, supported media types, and project-isolated fixtures.
- Added pinned Marked 18.0.9, DOMPurify 3.4.13, and Papa Parse 5.5.4 browser
  assets with license files and a deterministic sync script.
- Renamed the Dock presentation to Outputs and added a central Viewer with
  Source/Preview/Both controls, narrow-window switching, Plot and Artifact
  actions, Markdown sanitization, sandboxed HTML/CSP, and bounded CSV/TSV.
- Agent-first Artifact Review now embeds the same isolated HTML/table/Markdown
  preview path in its existing dominant Review surface.
- `cargo +stable-x86_64-pc-windows-gnu test --workspace`: passed.
- All `scripts/test-*-ui.mjs` contracts: passed.
- `node --check desktop/dist/app.js`, Rust fmt check, Viewer contract test, and
  `git diff --check`: passed.
- Browser/mock review passed for Markdown preview and interactive HTML click
  behavior at 1440x900. At 390x844 Viewer uses one preview pane and measured
  document `scrollWidth` equals the viewport width.

Independent review closed the link-navigation and posture-residue issues by
disabling Markdown external link activation and clearing transient Human Viewer
state when switching to Agent posture. `npm audit` still reports the existing
Monaco 0.55.1 transitive DOMPurify 3.2.7 advisories; Viewer uses the direct
DOMPurify 3.4.13 asset and does not invoke Monaco's bundled dependency. This is
recorded residual dependency risk for a future Monaco upgrade, not a Viewer
security-boundary acceptance.

### HTML fragment-navigation defect repair (2026-08-06)

The user reported that clicking a table-of-contents link in an installed HTML
preview replaced the report with a nested Rho startup screen. The report uses
ordinary percent-encoded `href="#..."` fragment links. In an iframe `srcdoc`,
those fragments inherit the embedding Rho page URL, so default navigation can
load the application shell inside the opaque-origin sandbox; that nested shell
cannot access Tauri and reports a runtime-check failure.

Authorization: the user requested this Viewer defect be repaired. Change class:
D1. Risk class: R2 because the behavior is local frontend navigation inside
the HTML sandbox security boundary. The `HTML-FRAGMENT-NAV-1` slice requires
fragment-only links to scroll to matching `id` or named targets, including
percent-encoded Unicode fragments, while all non-fragment link activations
remain blocked. Central Viewer and Agent inline HTML Review use the same
sandbox transformation without changing Artifact, project, read, or execution
authority.

Implementation and focused verification completed on 2026-08-06. The shared
`viewerSandboxHtml()` transformation injects a capture-phase link guard after
the restrictive CSP. It prevents default link navigation, decodes fragments,
and scrolls only inside the same opaque-origin document. `node --check`, the
Outputs Viewer, Agent output-review, and Agent-first frontend contracts passed,
as did `git diff --check`.

Browser/mock interaction with a percent-encoded Unicode fragment moved the
iframe from `scrollY = 0` to `937`; the inline script button still updated its
content, and an external-link click retained the report and one iframe without

# WS2 Local Help And Package Location

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D2 bounded cross-boundary read-only editor workflow
Risk: R2 installed-package discovery, local path disclosure, browser/mock
parity, and editor navigation fallback
Work package: WS2-H1
Mandatory stop: after one bounded local Help location surface, complete the
R/Rust/frontend matrix, contract review, version/NEWS and checklist
reconciliation, and an independent commit

## Problem

Project-local Go to Definition works, but its package fallback calls
`editor_function_help` and discards the response. Users see only a toast and
cannot inspect which installed package owns the symbol or where its local Help
and package installation live. The current R helper also treats the local Help
record path as if it were rendered title/body text.

## Scope And Ownership

- Workspace R resolves installed package and Help truth. Rust remains the
  project/workspace identity and bounded Probe authority. The frontend only
  presents the returned record.
- Extend the existing `workspace.function_help` request and
  `editor_function_help` Tauri command; do not add persistence or a second Help
  store.
- Add a Local Help context tab that opens after a project-definition miss and
  may also be refreshed from hover-derived results.
- This package does not render full Rd sections, arguments, examples,
  vignettes, package manuals, URLs, or execute examples. Those remain owned by
  the separate full installed-version Help package.
- This package does not read or open arbitrary external files. A source path is
  shown only when R supplies an existing source reference inside the resolved
  installed package root. The package and library roots are display-only.

## Response Contract

`rho_function_help(name, package = NULL)` returns a JSON-safe record:

- `name`: requested symbol, bounded to 128 UTF-8 bytes;
- `found`: whether a local Help record or installed function was resolved;
- `package`: actual owning installed package or `null`;
- `signature`: bounded deparsed function signature or `null`;
- `help_topic`: the resolved local Help topic or `null`;
- `help_record`: normalized logical Help-record path or `null`;
- `package_root`: normalized installed package root or `null`;
- `library_root`: normalized parent library root or `null`;
- `source_path`: normalized existing source-reference path only when it remains
  inside `package_root`, otherwise `null`;
- `source_line`: positive source-reference line only when `source_path` exists;
- `ambiguous`: true when unqualified Help lookup returned more than one local
  record;
- `truncated`: true when any display field was byte-truncated.

Package-qualified lookup requires one valid R package name and resolves only
that installed namespace. Unqualified lookup follows R's local Help resolution
order and reports ambiguity rather than silently claiming uniqueness. No
network lookup, package load/attach, filesystem write, or code execution occurs.

All paths are bounded to 1,000 UTF-8 bytes. The UI labels them Local Help
record, Package root, Library root, and Source reference so a logical Help
record is not misrepresented as a directly readable source file.

## UI Contract

- Add a `Help` context tab and unframed detail surface with symbol/package,
  signature, availability state, and the four optional locations.
- F12/Ctrl+Click continues to open a project definition when found. On a miss,
  it queries Local Help, opens the Help tab, and focuses its heading.
- Empty, loading, found, ambiguous, unavailable, and error states are explicit.
- Long paths wrap without horizontal document overflow. Text is inserted with
  DOM text APIs, not HTML interpolation.
- Hover continues to show a concise signature and may add owning package and
  source/help availability; it does not duplicate the full location surface.
- Browser/mock mode implements found, ambiguous, unavailable, and long-path
  fixtures and exposes a deterministic `local-help` preview scenario.

## Cross-review

- Accepted WS2 Go-to-Definition retains project-source discovery and editor
  navigation ownership. WS2-H1 only replaces its discarded package fallback.
- Accepted hover help retains the existing request/command lane. This package
  corrects and extends its additive response without creating another query.
- WS1-L2 package source labels remain lockfile/library provenance evidence;
  they do not claim navigable installed Help or source locations.
- The later full installed-version Help package owns rendered Rd content,
  examples, vignettes, version presentation, and recorded example execution.
- No schema, approval, credential, network, mutation, public protocol, or
  arbitrary filesystem authority changes.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- qualified and unqualified base/recommended package resolution;
- missing symbol/package, ambiguous Help records, internal/exported function,
  absent signature, source reference inside/outside package root;
- path/text bounds, Unicode symbol, malformed input, serialization, and no
  package attachment or working-directory dependency.

Rust/Tauri:

- request allow-list, R expression escaping, optional package binding, Probe
  classification, workspace identity, malformed argument rejection, and
  additive response pass-through.

Frontend/mock:

- project definition still wins; fallback loading/found/ambiguous/unavailable/
  error states; safe text rendering; keyboard focus; long path wrapping; mock
  parity and desktop/narrow viewport review.

## Version And Lifecycle

- `rho.bridge` advances from `0.1.5` to `0.1.6` because its exported Help
  response contract changes.
- Application metadata remains `0.4.0-dev.0`; root and package NEWS update
  after evidence.
- The checklist changes from 16 open / 33 completed to 15 open / 34 completed
  only after full verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS2-H1 reaches its stop when a package fallback produces a truthful, bounded,
visible Local Help location record without new read/mutation authority, all
affected tests and browser review pass, versions/docs are reconciled, and the
package is independently committed.

## Implementation And Evidence

Implementation, contract review, and automated/browser verification completed
on 2026-08-03 without authority, schema, or scope deviations:

- Workspace R resolves bounded installed-package and logical Help-record paths
  without loading or attaching an unloaded namespace. It preserves explicit
  null response fields and exposes a source reference only when the existing
  path remains inside the resolved package root and its line is positive.
- Rust rejects empty, oversized, control-character, and malformed package
  requests before constructing an escaped Probe expression. No schema,
  persistence, approval, network, execution, or mutation lane changed.
- Go to Definition still prefers project source. Its fallback opens the Help
  context tab with explicit loading, found, ambiguous, unavailable, error, and
  truncation states; all returned text and paths use DOM text APIs.
- Browser/mock review covered found, ambiguous, unavailable, error, and long
  path states at `1280 x 720` and `800 x 900`. The Help heading received focus,
  no browser warnings/errors appeared, and no document or panel overflow was
  observed.
- Independent contract review found one source-line validation gap. The final
  implementation now rejects missing, zero, negative, and invalid source lines;
  regression coverage records the positive and rejected cases.

Automated evidence:

- focused `rho.bridge` completion contract: 35 passed;
- complete `rho.bridge`: 326 passed; one existing DESCRIPTION file-symlink
  fixture skipped because this Windows session could not create file symlinks;
- `rho-server`: 29 passed;
- `rho-desktop`: 83 passed;
- Rust formatting, JavaScript syntax, Local Help UI, Agent-first UI,
  Console/Logs UI, Environment lockfile UI, and `git diff --check`: passed.

`rho.bridge` advances to `0.1.6`; application metadata remains
`0.4.0-dev.0`. Root and package NEWS are updated, and the checklist is
reconciled to 15 open / 34 completed. Installed-app/manual acceptance remains
open, so this contract remains active and no milestone or release-readiness
claim is made.

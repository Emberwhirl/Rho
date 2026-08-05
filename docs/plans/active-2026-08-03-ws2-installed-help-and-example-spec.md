# WS2 Installed Help And Reviewed Example

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Repair authorization: user explicitly authorized Console-to-Help integration
on 2026-08-05
Change class: D2 bounded cross-boundary Help and explicit execution workflow
Risk: R2 installed documentation parsing, transport bounds, package metadata,
browser/mock parity, and user-confirmed Workspace execution
Work package: WS2-H2
Mandatory stop: after one full installed-version Help surface and reviewed
example run path, complete the R/Rust/frontend matrix, contract review,
version/NEWS and checklist reconciliation, and an independent commit

## Problem

WS2-H1 exposes truthful local Help/package locations but deliberately does not
render installed documentation. Users still leave Rho to inspect usage,
arguments, details, values, examples, package version, and vignettes. The WS2
checklist also requires explicit execution of a selected installed example as
a normal recorded Workspace run. Running hidden or `\dontrun` Rd content, or
executing an incomplete transport-truncated example, would be unsafe and
untruthful.

## Scope And Ownership

- Workspace R owns the installed Rd record, package DESCRIPTION version, and
  installed vignette index. Rust owns bounded request validation, escaped Probe
  dispatch, active Workspace identity, and additive response pass-through.
- Add `workspace.function_documentation` and
  `editor_function_documentation`. Keep the existing concise
  `workspace.function_help` response for hover and location fallback.
- Extend the existing Help context surface with Overview, Arguments, Examples,
  and Vignettes views. Do not add a second Help tab, store, cache, or browser.
- Example execution reuses existing `execute_r` / `workspace.execute` with
  `ExecutionOrigin::User` and execution mode `help_example`. It creates the
  same durable Run/Problems/output evidence as other direct user execution.
- The user must inspect the complete visible example and confirm before it is
  submitted. The package does not auto-run, auto-attach, install, load, or
  execute anything during documentation lookup.

This package does not open external URLs or arbitrary package files, render
HTML/PDF vignette bodies, run vignettes, run more than the selected displayed
example, or grant Agent execution authority.

## Documentation Response Contract

`rho_function_documentation(name, package)` requires a validated symbol and
one explicit installed package name. It resolves one local Help record and
returns a fixed JSON-safe record:

- `name`, `package`, `package_version`, `help_topic`, and `found`;
- bounded `title`, `description`, `usage`, `details`, and `value` text;
- `arguments`: ordered `{name, description}` records;
- `example`: `{code, executable, omitted_tags, parse_error}`;
- `vignettes`: ordered `{topic, title}` records from the installed package;
- `truncated`, `incomplete`, and stable `notices` metadata.

Bounds:

- title/version/topic/argument names: 500 bytes each;
- description/details/value: 8 KiB each; usage: 12 KiB;
- at most 100 arguments with 2 KiB descriptions;
- one visible example body up to 32 KiB;
- at most 50 vignettes with 500-byte topic/title fields;
- total notices at most 20 stable reason codes.

The response remains additive and fixed when fields are unavailable. Missing
sections are `null` or empty lists, not deleted list keys.

## Rd And Example Safety Contract

- Resolve one record through `utils::help()` and read only that record with the
  installed R `utils`/`tools` Rd APIs. Do not enumerate every package Rd file.
- Render supported sections as plain text. The frontend never inserts Rd/HTML
  as markup.
- Read package version from the installed DESCRIPTION and vignette topic/title
  from `utils::vignette(package = ...)`; do not load or attach its namespace.
- The visible executable example is assembled only from top-level visible Rd
  code. `\dontrun`, `\donttest`, `\dontexample`, and `\dontshow` subtrees are
  omitted and listed in `omitted_tags`.
- An example is executable only when non-empty, complete within the byte bound,
  and parseable as R. Truncated, malformed, missing, or fully omitted examples
  have no Run action.
- Lookup never changes `.GlobalEnv`, search path, loaded namespaces, working
  directory, files, network state, or project state.

## UI And Execution Contract

- Local Help first renders the existing location summary, then loads installed
  documentation without blocking the editor. Location success remains visible
  if full documentation is unavailable.
- Overview shows installed package/version, title, description, usage, details,
  and value. Arguments, Examples, and Vignettes use ordinary view tabs and
  truthful empty/error/truncated states.
- The example code is fully visible in a bounded scrollable code surface. Run
  is disabled when `executable` is false or while another execution is busy.
- `Run reviewed example` opens a confirmation naming the exact
  `package::topic` and states that ordinary R code may change the Workspace,
  create files, produce plots, or fail. Confirm submits the exact displayed
  code through existing `executeCode()` as `help_example`; cancel performs no
  request.
- Existing Console, Runs, Problems, interrupt, Workspace refresh, and
  project-switch blockers remain authoritative for execution truth/recovery.
- Browser/mock mode covers found, section-empty, omitted, truncated,
  unavailable, error, and execution success/failure fixtures plus a
  deterministic `installed-help` preview.

## Cross-review

- WS2-H1 retains location/source-reference ownership and concise hover payload.
  WS2-H2 reads the resolved qualified topic on demand and does not redefine its
  path semantics.
- Existing `workspace.execute`, Run, Problems, output, interrupt, and project
  switching contracts remain authoritative. Documentation content is not an
  approval and never executes through a Probe.
- Environment/package operations remain separate. Help lookup and example
  execution do not install, update, remove, restore, snapshot, or mutate the
  lockfile.
- Agent local-Help citation remains a later read-only package; this response
  does not enter prompts automatically.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- base/recommended and ordinary installed package Rd resolution; package/topic
  mismatch and missing record;
- title/description/usage/arguments/details/value extraction, fixed JSON schema,
  Unicode, malformed Rd fallback, and every field/count/byte bound;
- vignette present/empty/bounded fixtures;
- visible example extraction, omitted tags, parse rejection, truncation
  rejection, and no namespace/search/cwd/global-environment change.

Rust/Tauri:

- qualified request validation, escaping, Probe classification, Workspace
  identity, malformed rejection, and response pass-through;
- existing `execute_r` remains user-origin recorded execution; no new example
  bypass command or approval lane.

Frontend/mock:

- location remains usable while docs load/fail; overview/arguments/examples/
  vignettes found and empty states; safe text rendering; long wrapping;
- disabled unsafe example, confirmation cancel/success/failure, Console/Run/
  Problems projection, busy/cancel truth, mock parity, and browser review.

## Authorized Repair WS2-H2-R1: Console Help Projection

### Defect And Invariant

Console evaluation of `?mean` succeeds, but `rho_execute()` prints the final
`help_files_with_topic` value. That print path starts R's HTTP Help server while
returning no topic/package metadata that the desktop can project. The Console
therefore shows only the server-start message and the existing right-side Help
surface remains empty.

The repair invariant is: when the final successful Console result is one local
R Help object, the recorded `workspace.execute` response carries one bounded
Help target, does not print or start the HTTP Help viewer, and opens the
existing right-side Help surface through its current location/documentation
queries. Ordinary execution and non-Help results remain unchanged.

### Contract And Bounds

- `rho_execute()` adds a fixed nullable `help` field. A Help result is
  `{topic, package}` where `topic` is the Help object's bounded topic attribute
  and `package` is present only when all returned Help records resolve to one
  valid installed-package directory name.
- Topic is bounded to 128 UTF-8 bytes. Package is either one valid R package
  name of at most 128 ASCII characters or `null`. Missing and ambiguous Help
  records retain the requested bounded topic and defer truth resolution to the
  existing `workspace.function_help` lane.
- Help projection is based on the evaluated result class, not frontend parsing
  of R source. It applies only when the final successful expression returns
  `help_files_with_topic`; `??topic`, arbitrary browser URLs, intermediate
  expressions, and general viewer dispatch remain out of scope.
- The Help object is not printed. This prevents R's HTML Help server/browser
  side effect. The original Console command remains a normal durable user Run;
  no execution, approval, persistence, project, or package authority changes.
- After rendering ordinary execution output, the frontend reuses
  `showLocalHelp(topic, package)`. Lookup failure remains visible in Help and
  does not rewrite the successful execution result.
- Browser/mock `execute_r` returns the same Help projection for deterministic
  Console Help requests, emits no Plot for those requests, and keeps ordinary
  execution fixtures unchanged.

### Repair Verification Gate

- R regression: ordinary values keep `help = NULL`; `?mean`, explicit-package
  `help()`, package-qualified `?`, and a missing topic return a JSON-safe
  bounded Help target without invoking the Help print/browser path.
- Frontend regression: a successful execution Help target calls the existing
  Local Help route exactly once; absent/malformed targets do not navigate; the
  command remains in Console and the Run remains recorded.
- Browser/mock: deterministic Console `?mean` opens `base::mean` in the
  right-side Help surface without creating a Plot, while unavailable Help
  remains truthful and subsequent ordinary Console execution still works.
- Run the focused R/frontend checks, complete `rho.bridge`, JavaScript syntax,
  adjacent Local/Installed Help and Console/Logs checks, then review against
  this repair contract.

### Repair Version And Release Decision

- `rho.bridge` advances from `0.1.10` to `0.1.11` because structured execution
  adds the fixed nullable Help target.
- Application metadata remains `0.4.0-dev.0`; this repair does not create a new
  distributable candidate, and distribution remains prohibited until a named
  integration candidate reconciles application version metadata.
- Root and package NEWS record the implemented behavior. Exact installed-app
  acceptance remains open, so this active contract makes no milestone or
  release-readiness claim.

## Version And Lifecycle

- `rho.bridge` advances from `0.1.7` to `0.1.8` because it adds a distributed
  installed-documentation response contract.
- Application metadata remains `0.4.0-dev.0`; root and package NEWS update
  after evidence.
- The checklist changes from 14 open / 35 completed to 13 open / 36 completed
  only after full verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS2-H2 reaches its stop when installed-version documentation is truthful,
bounded, readable, and independent from hover; unsafe/incomplete Rd content
cannot run; a confirmed complete visible example uses the ordinary recorded
Workspace execution path; all affected tests and browser review pass;
versions/docs are reconciled; and the package is independently committed.

## Implementation And Evidence

Implementation, contract review, and automated/browser verification completed
on 2026-08-03 without authority, schema, or scope deviations:

- Workspace R resolves one explicitly qualified installed Help record and
  returns fixed JSON-safe title, description, usage, argument, details, value,
  example, package-version, and vignette fields. Tests cover base/recommended
  and ordinary installed packages, Unicode, missing sections, malformed Rd,
  every declared byte/count bound, and stable truncation notices.
- Documentation lookup preserves loaded namespaces, the search path,
  `.GlobalEnv`, and the working directory. `dontrun`, `donttest`,
  `dontexample`, and `dontshow` branches are omitted; malformed, empty, and
  transport-truncated examples are non-executable.
- Rust validates and escapes the qualified request and dispatches it as an
  active-Workspace Probe. The desktop adds no Help-specific execution command,
  persistence, approval, package mutation, filesystem, network, or Agent
  authority.
- The Help surface renders installed content only through DOM text APIs.
  `Run reviewed example` names the qualified topic, describes ordinary R side
  effects, requires confirmation, and submits the exact displayed code through
  existing `executeCode()` with execution mode `help_example`.
- Browser/mock review covered found, empty, omitted, truncated, unavailable,
  error, long-content, confirmation-cancel, execution-success, and
  execution-failure states. Documentation failure left the WS2-H1 location
  record visible; cancel created no Run; success reached Console and Runs;
  failure reached Console and Problems. At `1280 x 720` and `1024 x 768`, long
  content caused no document or Help-panel horizontal overflow and no page
  console errors.
- Independent review found and resolved missing explicit ordinary-package,
  Unicode, section/argument/vignette bound fixtures and nondeterministic
  background preview evidence. Stable limit notices and a background-safe
  preview hook now have regression coverage.

Automated evidence:

- focused installed Help contract: 57 passed;
- complete `rho.bridge`: 415 passed; two Windows file-symlink fixtures skipped;
- `rho-server`: 31 passed;
- `rho-desktop`: 83 passed;
- Rust formatting, JavaScript syntax, Installed Help UI, Local Help UI,
  Project References UI, Agent-first UI, Console/Logs UI, Environment lockfile
  UI, Environment package UI, and `git diff --check`: passed.

`rho.bridge` advances to `0.1.8`; application metadata remains
`0.4.0-dev.0`. Root and package NEWS are updated, and the checklist is
reconciled to 13 open / 36 completed. Exact installed-app/manual acceptance
remains open, so this contract stays active and no milestone or release
readiness claim is made.

## WS2-H2-R1 Implementation And Evidence

The authorized Console Help repair was implemented and independently reviewed
on 2026-08-05 without authority, persistence, schema, or scope deviations:

- `rho_execute()` now returns a fixed nullable `help` target for a final
  `help_files_with_topic` result. Topic and package metadata are validated and
  bounded; missing and ambiguous topics defer to the existing Local Help
  resolver. Help objects are not printed, so the R HTTP Help server is not
  started.
- Only Console-origin frontend execution consumes the target. It preserves the
  Console transcript and durable Run, opens the existing Help surface, and
  leaves failed/unavailable lookup truth in that surface. File, selection,
  Help-example, Agent, and ordinary execution results do not gain a new UI
  route.
- Browser/mock parity covers `?mean`, produces no synthetic Plot, and records
  deterministic Help location, documentation, Console-command, and Run state.
  The frontend asset cache key advances with the behavior.
- Contract review found and resolved an accidental roxygen export attachment,
  over-broad non-Console routing, a missing preview allowlist entry, a stale
  browser cache key, an incorrect command-evidence selector, and incoherent
  mock `mean` documentation before completion.

Automated evidence:

- `rho.bridge`: 493 passed, 2 Windows file-symlink fixtures skipped because
  file symlinks are unavailable in this session;
- Rust GNU workspace formatting and 240 tests: passed; 13 existing dead-code
  warnings remain in desktop Git helpers;
- JavaScript syntax, Installed Help UI, Local Help UI, Console/Logs UI, and
  `git diff --check`: passed.

Browser/mock evidence at `1280 x 720` and `1024 x 768` confirms `base::mean`
opens in Help, installed documentation is available, `> ?mean` remains in the
Console, the ordinary Console Run is recorded, no Plot is created, Help stays
inside its panel, and the document has no horizontal overflow or browser
warning/error. Exact installed-app/manual acceptance remains open; application
metadata stays `0.4.0-dev.0`, while `rho.bridge` advances to `0.1.11`.

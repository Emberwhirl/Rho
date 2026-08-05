# Audit Runtime Reliability Repair

Status: active; AUDIT-REL1 implementation and automated verification complete 2026-08-05; installed acceptance open

Date: 2026-08-05

Change class: D1 defect repair

Risk: R2 cross-boundary workflow

Owner: existing RA-RC2 read-only project reproducibility audit runtime and its
desktop request lifecycle

## Problem And Evidence

The installed application can leave Project check permanently in `RUNNING`.
`startup.jsonl` records repeated panics at `crates/rho-store/src/audit.rs:430`
with `the len is 15 but the index is 20`. The package extractor initializes an
index from a UTF-8 byte length and then uses it against a `Vec<char>`. A saved
fixture line containing `cat("\n─── base::plot() ───\n")` with non-ASCII dash
characters before `base::` reproduces that byte/character mismatch.

The desktop currently waits without a bounded failure path. It also starts a
disk-backed project check while supported source documents have unsaved editor
content, without telling the user that those buffers are excluded. Finally,
the existing Windows absolute-path rule recognizes drive paths containing a
backslash but misses the equally valid R spelling `D:/...`.

## Invariants

- Any valid UTF-8 project text, including non-ASCII text before `pkg::symbol`,
  is processed without panic.
- An unexpected audit panic becomes a stable command error; the UI always
  leaves the running state within a bounded interval and permits retry.
- A response from an earlier project or superseded request cannot replace the
  current project's audit state.
- Project checks remain disk-backed. If an open supported source document is
  dirty, the check is blocked with a clear save-first state rather than
  silently auditing stale content.
- Existing `setwd()` and randomness rules continue to report saved source.
- Windows drive-absolute paths using either `\` or `/` are recognized without
  treating URL schemes as drive paths.
- The operation remains read-only and project-root scoped.

## Scope

AUDIT-REL1 owns only:

- Unicode-safe namespace/package extraction in `rho-store`;
- the existing Windows drive-absolute portability matcher;
- panic-to-error containment at the Tauri audit command boundary;
- dirty-source preflight, bounded wait, stale-request rejection, failure
  presentation, and browser/mock parity in the desktop UI;
- focused regression and contract tests.

It does not own or change audit response schema, durable records, rule IDs,
severity policy, project identity, Run/Artifact truth, Agent explanation,
repair actions, automatic save, Workspace R execution, or release acceptance.
The accepted RA-RC2 backend/UI contracts remain authoritative for those areas.
`active-2026-08-05-audit-human-friendly-presentation-spec.md` continues to own
shared human-facing labels and finding presentation.

## User-Visible Contract

1. Check project synchronizes the active editor buffer into frontend state and
   inspects all open `.R`, `.Rmd`, `.qmd`, and `.Rnw` documents.
2. If any are dirty, no backend audit starts. Human-first and Agent-first show
   that modified files must be saved, identify the affected project-relative
   files, and invite the user to run the check again after saving.
3. Otherwise the existing project audit starts. It completes normally, shows a
   stable failure response, or times out after 30 seconds. Every terminal path
   clears the running state.
4. A project switch or a newer check invalidates the older request's UI result.
5. Saved `setwd("D:/")` and `rnorm()` without an earlier `set.seed()` remain
   visible findings after unrelated Unicode source is scanned safely.

## Failure And Recovery

- Rust panic containment returns a generic stable error and does not expose a
  runtime path or panic payload in the ordinary UI.
- A frontend timeout does not claim backend cancellation. It ends the visible
  wait, reports failure, and allows a fresh check.
- Closing the panel does not mutate audit truth. Starting a new check replaces
  the prior presentation only for the same current project.
- Dirty-buffer blocking performs no save and no backend call; normal Save
  remains the sole direct persistence action.

## Verification Matrix

Rust/store:

- package extraction handles the exact non-ASCII-before-`::` fixture;
- quoted and ordinary namespace identifiers retain expected behavior;
- `D:\\...` and `D:/...` produce the Windows absolute-path rule;
- URL schemes do not produce that rule;
- a project containing Unicode namespace text plus saved `setwd("D:/")` and
  unseeded `rnorm()` completes and reports the expected findings.

Tauri boundary:

- an injected panic is converted to `Err`;
- a normal response passes through unchanged;
- invalid scope remains a normal rejection.

Frontend/mock:

- dirty supported documents block invocation and identify affected files;
- clean documents invoke the existing command;
- success, backend rejection, timeout, retry, newer-request, and project-switch
  paths leave truthful state;
- Human-first and Agent-first render the same save-first/failure meaning;
- existing friendly audit presentation checks remain green.

Affected validation:

```powershell
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
cargo +stable-x86_64-pc-windows-gnu test -p rho-store audit
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop audit
node --check desktop/dist/app.js
node scripts/test-audit-human-friendly-ui.mjs
node scripts/test-agent-first-ui.mjs
git diff --check
```

## Acceptance And Stop Point

AUDIT-REL1 implementation and automated verification are complete. The focused
regression matrix passed, implementation review found no contract deviation,
and browser/mock behavior remains aligned. Stop after this repair. Installed
application confirmation remains open until a rebuilt candidate verifies that
the original fixture completes, reports the saved `setwd()` and randomness
findings, blocks dirty source truthfully, and recovers visibly from failure.

Automated evidence on 2026-08-05:

```text
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
cargo +stable-x86_64-pc-windows-gnu test -p rho-store audit
  23 passed; 0 failed
cargo +stable-x86_64-pc-windows-gnu test -p rho-store
  90 passed; 0 failed
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop audit
  1 passed; 0 failed
node --check desktop/dist/app.js
node scripts/test-audit-human-friendly-ui.mjs
node scripts/test-git-review-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-human-facing-information-ui.mjs
node scripts/test-console-logs-ui.mjs
node scripts/test-workbench-menu-ui.mjs
git diff --check
```

Implementation review: Unicode package extraction uses character indices only;
drive-path matching is bounded to a drive-letter boundary and excludes URL
schemes; the UI does not expose raw panic text and invalidates stale project
responses. No schema, persistence, execution, approval, or authority deviation
was introduced.

## Version And Release Impact

This is user-visible application behavior. Record it in `NEWS.md`. Application
version metadata advances only when the repair is included in a named new
development candidate; no R package version changes. Automated completion does
not close installed-app acceptance or authorize release.

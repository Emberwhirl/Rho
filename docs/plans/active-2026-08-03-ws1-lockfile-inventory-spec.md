# WS1 Lockfile Inventory And Library Comparison

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 bounded read-only environment projection
Risk: R2 Workspace R schema, project-root isolation, malformed lockfile states,
and browser/mock parity
Work package: WS1-L1
Mandatory stop: after bounded inventory/comparison, complete affected
validation, browser review, checklist reconciliation, version/NEWS update, and
an independent commit

## Problem

Rho shows a searchable installed-package inventory and a summary renv status,
but users cannot browse the project lockfile or compare each locked package
with the effective library. The environment-operation preview has a bounded
drift list, but it is an operation review surface rather than a persistent,
searchable read-only inventory.

## Authority And Scope

- Workspace R reads `renv.lock` under the explicit normalized project root and
  compares it with packages visible through the current `.libPaths()`.
- A typed `workspace.list_lockfile_packages` request is read-only and returns a
  bounded projection; the frontend filters only the returned maximum 500 rows.
- Rows are the union of locked and installed package names. Each row has name,
  locked version, installed version, selected installed library, and one state:
  `matched`, `version_mismatch`, `missing_in_library`, or
  `missing_in_lockfile`.
- When duplicate installed package names exist, the selected installed row is
  the first library in `.libPaths()` order. Library path is evidence, not a
  mutation target.
- Response metadata includes lockfile existence/validity, parse error, returned
  count, truncation, and exact union/state counts when both sources are
  complete. A source-limit response sets the union total to null and marks its
  observed counts incomplete rather than claiming an exact total.
- Missing lockfile is a valid `no_lockfile` state with installed-only rows.
  Malformed lockfile is an explicit invalid state; no package names are guessed
  from partial JSON.
- Package source and direct/transitive dependency classification are not
  presented in this package. Individual install/remove/update and renv
  mutations remain separate high-risk work.

## Bounds And Compatibility

- `limit` is clamped to 1..500. Comparison may inspect at most 10,000 installed
  rows and 10,000 lockfile package entries; exceeding either source marks the
  response truncated/incomplete rather than silently claiming completeness.
- `renv.lock` parsing is limited to 5 MiB; larger files return an explicit
  incomplete size-limit state without parsing or guessing partial rows.
- Names and versions are bounded scalar strings. No DESCRIPTION files, package
  source trees, remote repositories, or arbitrary lockfile fields are returned.
- Existing environment snapshot, operation preview, installed-package command,
  and their schemas remain unchanged.
- `rho.bridge` adds an exported read-only helper and advances independently.

## UI And Mock Contract

- Environment contains Installed and Lockfile tabs rather than nested cards.
- Lockfile tab has one search input, summary counts, and a compact table for
  Package, Locked, Installed, and State. Library path is available as restrained
  secondary text/title, not another wide column.
- Matched, mismatch, missing-in-library, and library-only states have text
  labels; color is not the only signal.
- No lockfile, malformed lockfile, loading, empty, truncated, and command error
  states are explicit and do not show a synchronized claim.
- Browser/mock mode contains deterministic matched, mismatch, lockfile-only,
  and library-only rows plus missing/malformed variants for validation.

## Cross-review

- Accepted WP1 retains authority for normalized project roots, read-only status,
  and truthful lockfile failure states. This package adds a browse projection
  and no mutation or approval path.
- Existing environment-operation preview remains the confirmation-bound view
  for initialize/restore/snapshot. This inventory cannot authorize an
  operation.
- WS1-L2 will own direct/transitive dependency and package-source presentation.
  WS1-M1 will separately own any individual package mutation.
- No schema migration, durable state, credential, network, public protocol,
  project switch, execution authority, or release tooling is changed.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- matched, version mismatch, missing-in-library, and missing-in-lockfile rows;
- `.libPaths()` precedence for duplicate installed names;
- missing, empty, malformed, and oversized lockfiles;
- limit clamp, deterministic name order, exact counts, truncation, Unicode, and
  serializable scalar output;
- explicit project root and two-project isolation;
- installed-package enumeration failure and recovery.

Rust/Tauri:

- command requires active project/session and forwards explicit normalized
  root, bounded limit, and expected workspace;
- coordinator expression clamps invalid limits and remains read-only;
- additive response serializes without changing existing environment commands.

Frontend/mock:

- tabs, search, state labels, empty/error/truncated states, and legacy Installed
  inventory remain usable;
- deterministic desktop/narrow examples have no overlap or document-level
  horizontal overflow.

## Verification Matrix

```powershell
Rscript -e "devtools::test('R/rho.bridge')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-environment-lockfile-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

## Version And Lifecycle

- `rho.bridge` advances from `0.1.2` to `0.1.3` because its exported read-only
  package inventory contract changes; package NEWS is updated after validation.
- Application metadata remains `0.4.0-dev.0`; root NEWS records the user-visible
  capability after validation.
- The remaining-work count changes from 19 open / 30 completed to 18 open / 31
  completed only after the complete affected matrix and review pass.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS1-L1 reaches its mandatory stop when users can search a bounded, truthful
project lockfile/library union without confusing inventory with mutation,
missing/malformed/truncated states and project isolation are covered, existing
installed inventory remains compatible, browser/mock parity is demonstrated,
versions and NEWS are reconciled, and the package is independently committed.

## Implementation And Evidence

Implementation completed on 2026-08-03 without authority or scope deviations:

- `rho.bridge` now exports `rho_list_lockfile_packages()` with an explicit
  normalized project root, four comparison states, `.libPaths()` duplicate
  precedence, deterministic sorting, 1..500 response bounds, 10,000-row source
  bounds, and a 5 MiB lockfile parse budget.
- The coordinator admits the request only as a read-only Probe. The Tauri
  command derives the project root from active broker state and forwards the
  expected Workspace identity; neither UI input nor `getwd()` selects it.
- Environment now provides Installed and Lockfile tabs with one shared search,
  compact comparison rows, accessible state text, and explicit no-lockfile,
  malformed, loading, error, and incomplete states. Mock mode implements the
  same command and deterministic state variants.
- Browser review also found and fixed the legacy Installed tab's handling of
  the canonical `{ values, truncated }` attached-package schema.

Automated evidence:

- `Rscript -e "devtools::test('R/rho.bridge')"`: 209 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-server`: 26 passed.
- `cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop`: 83 passed.
- GNU `cargo fmt --all -- --check`, JavaScript syntax, lockfile UI,
  Agent-first, Console/Logs, and `git diff --check`: passed.

Browser evidence in mock mode at 1280 x 720 and 800 x 900:

- Matched, version mismatch, not installed, and not locked rows rendered with
  exact summary counts; search reduced the visible comparison to the matching
  row and both package tabs remained usable.
- Missing and malformed lockfiles rendered distinct truthful states. The
  malformed state displayed no guessed partial packages.
- At 800 x 900, all four columns and state labels fit without document-level
  horizontal overflow or overlap between tabs, search, and results.

`rho.bridge` advanced to `0.1.3`. Application metadata remains
`0.4.0-dev.0` because this bounded package joins the current uncut development
candidate; root and package NEWS are updated. Installed-app and exact-candidate
manual acceptance were not run, so this document remains active.

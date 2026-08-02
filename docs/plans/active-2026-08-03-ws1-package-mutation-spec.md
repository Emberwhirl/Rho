# WS1 Individual Package Mutation

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that every remaining package proceed one at a
time
Change class: D3 shared environment execution and approval contract
Risk: R3 package installation, update, destructive removal, network resolution,
project isolation, cancellation, and durable recovery
Work package: WS1-M1
Mandatory stop: after one-package install/update/remove, complete the R/Rust/UI
matrix, safety review, version/NEWS and checklist reconciliation, and an
independent commit

## Problem

Rho can inspect installed and locked packages and run reviewed project-wide
renv operations, but a user cannot act on one package from the Environment
surface. The remaining WS1 capability is a bounded package workflow that keeps
the existing broker-owned mutation and evidence guarantees.

## Authority And Non-goals

- Workspace R remains the execution authority. Rust owns project identity,
  revisions, preview hashing, single-use confirmation, run persistence, and
  terminal truth.
- The existing `environment_operation_requests` table and dialog remain the
  dedicated direct-UI and Agent audit lane. `approval_requests` and Act-session
  auto-authorization cannot approve package mutations.
- V1 accepts exactly one syntactically valid R package name. It does not accept
  version expressions, URLs, Git references, local paths, arbitrary renv
  arguments, or a package vector.
- Mutations target only the explicit renv project library returned for the
  normalized active project. They never remove from or install into a user,
  system, or unrelated library.
- Package library changes do not write `renv.lock`. The existing separately
  confirmed Snapshot operation remains the only lockfile-write action.
- No package, renv, BiocManager, repository, credential, or library activation
  is installed or changed silently.

## Typed Operations

The operation request adds these names to the existing environment contract:

| UI operation | Request type | Required argument | Fixed R action |
| --- | --- | --- | --- |
| `install_package` | `environment.package_install` | `package` | `renv::install()` into the exact project library |
| `update_package` | `environment.package_update` | `package` | `renv::update()` for the exact package and project library |
| `remove_package` | `environment.package_remove` | `package` | `renv::remove()` from the exact project library |

Package names are 1 to 128 ASCII characters and match
`^[A-Za-z][A-Za-z0-9.]*$`. R and Rust both validate the same contract.

Fixed execution arguments:

- install: `renv::install(packages = package, library = project_library,
  rebuild = FALSE, repos = confirmed_repositories, prompt = FALSE,
  dependencies = NA, transactional = TRUE, lock = FALSE, project = project)`;
- update: `renv::update(packages = package, library = project_library,
  rebuild = FALSE, check = FALSE, prompt = FALSE, lock = FALSE, all = FALSE,
  repos = confirmed_repositories, project = project)`;
- remove: `renv::remove(packages = package, library = project_library,
  project = project)`.

No additional `...` values are forwarded. Update's fixed `repos` value is
passed through renv's documented extension arguments; arbitrary extension
arguments remain forbidden.

## Preview And Confirmation

Before persistence, Workspace R returns a structured package preview bound to
the explicit project root and operation. It contains:

- normalized project root and project library;
- package name, requested action, installed version in that exact library, and
  locked version when present;
- a disposition: `will_install`, `will_update`, or `will_remove`;
- exact bounded repository names and URLs used for install/update;
- warnings that dependency resolution may add or update additional packages
  and that package managers cannot promise rollback after partial writes.

Install rejects a package already present in the project library; Update and
Remove reject one that is absent. Remove also rejects base or recommended
packages. Install/Update reject an empty or unresolved repository set,
`@CRAN@`, credential-bearing URLs, and non-HTTP(S) repository URLs. Preview is
read-only and performs no package download or remote version lookup.

The canonical stored arguments include the operation, normalized project root,
package, project library, and exact sorted repositories. The request remains
bound to workspace identity, state/project revisions, before-snapshot ID, and
preview SHA-256. A repository option change after preview does not alter the
confirmed execution because execution uses the stored set.

## Failure, Cancellation, And Recovery

- Existing requested, approved, rejected, stale, running, completed, failed,
  interrupted, and restart-recovered states remain authoritative.
- A package operation always captures before/after environment evidence when
  possible and refreshes the Environment surface after any terminal outcome.
- Cancellation remains best effort. UI wording must say partial library writes
  may exist and require refresh; it must never claim rollback.
- A successful package-library mutation advances Workspace state revision.
  Project revision advances only if project files actually changed through the
  existing watcher; this package does not manufacture a lockfile revision.
- Project switching remains blocked while the direct request is pending or
  running, and records from projects A and B never cross list/detail/decision
  boundaries.
- No schema migration or historical backfill is required because the existing
  typed JSON fields and lifecycle states are additive-compatible.

## UI And Mock Contract

- The Environment package area adds one compact Manage Package command.
- A package-management dialog uses an operation selector and package-name
  input. It explains the selected project library and keeps Preview as the only
  primary action; no mutation happens from the form itself.
- The existing environment review dialog then shows package, library, exact
  repositories, current/locked version, disposition, warnings, revisions, and
  approval actions.
- Lockfile rows expose contextual Manage actions that prefill install for Not
  installed, update for Version mismatch, and remove for installed-only rows.
- Loading, invalid input, preview rejection, requested, stale, rejected,
  running, failed, interrupted, completed, narrow-window, keyboard, and focus
  return states are explicit.
- Browser/mock mode implements representative install, update, remove, stale,
  failed, and interrupted requests without changing real files.

## Cross-review

- Accepted WP1 retains ownership of the dedicated request table, exact
  confirmation, environment snapshots, execution runs, cancellation truth,
  and recovery. WS1-M1 adds typed operations and arguments without redefining
  lifecycle states.
- WS1-L1/L2 retain inventory membership, comparison, dependency-role, source,
  and bounds authority. This package consumes row state only for UI defaults;
  the broker/R preview revalidates truth before creating a request.
- The Agent adds separate install/update/remove tools through the same dedicated
  environment lane and fresh confirmation. Ask/Plan and auto-approved Act
  remain unable to mutate.
- No public Workbench Protocol, credential, general network, arbitrary file,
  shell, approval schema, or project-switch authority changes.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- valid and invalid names, package absent/present, base/recommended rejection;
- exact project library targeting and rejection of a package found only in a
  foreign/user library;
- install/update/remove fixed argument forwarding through mocked renv calls;
- repository capture, sorting, protocol/credential rejection, and redaction;
- missing renv, operation failure, warnings/messages, Unicode/space project,
  bounded serialization, and two-project isolation.

Rust/store/Tauri:

- request-name mapping, canonical package/library/repository binding, R
  expression escaping, and no arbitrary argument forwarding;
- direct UI and Agent success, invalid input, mode/authorization rejection,
  stale revision, changed arguments, duplicate/single-use claim, failure,
  interruption, restart recovery, and two-project isolation;
- before/after evidence and run binding for all three package operations;
- existing initialize/restore/snapshot and project-switch behavior regressions.

Frontend/mock:

- form validation and operation selection, contextual prefilling, bounded
  preview content, approval/rejection and terminal states;
- existing Installed/Lockfile/search/dependency/source states remain usable;
- deterministic desktop and narrow preview with no overlap or document-level
  horizontal overflow.

## Verification Matrix

```powershell
Rscript -e "devtools::test('R/rho.bridge')"
Rscript -e "devtools::test('R/rho.agent')"
$env:PATH="C:\rtools45\x86_64-w64-mingw32.static.posix\bin;$env:PATH"
cargo +stable-x86_64-pc-windows-gnu test -p rho-store
cargo +stable-x86_64-pc-windows-gnu test -p rho-server
cargo +stable-x86_64-pc-windows-gnu test -p rho-desktop
cargo +stable-x86_64-pc-windows-gnu fmt --all -- --check
node --check desktop/dist/app.js
node scripts/test-environment-lockfile-ui.mjs
node scripts/test-environment-package-ui.mjs
node scripts/test-agent-first-ui.mjs
node scripts/test-console-logs-ui.mjs
git diff --check
```

## Version And Lifecycle

- `rho.bridge` will advance from `0.1.4` to `0.1.5` because its exported
  operation contract changes.
- `rho.agent` advances from `0.1.0` to `0.1.1` because this slice adds the three
  package-operation Agent tools.
- Application metadata remains `0.4.0-dev.0`; root NEWS updates after review
  and evidence because the capability is user-visible.
- The checklist changes from 17 open / 32 completed to 16 open / 33 completed
  only after implementation, complete affected verification, and review.
- Installed-app/manual acceptance remains open and prevents release-readiness
  or milestone-acceptance claims.

## Definition Of Done

WS1-M1 reaches its mandatory stop when all three one-package actions use the
existing dedicated audit lane, target only the confirmed project library,
expose truthful consequences and recovery, preserve project isolation and
single-use confirmation, pass the full affected matrix and independent safety
review, reconcile versions/docs, and are independently committed.

## Implementation And Evidence

Implementation, contract review, and automated/browser verification completed
on 2026-08-03 without authority, schema, or scope deviations:

- Workspace R previews and executes exactly one validated package against the
  normalized active project's confirmed renv library. Install and Update bind
  explicit credential-free HTTP(S) repositories; no operation writes
  `renv.lock` implicitly.
- The broker stores the package, library, sorted repositories, project and
  revision evidence in the existing dedicated request lane, requires exact
  single-use confirmation, repeats package-state validation immediately before
  execution, and records before/after evidence and truthful terminal states.
- Direct UI and Agent tools share that contract. Browser/mock mode covers
  Install, Update, Remove, invalid input, Failed, Interrupted, and Stale review
  states. Desktop and `800 x 900` review showed no document overflow or dialog
  viewport escape.
- Independent safety review found one ordinary-package removal defect: missing
  package `Priority` could be treated as a failed logical condition. The
  implementation now rejects only explicit base/recommended priorities, and
  the fixed-argument regression fixture covers the ordinary-package path.

Automated evidence:

- `rho.bridge`: 288 passed; one DESCRIPTION file-symlink fixture skipped because
  this Windows session could not create file symlinks;
- `rho.agent`: 45 passed;
- `rho-store`: 78 passed;
- `rho-server`: 28 passed;
- `rho-desktop`: 83 passed;
- Rust formatting, JavaScript syntax, Environment lockfile/package UI,
  Agent-first UI, Console/Logs UI, and `git diff --check`: passed.

`rho.bridge` advances to `0.1.5` and `rho.agent` to `0.1.1`; application
metadata remains `0.4.0-dev.0`. Root and package NEWS are updated, and the
checklist is reconciled to 16 open / 33 completed. Installed-app/manual
acceptance remains open, so this contract remains active and no milestone or
release-readiness claim is made.

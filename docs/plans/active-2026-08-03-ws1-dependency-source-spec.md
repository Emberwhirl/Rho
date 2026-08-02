# WS1 Dependency Role And Package Source Presentation

Status: active implementation contract

Date: 2026-08-03
Authorization: user requested that all remaining packages proceed one at a time
Change class: D2 bounded read-only environment projection
Risk: R2 structured project metadata, lockfile graph traversal, project-root
isolation, and browser/mock parity
Work package: WS1-L2
Mandatory stop: after dependency/source presentation, complete affected
validation, browser review, checklist reconciliation, version/NEWS update, and
an independent commit

## Problem

The searchable Lockfile inventory now shows installed-versus-locked state, but
it does not say which packages are declared by the project, which are reached
as transitive requirements, or where a package record came from. Users must
open and interpret `DESCRIPTION` and `renv.lock` manually.

## Authority And Scope

- Workspace R remains the read-only authority and receives the explicit
  normalized active project root.
- For an R package project, direct packages are the non-`R` package names in
  `Depends`, `Imports`, `LinkingTo`, and `Suggests` from the root
  `DESCRIPTION`. Base/recommended packages are not silently removed.
- Transitive packages are non-direct lockfile entries reachable through the
  bounded `Requirements` graph from those declared direct packages.
- Every other row is `unclassified`. Graph roots, installed state, source type,
  or mere lockfile presence never imply directness.
- Dependency-role evidence reports whether root `DESCRIPTION` exists and is
  valid, exact declared fields used, and an explicit unavailable/invalid
  reason. A non-package project is a truthful unclassified state, not an error.
- Package source is a bounded normalized projection from lockfile metadata
  first, then installed-package metadata for installed-only rows. It contains
  a source kind and restrained detail; it never performs network discovery.

## Source Normalization

Known lockfile metadata maps to these user-facing source kinds:

- `repository`: `Source = Repository`, with bounded repository name;
- `github`, `gitlab`, or `bitbucket`: matching `RemoteType`, with bounded
  owner/repository/ref detail;
- `git`: a bounded remote URL host/path label, with credentials and query or
  fragment removed;
- `url`: a bounded URL host/path label, with credentials and query or fragment
  removed;
- `local`: local/path/cellar records, showing only a bounded project-relative
  label when it is provably inside the project; otherwise no path detail;
- `unknown`: unsupported or absent metadata.

Installed-only metadata may report a repository or supported remote kind. It
does not inspect package source trees or guess from a library path.

## Bounds And Failure Truth

- Existing 5 MiB lockfile, 10,000 source-row/entry, 1..500 response, and scalar
  bounds remain authoritative.
- Each Requirements list is bounded to 512 names and graph traversal to 10,000
  nodes/edges. Exceeding a bound marks role classification incomplete and
  leaves affected rows unclassified.
- `DESCRIPTION` is parsed with `read.dcf()` only when it is a regular file no
  larger than 256 KiB under the normalized project root. Symlink/reparse escape
  or parse failure is explicit and yields no direct/transitive claims.
- Dependency fields use structured DCF parsing and standard package dependency
  tokenization. Version constraints are discarded; package names remain
  bounded. No source file scanning and no `renv::dependencies()` call occurs.
- Source URLs never expose userinfo, query strings, fragments, credentials, or
  arbitrary lockfile fields.
- Missing, malformed, oversized, unavailable, and source-limited inventory
  states from WS1-L1 remain unchanged.

## UI And Mock Contract

- The Lockfile table retains Package, Locked, Installed, and State columns.
  Dependency role and source appear as restrained secondary text under the
  package name rather than widening the table.
- Labels are `Direct`, `Transitive`, and `Unclassified`; source labels are
  textual and never depend on color.
- The Lockfile summary states whether dependency roles came from DESCRIPTION,
  are unavailable for a non-package project, or are incomplete/invalid.
- Search matches package name, dependency role, and source label/detail.
- Browser/mock mode contains direct, transitive, and unclassified rows plus
  repository, GitHub, local-redacted, unknown, missing-DESCRIPTION, and invalid
  DESCRIPTION variants.

## Cross-review

- WS1-L1 retains ownership of union membership, comparison states, project
  root, bounds, and lockfile failure truth. WS1-L2 adds metadata to those rows
  and does not redefine comparison.
- Accepted WP1 environment operations remain the only initialize/restore/
  snapshot mutation lane. This presentation cannot authorize an operation.
- WS1-M1 separately owns any install/remove/update workflow.
- WS2 local Help/package source navigation is not implemented here; source is
  provenance text, not a navigation or file-read authority.
- No schema migration, durable state, approval, credential, network, public
  protocol, project switch, execution authority, or release tooling changes.

No ownership, schema, policy, persistence, or sequencing conflict was found.

## Required Tests

Workspace R:

- direct fields with constraints and multiple DCF lines;
- transitive closure, cycles, duplicate requirements, unreachable rows, and
  missing requirements;
- missing, malformed, oversized, escaped/symlinked DESCRIPTION;
- graph name/edge/node bounds, deterministic output, Unicode, serialization,
  and two-project isolation;
- repository, GitHub/GitLab/Bitbucket, Git/URL redaction, safe local labels,
  escaped local paths, installed-only source, and unknown source.

Rust/Tauri:

- the existing command still forwards the explicit normalized root, bound,
  and expected Workspace identity as a read-only Probe;
- additive response metadata serializes without changing WS1-L1 callers.

Frontend/mock:

- role/source secondary text, summary, expanded search, unavailable/invalid/
  incomplete states, and all WS1-L1 states remain usable;
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

- `rho.bridge` advances from `0.1.3` to `0.1.4` after the complete affected
  matrix passes because its exported row contract changes additively.
- Application metadata remains `0.4.0-dev.0`; root NEWS updates after evidence.
- The remaining count changes from 18 open / 31 completed to 17 open / 32
  completed only after verification and review.
- Installed-app/manual acceptance remains open and separate.

## Definition Of Done

WS1-L2 reaches its mandatory stop when dependency roles are evidence-bound and
never guessed, source metadata is useful but credential/path safe, the existing
comparison remains compatible, browser/mock parity is demonstrated, versions
and NEWS are reconciled, and the package is independently committed.

## Implementation And Evidence

Implementation, contract review, and automated/browser verification completed
on 2026-08-03. Workspace R now derives direct roles only from the four declared
DESCRIPTION dependency fields, discards partial transitive claims when graph or
source bounds are reached, and projects bounded credential-safe source labels.
The existing lockfile command, comparison states, and read-only Probe authority
remain unchanged.

Automated evidence:

- `rho.bridge`: 247 passed, one file-symlink fixture skipped because this
  Windows session could not create file symlinks; normalized-path rejection is
  still implemented and the test runs where symlinks are available;
- `rho-server`: 26 passed;
- `rho-desktop`: 83 passed;
- Rust formatting, JavaScript syntax, environment-lockfile UI, Agent-first UI,
  Console/Logs UI, and `git diff --check`: passed.

Browser/mock review covered default direct/transitive/unclassified rows,
repository/GitHub/unknown source labels, source search, missing and invalid
DESCRIPTION truth, long wrapped metadata, and `800 x 900` layout without
document overflow or control overlap.

`rho.bridge` advances to `0.1.4`; application metadata remains
`0.4.0-dev.0`. The checklist is reconciled to 17 open / 32 completed.
Installed-app/manual acceptance remains open, so this contract remains active
and no release-readiness claim is made.

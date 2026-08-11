# Rust MSRV And Dual-Toolchain Build Contract

Status: active implementation contract; Issue #28 authorized `MSRV-1` on
2026-08-10; source implementation and local macOS acceptance complete; hosted
matrix acceptance pending

Date: 2026-08-10
Issue: https://github.com/YuLab-SMU/Rho/issues/28
Change class: D3 shared build and toolchain policy
Risk: R3 cross-platform build and release-validation foundation
Authorized work package: `MSRV-1`
Next mandatory stop: review the complete source diff and all four hosted Rust
compatibility matrix outcomes before merge

## Problem And Reproduction

Rho pins a default development compiler in `rust-toolchain.toml`, but the
workspace does not declare a Minimum Supported Rust Version (MSRV). The virtual
workspace uses Cargo resolver 2, all nine workspace packages omit
`package.rust-version`, and current release validation exercises only its
selected current toolchain.

This leaves three independent failure paths:

1. a lockfile refresh can select a dependency whose declared MSRV is newer than
   Rho's intended floor while current-stable validation remains green;
2. a dependency without accurate MSRV metadata can compile on current Rust but
   use language or standard-library behavior unavailable at the floor;
3. a CI step that merely changes the rustup default can still run the repository
   toolchain because `rust-toolchain.toml` has higher selection priority.

The current locked graph has a declared dependency floor of Rust 1.88. During
pre-implementation feasibility work on the existing local development branch,
explicitly selecting rustc 1.88.0 on macOS arm64 passed both:

- `cargo check --workspace --all-targets --locked`;
- `cargo test --workspace --locked --no-fail-fast` with 361 passed, zero
  failed, and one opt-in Keychain test ignored.

Windows GNU Rust 1.88 remains unaccepted until the hosted native matrix leg
passes.

## Goals

- Declare Rust 1.88 as one workspace-owned minimum compiler contract.
- Make every Rho workspace package inherit and publish that contract.
- Make dependency resolution prefer versions compatible with the declared
  floor.
- Continuously exercise current stable and the exact 1.88.0 compiler on the two
  supported native Rust targets.
- Prevent the repository toolchain override from silently invalidating a CI
  matrix leg.
- Keep the committed lockfile authoritative during compatibility and candidate
  Rust validation.
- Detect omitted member inheritance, resolver regression, matrix loss, unlocked
  validation, and toolchain-selection regression deterministically.

## Non-Goals

- Do not change `rust-toolchain.toml` or redefine the recommended development
  and release compiler.
- Do not build, sign, notarize, install, upload, publish, or update an installer
  in the compatibility workflow.
- Do not change Rust dependencies or introduce lockfile churn.
- Do not change application behavior, public protocol, persistence, project
  identity, credentials, execution, R packages, Ark, or Tauri CLI versions.
- Do not claim an application candidate, installed-app acceptance, or release
  decision from compatibility evidence.
- Do not run formatting with the MSRV compiler; formatting remains a current
  stable contract.

## Authority And Compatibility Boundaries

This document owns only:

- workspace Rust MSRV metadata;
- Cargo resolver selection for MSRV-aware dependency fallback;
- the non-packaging Rust compatibility workflow;
- locked Rust validation in the candidate source-validation steps;
- deterministic checks for those contracts.

`rust-toolchain.toml` remains the default interactive development-toolchain
authority. `Cargo.lock` remains the exact dependency-version authority. The
Windows build-environment document retains Rtools and GNU linker authority.
The macOS arm64 specification retains native runner, packaging, signing, and
notarization authority. Candidate checklists retain exact artifact and release
GO/NO-GO authority.

Cargo resolver 3 changes incompatible-Rust-version handling from `allow` to
`fallback`. It does not prove compatibility for dependencies with missing or
incorrect metadata, so the exact Rust 1.88 execution leg remains mandatory.

## Manifest Contract

The virtual root workspace must set:

```toml
[workspace]
resolver = "3"

[workspace.package]
rust-version = "1.88"
```

Every workspace member must set:

```toml
rust-version.workspace = true
```

Cargo metadata is the verification authority for effective member values. A
root declaration without member inheritance is a failure.

## CI Contract

The dedicated compatibility workflow runs for pull requests targeting `main`
and pushes to `main`. It has read-only repository permission, no credentials,
no release environment, and no write authority.

Its required matrix contains exactly these compatibility identities:

| Runner | Matrix version | Explicit rustup toolchain |
| --- | --- | --- |
| `macos-26` | `stable` | `stable-aarch64-apple-darwin` |
| `macos-26` | `1.88.0` | `1.88.0-aarch64-apple-darwin` |
| `windows-latest` | `stable` | `stable-x86_64-pc-windows-gnu` |
| `windows-latest` | `1.88.0` | `1.88.0-x86_64-pc-windows-gnu` |

Every leg must:

1. install the exact named toolchain;
2. select it through `RUSTUP_TOOLCHAIN`, which outranks the repository file;
3. verify the active host and, for the MSRV legs, exact rustc version 1.88.0;
4. run the deterministic MSRV repository contract;
5. run `cargo check --workspace --all-targets --locked`;
6. run `cargo test --workspace --locked --no-fail-fast`.

Windows legs prepend the documented Rtools45 GNU directory before any Cargo
command. Stable legs also install rustfmt and run `cargo fmt --all -- --check`.
macOS legs stage the existing checksum-pinned Ark sidecar because Tauri's macOS
build configuration requires that ignored resource at compile time; this is
build input preparation, not an Ark runtime or smoke-test acceptance claim.
The matrix uses `fail-fast: false` and no allowed-failure leg, so one platform
failure remains visible without cancelling the other evidence.

The compatibility workflow may use path filters to avoid running for changes
that cannot affect Rust source, manifests, lock state, the toolchain contract,
or the workflow itself. It must run when any workspace manifest, `Cargo.lock`,
`rust-toolchain.toml`, Rust source tree, or its own contract test changes.

## Candidate Validation Contract

The existing Windows and macOS candidate source-validation steps must execute
workspace Rust tests with `--locked`. The macOS setup step must also export its
installed stable toolchain through `RUSTUP_TOOLCHAIN`; changing the rustup
default is insufficient because the repository file has higher priority. These
changes tighten dependency and toolchain determinism but do not duplicate the
compatibility matrix or change installer construction.

The compatibility workflow is not candidate evidence. A passing matrix cannot
authorize draft assembly, MAC5, publication, update-site mutation, or release.

## Failure And Recovery Semantics

- Missing or mismatched member MSRV metadata fails before workspace compile.
- Resolver 2 or another resolver value fails the deterministic contract.
- Missing stable/MSRV or native-platform matrix identities fail the contract.
- A toolchain that is installed but not explicitly selected fails active
  toolchain verification.
- An unlocked compatibility or candidate workspace-test command fails the
  contract.
- Dependency or source incompatibility fails the affected native matrix leg;
  it is repaired by pinning/selecting compatible dependencies or intentionally
  advancing this contract in a separately reviewed change, never by
  `--ignore-rust-version`.
- CI cancellation or infrastructure failure is not compatibility acceptance;
  rerun the exact commit after infrastructure recovery.

No persistent application state, credential, user file, or release object is
mutated, so runtime rollback and migration do not apply. A source rollback is a
normal commit revert that restores the previous build contract.

## Automated Verification

Focused deterministic checks must cover:

- valid resolver, member metadata, native matrix, explicit selection, and
  locked commands;
- a missing member MSRV;
- a mismatched member MSRV;
- resolver regression;
- missing matrix identity;
- missing explicit rustup selection;
- missing `--locked` from compatibility or candidate validation.

Affected verification is:

```text
node scripts/test-rust-msrv-contract.mjs --test
node scripts/test-rust-msrv-contract.mjs
node scripts/test-mac4-release-contract.mjs
cargo +1.88.0-aarch64-apple-darwin check --workspace --all-targets --locked
cargo +1.88.0-aarch64-apple-darwin test --workspace --locked --no-fail-fast
cargo +1.97.0-aarch64-apple-darwin fmt --all -- --check
cargo +1.97.0-aarch64-apple-darwin check --workspace --all-targets --locked
cargo +1.97.0-aarch64-apple-darwin test --workspace --locked --no-fail-fast
git diff --check
```

Hosted acceptance additionally requires all four matrix identities on the PR
commit. Local macOS evidence does not substitute for hosted Windows GNU
evidence.

## Implementation And Local Evidence

The reviewed `MSRV-1` source slice now:

- declares Resolver 3 and workspace Rust 1.88 metadata inherited by all nine
  members;
- adds a read-only four-leg native compatibility workflow with explicit
  `RUSTUP_TOOLCHAIN` selection, Rtools45 GNU setup, stable-only formatting,
  checksum-pinned macOS Ark staging, and locked check/test commands;
- makes both candidate workspace-test commands locked and makes the candidate
  macOS stable selection explicit;
- adds positive and failure-injection contract tests for manifest, matrix,
  selection, and lockfile invariants; and
- leaves `Cargo.lock`, application version metadata, `NEWS.md`, packaging,
  credentials, and release authority unchanged.

Local verification on the clean upstream `main` worktree passed:

```text
node --check scripts/test-rust-msrv-contract.mjs
node scripts/test-rust-msrv-contract.mjs --test
node scripts/test-rust-msrv-contract.mjs
node scripts/test-mac4-release-contract.mjs
cargo +1.88.0-aarch64-apple-darwin check --workspace --all-targets --locked
cargo +1.88.0-aarch64-apple-darwin test --workspace --locked --no-fail-fast
  355 passed; 0 failed; 1 opt-in Keychain test ignored
cargo +1.97.0-aarch64-apple-darwin fmt --all -- --check
cargo +1.97.0-aarch64-apple-darwin check --workspace --all-targets --locked
cargo +1.97.0-aarch64-apple-darwin test --workspace --locked --no-fail-fast
  355 passed; 0 failed; 1 opt-in Keychain test ignored
Ruby Psych parse of every checked-in GitHub Actions workflow
Actionlint 1.7.7, excluding only its stale unknown-label diagnostic for
  the already-supported macos-26 runner
git diff --check
```

The macOS all-target check requires the ignored Ark sidecar named by Tauri's
bundle configuration. It was staged locally through
`scripts/bootstrap-ark-macos.sh`; the workflow performs the same
checksum-pinned preparation. No generated runtime file is committed.

The four hosted matrix outcomes remain the mandatory integration gate. Until
they pass on the exact pull-request commit, Windows GNU compatibility and the
overall definition of done remain pending.

## Work Package And Stop Point

`MSRV-1` is the only authorized package. It includes the manifest declaration,
resolver transition, compatibility workflow, locked candidate validation,
deterministic tests, and documentation reconciliation as one bisectable build
contract.

Stop after pushing the reviewed implementation and collecting the four hosted
matrix outcomes. Any dependency pin, target change, runner change, packaging
change, or MSRV advance is outside this package and requires contract review.

## Version, NEWS, And Release Impact

No application or R package version bump is required because the package does
not change shipped runtime behavior or an R package contract. `NEWS.md` is not
changed because this is internal build compatibility enforcement.

No existing candidate or release evidence is amended or reused. A future
candidate consumes the stricter locked source validation only after this change
is merged.

## Definition Of Done

- Issue #28 and the implementation refer to each other.
- All workspace packages report Rust 1.88 through Cargo metadata.
- Resolver 3 is active and `Cargo.lock` has no unrelated churn.
- The four native compatibility identities are present and explicitly selected.
- Deterministic positive and negative contract tests pass.
- Local macOS 1.88 and current development-toolchain checks/tests pass.
- Hosted macOS stable/MSRV and Windows GNU stable/MSRV jobs pass for the exact PR
  commit.
- Post-verification review finds no release-authority, credential, dependency,
  or unrelated-worktree expansion.
- Documentation records exact evidence and remaining integration state without
  claiming candidate or release readiness.

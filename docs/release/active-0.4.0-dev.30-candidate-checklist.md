# Rho 0.4.0-dev.30 Cross-Platform Candidate Checklist

Status: active source-candidate contract; Issue #33 interaction repair
implemented and reviewed; exact identity synchronization, dependency
integration, refreshed local source validation, branch publication, Draft PR
#34, and Issue reply complete; final hosted source matrix, upstream integration,
artifacts, installed acceptance, MAC5, and publication open

Date: 2026-08-11
Last updated: 2026-08-11

Change class: D3 workbench-wide interaction-policy correction plus the required
D4 single-use development identity

Risk: R3 for keyboard/pointer focus and accidental source-mutation safety; R4
for hosted candidate, signing/notarization, Release, update site, or publication

Owning documents: the active Workbench Focus And Refresh Stability Repair
specification owns Issue #33 behavior and source acceptance. The active Issue #2
Windows Agent specification retains launcher and fresh Agent-readiness
authority. The macOS arm64 specification owns packaging and trust gates. This
checklist alone owns the exact `0.4.0-dev.30` identity and any future candidate,
installed, MAC5, or publication evidence.

Authorization: the project owner's 2026-08-11 instructions authorize the
reviewed interaction repair, synchronized `dev.30` metadata and `NEWS.md`,
scoped commits, branch refresh, exact verification, and source integration once
its final hosted source gate passes. They do not authorize candidate
construction, installation, public publication, update-site mutation, or Issue
closure.

PR #24 established `0.4.0-dev.29` on `main` at merge `f05315c`, and PR #29
established the Rust 1.88/Resolver 3 build contract at merge `9e0b36b`. The
`dev.30` branch is refreshed through that exact main identity. No `dev.29`
artifact or acceptance evidence is relabelled or composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.30` | workspace, Tauri, npm, frontend cache, workflow defaults, tests, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.13` | unchanged; no exported R package contract changed |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.30` / `Rho 0.4.0-dev.30` | reserved defaults only; no tag or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Dependency | upstream `main` `9e0b36b` | PR #24 `dev.29` and PR #29 MSRV integrations included |
| Authoritative source commit | reviewed upstream default-branch SHA | Draft PR #34 refreshed; final hosted source matrix and integration pending |
| Windows/macOS artifacts | exact `dev.30` candidate only | not built |
| Release decision | source local `PASS`; merge pending hosted gate; release `NO-GO` | dependency and refreshed local verification complete; hosted source matrix, integration, artifacts, installed acceptance, MAC5, and publication open |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Included Behavior

- unchanged Agent, Task Rail, Runs, Problems, Plot/Output, Environment/Data
  Viewer, Project files/tabs, and Git projections no longer destructively
  rebuild during polling;
- required refreshes preserve same-surface focus, activation, selection, and
  reading position, with Environment rows using native button semantics;
- automatic Agent file application, external reload, project refresh, and
  deferred session restoration cannot redirect Agent-input keystrokes into the
  editor;
- file, selection, and line execution cannot steal focus for Console, while a
  Console-origin request restores focus only if no newer interaction exists;
- Console, Logs, and Agent activity follow new output only while the user is
  already pinned to the end; and
- PR #24's Windows script-file transport and fresh aisdk-readiness behavior are
  carried as an explicit dependency, not re-owned by Issue #33.

No schema, broker command, approval, credential, filesystem authority,
execution payload, R package contract, project identity, or poll cadence
changes in the Issue #33 slice.

## Source Verification Gate

Required evidence is JavaScript syntax, the deterministic Issue #33 regression,
all compatible frontend/release contracts, exact version/release metadata
checks, complete Rust workspace formatting/check/tests, both R package suites,
and `git diff --check`. Browser/mock interaction and exact installed Windows
reproduction remain separate gates and cannot be inferred from automation.

Source verification completed against the synchronized `dev.30` tree
on 2026-08-11:

- `node --check desktop/dist/app.js`: PASS;
- all 54 `scripts/test-*.mjs` contracts, including all 46 UI contracts, the
  Rust MSRV contract, and the
  deterministic Issue #33 focus/activation/scroll/background-edit regression:
  PASS;
- `cargo fmt --all -- --check`: PASS;
- `cargo check --workspace --all-targets --locked`: PASS;
- `cargo test --workspace --locked --no-fail-fast`: 364 passed, 0 failed, 1 opt-in macOS Keychain test
  ignored;
- `rho.bridge`: 97 test blocks / 568 expectations passed, with 0 failures,
  errors, warnings, or skips;
- `rho.agent`: 24 test blocks / 120 expectations passed, with 0 failures,
  errors, warnings, or skips; and
- `git diff --check`: PASS.

The isolated worktree reused the exact ignored Ark arm64 sidecar and runtime
license resources from the owner's existing checkout solely to satisfy the
Tauri build-resource contract; these files are ignored and are not part of the
commit. Browser/mock interaction was attempted earlier, but no connected
browser was exposed. No browser or installed-application result is claimed.

## Integration Handoff And Remaining Gates

The exact reviewed branch is published as Draft PR #34, refreshed through
upstream `main` `9e0b36b`, and the truthful source-verification status remains
recorded on Issue #33. Source integration requires the four hosted Rust
compatibility identities on the exact pushed head. Exact `dev.30` candidate
construction, Windows/macOS installed acceptance, browser interaction, MAC5,
publication, and update-site evidence remain independent facts and Issue #33
remains open.

Current decision: `GO` for source merge only after the final hosted matrix;
`NO-GO` for packaging or publication.

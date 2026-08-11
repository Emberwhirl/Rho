# Rho 0.4.0-dev.30 Cross-Platform Candidate Checklist

Status: active stacked source-candidate contract; Issue #33 interaction repair
implemented and reviewed; exact identity synchronization and stacked source
validation complete; branch publication, upstream integration, artifacts,
installed acceptance, MAC5, and publication open

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

Authorization: the project owner's 2026-08-11 instruction to reply to Issue
#33, push the repair, and upgrade authorizes the reviewed interaction repair,
stacking the exact open PR #24 head, synchronized `dev.30` metadata and
`NEWS.md`, scoped commits, branch push, draft PR, and Issue status reply. It does
not authorize merging PR #24 or this branch, candidate construction,
installation, public publication, update-site mutation, or Issue closure.

PR #24 exact head `105e8b3c024051809c7ce1b8f44c32fdc8247436` reserves
`0.4.0-dev.29`. The `dev.30` branch includes that exact dependency reconciled
with current upstream `main`; its PR must not merge until PR #24 establishes
`dev.29` on `main`. No `dev.29` artifact or acceptance evidence is relabelled or
composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.30` | workspace, Tauri, npm, frontend cache, workflow defaults, tests, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.13` | unchanged; no exported R package contract changed |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.30` / `Rho 0.4.0-dev.30` | reserved defaults only; no tag or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Dependency | PR #24 head `105e8b3c` | stacked; upstream integration pending |
| Authoritative source commit | reviewed upstream default-branch SHA | pending dependent PR integration |
| Windows/macOS artifacts | exact `dev.30` candidate only | not built |
| Release decision | source `PASS`; merge/release `NO-GO` | source verification complete; dependency, integration, artifacts, installed acceptance, MAC5, and publication open |

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

Source verification completed against the synchronized stacked `dev.30` tree
on 2026-08-11:

- `node --check desktop/dist/app.js`: PASS;
- all 53 `scripts/test-*.mjs` contracts, including all 46 UI contracts and the
  deterministic Issue #33 focus/activation/scroll/background-edit regression:
  PASS;
- `cargo fmt --all -- --check`: PASS;
- `cargo check --workspace`: PASS;
- `cargo test --workspace`: 364 passed, 0 failed, 1 opt-in macOS Keychain test
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

## Remaining Gates

Push the exact reviewed branch, create a draft PR that explicitly depends on
#24, and post the truthful source-verification status to Issue #33. PR #24 must
land before this PR can be integrated. Exact `dev.30` candidate construction,
Windows/macOS installed acceptance, browser interaction, MAC5, publication,
and update-site evidence remain independent facts.

Current decision: `NO-GO` for merge, packaging, or publication.

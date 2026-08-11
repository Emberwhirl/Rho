# Rho 0.4.0-dev.30 Cross-Platform Candidate Checklist

Status: historical rejected-candidate contract; Issue #33 interaction repair
implemented and reviewed; exact identity synchronization, dependency
integration, refreshed local source validation, exact hosted source matrix,
upstream source integration through PR #34, and Issue reply complete; one exact
default-branch candidate/Draft construction authorized and completed in run
`31515775702` on 2026-08-11; exact seven-asset Draft independently verified;
exact installed macOS interaction review completed with a blocking Data Viewer
failure; candidate rejected and publication prohibited

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
its final hosted source gate passes. The owner's later 2026-08-11 instruction
"发布今天的最新版本" activates `DEV30-CANDIDATE-1`: one protected `candidate`
dispatch against the exact current upstream default-branch commit, including
fresh Windows x64 and signed/notarized/stapled macOS arm64 artifacts and
immutable Draft assembly. This authorization does not convert automation into
browser or installed-app acceptance and does not permit an acceptance asset,
public publication, update-site mutation, or Issue closure before the exact
candidate passes those gates and the owner records explicit MAC5 GO.

Authorized work package: `DEV30-CANDIDATE-1`.

Next mandatory stop: preserve this immutable rejected Draft and implement the
separately authorized Data Viewer row-shape repair under a fresh application
identity. No acceptance upload, MAC5 decision, publish workflow, or update-site
mutation may use `dev.30`. Exact installed Windows and unsigned-Windows
disposition remain independently open.

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
| Release tag/name | `v0.4.0-dev.30` / `Rho 0.4.0-dev.30` | unpublished Draft Release `368736031`; no Git tag or public Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Dependency | upstream `main` `9e0b36b` | PR #24 `dev.29` and PR #29 MSRV integrations included |
| Authoritative source commit | `bcc8e1cba717f5210a9b1016bf20a7da1decdade` | exact upstream default-branch SHA selected and built by run `31515775702` |
| Windows/macOS artifacts | exact `dev.30` candidate only | both platform records and aggregate evidence passed in run `31515775702` |
| Release decision | exact candidate/Draft construction `PASS`; installed macOS `FAIL`; candidate `REJECTED`; release `NO-GO` | Data Viewer cannot render a valid page; Windows installed/signing and publication gates also remain open |

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
commit. Browser/mock interaction was retried through the required browser
workflow after candidate authorization, but the environment again exposed zero
connected browser instances. No browser or installed-application result is
claimed.

## Exact Candidate Gate

Protected candidate run
[`31515775702`](https://github.com/YuLab-SMU/Rho/actions/runs/31515775702)
passed against authoritative upstream commit
`bcc8e1cba717f5210a9b1016bf20a7da1decdade`. It completed Windows validation,
installer construction and Workspace smoke; macOS Developer ID signing,
entitlement and arm64 checks, exact-DMG notarization/log binding, credential
cleanup, staple, Gatekeeper, mounted-DMG Workspace smoke; and aggregate Draft
assembly. It created unpublished Draft prerelease `368736031` with
`draft=true`, `prerelease=true`, `published_at=null`, and no Git tag.

Independent API review required exactly seven non-empty assets and matched each
GitHub SHA-256 digest to the aggregate evidence and both checksum sidecars:

| Record | Size | SHA-256 |
| --- | ---: | --- |
| aggregate candidate evidence | 1,477 bytes | `b5bb9fe3141279f1cda53cf0d199870d49cf2f0eda167600a9f8a3b39f15cbdc` |
| macOS arm64 DMG | 21,141,926 bytes | `9ffafb568c78f05bfd04a0c0821dddea62c8be326bbbb359eb8932cf35a8e942` |
| macOS checksum file | 95 bytes | `3b05ef5595044d2781058c66e085d33c9c6383f0993b41862d9bdf6bb5a5de5e` |
| macOS platform evidence | 1,358 bytes | `3c9c59546b8653e1b2ed884841257a9c42234bfa657aea2a08d63db7e2dc1bc7` |
| Windows x86_64 installer | 18,288,171 bytes | `d2532c83d7f49f956afe5a7a2af67570b43ef55cf4ff657e823832daa105db2d` |
| Windows checksum file | 97 bytes | `e1e3d7d4cc2bfd27d9905015aeae6ed4138f2fbf8e59e93690deff1d5aa7b3d5` |
| Windows platform evidence | 904 bytes | `0d6b3a978de527cdc026c7e89ab5a6a51b9102afd5d4a74eb6fd05dfe54c92da` |

The macOS evidence contains explicit `codesign`, `entitlements`,
`notarization`, `notary_binding`, `staple`, and `gatekeeper` passes. The
Windows evidence contains build/test/Workspace-smoke checks but no
Authenticode, publisher, timestamp, or installed-payload-signature result. No
Windows signing claim is made; Issue #26 remains an explicit public-release
gate unless its D4/R4 implementation passes or an owner-approved, documented
governance exception defines compensating evidence.

## Exact Installed macOS Acceptance

The downloaded arm64 DMG independently matched
`9ffafb568c78f05bfd04a0c0821dddea62c8be326bbbb359eb8932cf35a8e942` and
installed `/Applications/Rho.app` with both application version and build
`0.4.0-dev.30`. After a clean application shutdown, strict deep `codesign`
verification passed and Gatekeeper reported `accepted`,
`source=Notarized Developer ID`, and Developer ID Application
`Yonghe Xia (GAAY6Z9874)`. The mounted DMG app and installed app were byte-for-
byte identical. Workspace R 4.5.2 started in about 1.7 seconds and restored the
acceptance project.

Computer Use against the exact installed app passed the Issue #33 interaction
exercises that were available on macOS:

- Agent composer focus and text survived more than two polling cycles;
- focused Agent activity retained keyboard activation, and mouse activation
  succeeded while the turn remained Running;
- a second Conversation composer retained text and focus while a background
  Agent proposal arrived;
- file execution completed without reclaiming focus from the Agent composer;
- Console output did not drag a user reading older content to the new tail;
- Environment rows retained native keyboard focus/Return activation; and
- selected Plot state survived repeated refresh cycles.

The review rejected the candidate on the Environment Data Viewer workflow. A
new two-column, 120-row data frame appeared automatically in Environment, but
selecting it, globally refreshing Environment, forcing reinspection, and
reselecting it all produced `The source changed; refresh this object before
continuing` and `No data loaded yet`. The same live Workspace R returned
`VIEW_OK=TRUE ERROR= ROWS=50` from direct bridge inspection/read calls, while
the durable `workspace.inspect_data_object` and `workspace.read_data_view`
runs completed at matching revisions without backend error.

Review traced this to named R lists crossing JSON as objects while the frontend
requires ordered `cells` and `cell_states` arrays. The frontend render exception
is then incorrectly classified as `stale_view_revision`. The active Data Viewer
row-shape repair specification owns the replacement source work. Both file
proposals used during focus testing were rejected, session mutation authority
was disabled, the second-conversation draft was cleared, and the ignored
scratch file was removed; no project file was changed by acceptance.

## Integration Handoff And Remaining Gates

The exact reviewed PR #34 head
`83e2719d56941a4607af2d5e494c55466e78490f`, refreshed through upstream `main`
`9e0b36b`, passed the four hosted Rust compatibility identities in run
`31511253088` and merged as authoritative upstream source
`1b3f522a48bced21bda52769aefd836ac4494334`. Exact `dev.30` candidate
construction and Draft verification are complete at `bcc8e1c`; installed
macOS acceptance is complete with `FAIL`, so this identity is rejected and
cannot advance to MAC5, publication, or update-site mutation. Browser/mock,
exact installed Windows, and Windows signing disposition remain independent
open facts, and Issue #33 remains open despite its passing macOS focus checks.

Current decision: source integration and exact candidate/Draft construction
`COMPLETE`; exact installed macOS acceptance `FAIL`; candidate `REJECTED` and
release `NO-GO`. A repaired distributable must use a fresh version and complete
all candidate, browser/mock, installed Windows/macOS, signing, candidate-bound
evidence, MAC5, publication, and updater gates independently.

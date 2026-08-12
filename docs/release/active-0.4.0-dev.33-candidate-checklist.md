# Rho 0.4.0-dev.33 Cross-Platform Candidate Checklist

Status: active replacement source contract; deterministic Provider-discovery
repair, file-lane test repair, and AGPL LIC-1 are protected-integrated; LIC-2
installed-license surface implementation, complete local validation, local
macOS bundle inspection, and UI review pass; LIC-2 exact-head hosted CI and
integration, exact candidate, installed acceptance, Windows signing
disposition, MAC5, publication, and updater evidence remain open

Date: 2026-08-11
Last updated: 2026-08-12

Change class: D1 correction of a nondeterministic test fixture plus the
required D4 single-use replacement development identity

Risk: R1 for test-only timeout-fixture behavior; R4 for hosted candidate,
signing/notarization, Release, update site, or publication action

Owning documents: CRED-UX3 owns the production Provider-discovery timeout,
bounds, redaction, and error classes. CRED-UX3-R1 owns only deterministic
verification of that existing behavior. WS2-R1-R1 and RENAME-RECOVERY-R1 retain
the installed editor-envelope correction carried forward from rejected
`dev.32`. The macOS arm64 specification owns packaging and trust gates. This
checklist alone owns the exact `0.4.0-dev.33` source identity and any future
candidate, installed, MAC5, publication, or updater evidence.

Authorization: after reviewing candidate run `31552396659`, its exact failure,
and the focused repair plan, the project owner explicitly instructed
`修复并推送` on 2026-08-11. This authorizes the bounded test-fixture repair,
synchronized replacement identity, complete affected validation, scoped
commit, upstream branch push, and Draft PR. It does not waive protected merge,
candidate, installed, Windows-signing, MAC5, publication, or updater gates.

After subsequently directing the next version to be merged and published, the
project owner instructed the agent to complete all remaining required work on
2026-08-12. That activates the bounded AGPL LIC-2 prerequisite: fixed
cross-platform license resources, About legal notice/reveal action, deterministic
contracts, and fail-closed macOS candidate resource verification. It authorizes
source implementation, validation, review, a scoped PR, and protected merge.
It does not authorize candidate construction before all source and Windows-
signing gates pass, and it does not waive installed, MAC5, publication, or
updater acceptance.

`0.4.0-dev.32` is immutable and rejected. Its Windows artifact, source checks,
and failed macOS candidate result cannot be relabelled or composed into this
identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.33` | Cargo/lock, Tauri, npm/lock, frontend mock/cache, workflow defaults, release-contract tests, roadmap, checklist, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.14` | unchanged; no exported R package contract changes |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract changes |
| Store schema | `12` | unchanged; no persistence schema changes |
| Release tag/name | `v0.4.0-dev.33` / `Rho 0.4.0-dev.33` | reserved replacement identity only; no tag, artifact, or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Candidate source | future exact upstream default-branch commit after LIC-2 integration | upstream `main` `f37276940499d80b4898f630d3c683e13a554a3f` contains the integrated source repairs and AGPL LIC-1; LIC-2 remains a reviewed local source change; no candidate exists |
| Windows/macOS artifacts | exact `dev.33` candidate only | not built |
| Release decision | source repair authorized; release `NO-GO` | every downstream artifact and acceptance gate remains open |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Repair Contract

- Production `reqwest` client construction, 15-second total timeout, one-
  request limit, no-redirect/no-retry policy, 1 MiB response bound, credential
  handling, redaction, and `timeout` error projection remain byte-for-byte
  unchanged.
- The regression server used for timeout verification must accept and record
  the request but never write a status line, headers, or body. A successful or
  empty discovery response is therefore not a competing test outcome.
- The test client retains an explicit short total timeout. The server retains
  a longer bounded read watchdog so a broken timeout cannot hang CI forever;
  watchdog closure must not be misreported as a timeout pass.
- The regression continues to prove the serialized response omits the injected
  credential. Existing oversized-body and adjacent discovery tests remain
  unchanged.
- No application UI, settings schema, Provider endpoint, model/routing state,
  credential source, network authority, persistence, project, execution, or
  release policy changes.

## Local Implementation And Verification Evidence

The test-only implementation extracts the existing bounded request reader and
adds a stalled server that records the request, writes no HTTP response, and
waits for client closure under a five-second read watchdog. The client uses an
explicit 250 ms total timeout. The response must classify as `timeout`, omit
the injected credential, and prove the expected `/v1/models` request reached
the server. Existing success, redirect, credential, oversized-body, parser,
endpoint, and settings-preservation tests remain unchanged.

Local source evidence passes:

- the exact regression once with visible output and 50 additional independent
  Cargo-process repetitions without any retry-after-failure;
- `cargo fmt --all -- --check`, locked all-target workspace check, and locked
  full workspace tests (desktop 176 passed plus one opt-in Keychain test
  ignored by design; server 59; store 108; every other executed suite passed);
- `node --check desktop/dist/app.js` and all 56 deterministic frontend/release
  contract scripts;
- complete `rho.bridge` and `rho.agent` local test suites;
- candidate-release and update-site dry runs plus the macOS Ark bootstrap
  failure fixtures; and
- `git diff --check`.

The deliberate post-test review hashed all `agent_llm.rs` source before its
`#[cfg(test)]` boundary in both upstream `main` and the worktree. Both hashes
are
`6ddba16e8794f76e30d1ec80d5a6df3ea043c1750dc2d635eb677e3c52316ee6`,
proving production Provider-discovery code is unchanged. Review also found no
new dependency, schema, credential, network, persistence, project, execution,
UI, or mutation authority and no blocking contract deviation.

## Required Source Evidence

1. **PASS** — the focused timeout regression passes 51 consecutive local
   executions, including 50 independent Cargo processes.
2. **PASS** — the full `rho-desktop` target and locked Rust workspace pass
   without rerun-until-green normalization.
3. **PASS** — Rust format/check, all deterministic frontend/release contracts,
   both R package suites, and `git diff --check` pass.
4. **PASS** — separate post-test review proves production discovery source is
   byte-identical and finds no blocking deviation.
5. **PASS** — PR #43 exact head passed macOS/Windows stable and Rust 1.88.0 in
   run `31557415624` and merged as `3a3546bd76cc11761263a5af8e060ba73a4a0580`;
   AGPL PR #30 exact head passed the same four identities in run `31558086732`
   and merged as `f37276940499d80b4898f630d3c683e13a554a3f`.
6. **OPEN** — LIC-2 must pass its exact pushed-head four-identity matrix and
   protected integration before candidate admission.

## Remaining Gates

1. **PASS** — implement, review, validate, and protected-integrate the bounded
   Provider and file-lane source repairs plus AGPL LIC-1.
2. Push LIC-2 as one scoped Draft PR and require its exact-head four-identity
   source matrix and protected integration without bypass.
3. After LIC-2 integration and Windows-signing disposition, run one protected
   candidate workflow against the exact current upstream default-branch commit and
   independently verify Draft assets, hashes, identities, macOS trust evidence,
   and Draft-only state.
4. Perform exact installed `dev.33` References/Rename/editor-intelligence,
   Data Viewer, Issue #33, live-Provider repair, proposal Accept/verified Undo,
   startup, update, upgrade, uninstall, and Windows acceptance in proportion to
   the carried release risk.
5. Resolve Issue #26's Windows signing disposition without treating an
   unsigned installer as a public-release pass.
6. Prove the exact root `LICENSE` and `LICENSES.md` are bundled under the fixed
   Rho resource path, the About action reveals the installed license offline,
   and the installed bytes match the candidate source on both platforms.
7. Reconcile candidate evidence, then stop for explicit MAC5 GO. Publication
   and updater mutation remain separate actions.

## Current Decision

The original source repair, version synchronization, complete validation,
hosted matrices, AGPL LIC-1, and protected integration pass. LIC-2 local source,
bundle-byte, Workspace smoke, and UI review pass. Current decision remains
`NO-GO` for candidate construction until LIC-2 exact-head hosted CI/protected
integration and Issue #26's Windows-signing disposition pass. Exact candidate,
installed acceptance, acceptance upload, MAC5, public publication, and update-
site mutation remain open.

# Rho 0.4.0-dev.32 Rejected Cross-Platform Candidate Record

Status: historical rejected candidate; immutable evidence only

Date: 2026-08-11
Last updated: 2026-08-11

## Exact Attempt

| Field | Recorded value |
| --- | --- |
| Application version | `0.4.0-dev.32` |
| `rho.bridge` version | `0.1.14` |
| `rho.agent` version | `0.1.5` |
| Store schema | `12` |
| Authoritative source commit | `29faba2b4d08bbebb4d9e2e251e7e1d69d393d6f` |
| Source integration | PR #41; merge commit `29faba2b4d08bbebb4d9e2e251e7e1d69d393d6f` |
| Exact-head source matrix | run `31551676391`; macOS-26 and Windows stable/1.88.0 all passed |
| Candidate workflow run | `31552396659` |
| Workflow conclusion | `failure` |
| Release decision | `REJECTED / NO-GO` |

The installed Workspace response-envelope repair was reviewed, passed the
complete local source matrix, passed all four hosted stable/MSRV identities,
and entered upstream `main` without bypass. Candidate identity resolution then
accepted the exact current default-branch commit.

The Windows lane passed its complete candidate validation, built and smoked
`Rho_0.4.0-dev.32_x64-setup.exe`, and uploaded run artifact `9125093343`
(`rho-0.4.0-dev.32-windows-x86-64-31552396659`). The installer is 18,280,081
bytes with SHA-256
`0c2fbfb09a2f2e536a6b50800bacc1f87efe422e14a22c75b57eefcdc56c5ea3`.
The run-artifact archive is 18,267,294 bytes with upload digest
`c6c9b83380eb3304868e824969b8da4a39d487aa86677f0ca5b76308f5617c80`.

The macOS arm64 lane failed in `Run complete macOS candidate validation`
before Developer ID credential import, application/DMG construction, or Apple
notarization submission. The only failing Rust test was
`agent_llm::tests::discovery_bounds_oversized_responses_and_timeouts`: the
response had no error class while the fixture expected `timeout`. The fixture
gave a valid response after 150 ms while the client used a 40 ms timeout, so a
saturated runner could deliver the valid response before the delayed timeout
task was observed. Product discovery retained its reviewed 15-second total
timeout and bounded error projection; the failure exposed a nondeterministic
test server, not evidence that product timeout policy changed.

Draft assembly and both notarization-dependent jobs were skipped. Read-only
API checks found no `v0.4.0-dev.32` tag and no Draft or public Release. The
update site was not mutated.

## Disposition

The Windows installer artifact consumes the single-use `dev.32` identity even
though no Draft Release was assembled. This record and its artifact are
historical and cannot satisfy or be relabelled for a later candidate,
installed acceptance, Windows-signing, MAC5, publication, or updater gate.

The authorized replacement is `0.4.0-dev.33`. Its bounded source repair makes
the timeout regression server incapable of returning a successful HTTP
response, retains a finite server-side watchdog, and verifies the same
credential-redacted `timeout` classification without changing production
network, timeout, credential, settings, or routing behavior.

# Rho 0.4.0-dev.39 Conditional Prerelease Checklist

Date: 2026-08-13

Status: active; CPREL1A source policy gate passed locally, CPREL1B protected
integration in progress, all candidate and publication evidence open

Owning contract:
`docs/plans/active-2026-08-13-conditional-prerelease-policy-spec.md`

Change class: D4

Risk: R4

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.39` | source metadata and locks synchronized; integration pending |
| Release tag/name | `v0.4.0-dev.39` / `Rho 0.4.0-dev.39` | candidate not built |
| Source repository | `YuLab-SMU/Rho` | candidate mode only |
| Source commit | exact protected-main 40-hex SHA | pending integration |
| `rho.bridge` | `0.1.14` | unchanged |
| `rho.agent` | `0.1.5` | unchanged |
| Store schema | `12` | unchanged |
| Windows package | x64 NSIS, SignPath Free Trial self-signed test certificate | pending |
| macOS package | Apple Silicon, Developer ID signed/notarized/stapled | pending |
| Release decision | `NO-GO` | conditional acceptance not yet bound |

`0.4.0-dev.38` remains an immutable unpublished candidate governed by its own
historical source/body/evidence. No `dev.38` binary, signing request, hash,
evidence, or acceptance record may satisfy this checklist.

## Source And Policy Gate

- [x] active CPREL1 contract and cross-review agree;
- [x] acceptance schema v2 permits only allowlisted, actor-bound, exact-risk
  `CONDITIONAL_GO` while schema-v1 ordinary `GO` remains compatible;
- [x] malformed, stale, foreign-actor/version, incomplete, reordered, and
  over-broad conditional records fail closed;
- [x] Release notes and update-site presentation disclose both unrun human
  checks and evaluation-only scope;
- [x] update-site admission validates the acceptance asset and binding;
- [x] application version metadata, locks, cache identity, workflow defaults,
  `NEWS.md`, release notes, and this checklist agree; and
- [ ] complete affected local and hosted source matrices pass.

## Candidate Construction And Audit

- [ ] exact protected-main source matrix passes on macOS/Windows with stable
  and Rust `1.88.0`;
- [ ] one candidate workflow builds both platforms once from that exact commit;
- [ ] Windows build/smoke, unsigned-input proof, pinned SignPath submission,
  returned signature/request/hash proof, and final evidence pass;
- [ ] macOS Developer ID, arm64, entitlements, notarization binding, stapling,
  Gatekeeper CI, Workspace smoke, and license boundary pass;
- [ ] aggregate evidence binds exact final platform artifacts and evidence;
- [ ] complete hosted-log privacy scan passes;
- [ ] one unpublished Draft contains exactly seven candidate assets and the
  reviewed conditional Release body; and
- [ ] no public tag, Release, or update-site mutation occurs before acceptance.

## Conditional Human Limitations

These rows are deliberately limitations, not passed checks:

- [ ] Windows clean-profile human installation, warning/publisher presentation,
  representative workflow, recovery, update check, and uninstall — `NOT RUN`,
  reason `no_windows_device`;
- [ ] enabled-Gatekeeper human macOS launch — `NOT RUN`, reason
  `gatekeeper_assessments_disabled`;
- [ ] any available automated installed macOS support evidence is recorded
  separately without changing either row above; and
- [ ] public Release notes and download page visibly identify both limitations
  and evaluation-only scope.

## Conditional Decision And Publication

- [ ] exact downloaded candidate-evidence SHA-256 is recorded;
- [ ] schema-v2 acceptance uses `status: conditional` and
  `decision: CONDITIONAL_GO`;
- [ ] `candidate-release.mjs --mode conditional-acceptance` generates the
  acceptance from the independently downloaded aggregate evidence without
  manual hash or platform transcription;
- [ ] authorization actor equals the publish workflow actor, timestamp is
  canonical UTC, scope is `public_prerelease_only`, and the exact two risks and
  limitations are present in canonical order;
- [ ] acceptance asset is uploaded once without replacing candidate assets;
- [ ] protected publish workflow validates exact body/assets/evidence/decision
  and performs one Draft-to-public transition without rebuilding;
- [ ] public tag, commit, body, eight assets, sizes, and hashes match;
- [ ] update-site deployment validates the acceptance asset and shows the
  conditional warning; and
- [ ] live development manifest points to exact `dev.39` artifacts and hashes.

## Current Evidence Ledger

| Gate | Result | Evidence |
| --- | --- | --- |
| Owner authorization | PASS | explicit 2026-08-13 authorization for public conditional prerelease |
| Contract/cross-review | PASS | active ownership, schema, policy, sequencing, and immutable `dev.38` boundary agree |
| Source implementation | PASS | schema v2, actor binding, deterministic generator, disclosure, update admission, and version synchronization reviewed locally |
| Exact source matrix | LOCAL PASS | hosted PR and merged-main matrices pending |
| Candidate and independent audit | OPEN | pending |
| Conditional acceptance | OPEN | pending exact candidate |
| Publication/update site | `NO-GO` | no exact conditional decision yet |

## Current Decision

`PASS` for CPREL1A and `GO` for CPREL1B protected integration. `NO-GO` for
candidate construction until source integration and exact merged-main checks,
and `NO-GO` for publication until exact candidate audit plus schema-v2
`CONDITIONAL_GO`.

## CPREL1A Local Verification — 2026-08-13

- all 66 fail-fast `scripts/test-*.mjs` contracts: PASS;
- `candidate-release.mjs --test true`, conditional-policy, release-notes,
  SignPath, update-site, syntax, workflow YAML, and `git diff --check`: PASS;
- published `v0.4.0-dev.24` aggregate and acceptance assets downloaded and
  validated through the new schema-v1 compatibility path: PASS;
- `cargo fmt --all -- --check` and
  `cargo test --workspace --locked --no-fail-fast`: PASS (177 desktop tests
  passed; one existing opt-in Keychain smoke remained ignored);
- `cargo +1.88.0-aarch64-apple-darwin check --workspace --all-targets --locked`:
  PASS; and
- complete `rho.bridge` and `rho.agent` `testthat::test_local` suites: PASS.

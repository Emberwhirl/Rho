# Rho 0.4.0-dev.38 Test-Signed Prerelease Checklist

Date: 2026-08-13

Status: active; DEV38-SIGN1 source implementation authorized; exact protected-
main source, candidate Draft, installed acceptance, MAC5, publication, and live
update evidence remain open

Owning contract:
`docs/plans/active-2026-08-13-dev38-test-signed-prerelease-spec.md`

Change class: D4

Risk: R4

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.38` | synchronization pending implementation |
| Release tag/name | `v0.4.0-dev.38` / `Rho 0.4.0-dev.38` | single-use identity; no tag or Release exists yet |
| Source repository | `YuLab-SMU/Rho` | candidate mode admits only exact current protected `main` |
| Source commit | exact 40-hex protected-main SHA | open until source PR integration |
| `rho.bridge` | `0.1.14` | unchanged; no R package contract change |
| `rho.agent` | `0.1.5` | unchanged; no R package contract change |
| Store schema | `12` | unchanged; no persistence migration |
| Windows package | x64 NSIS, SignPath Free Trial self-signed test certificate | source implementation and exact request open |
| macOS package | Apple Silicon, Developer ID signed/notarized/stapled | exact candidate open |
| Release decision | `NO-GO` | all exact-candidate and human gates remain open |

`0.4.0-dev.37` is consumed by Issue #33 and FT-SIGN1 evidence and is immutable.
No `dev.37` artifact, request, hash, installed result, or source commit may be
reused in this checklist.

## Candidate Construction Gate

- [ ] version, Cargo/npm locks, Tauri metadata, frontend cache/mock identity,
  candidate/publish defaults, `NEWS.md`, release notes, and this checklist agree;
- [ ] protected-main source matrix passes on macOS/Windows with Rust stable and
  `1.88.0` at the exact source commit;
- [ ] the candidate workflow builds both platforms once from that exact commit;
- [ ] Windows complete source/R/Rust/frontend/smoke validation passes before
  signing;
- [ ] the unsigned Windows installer is exactly named, `NotSigned`, and hashed;
- [ ] pinned SignPath module/configuration checks pass and one new request
  completes;
- [ ] the returned Windows installer has the expected thumbprint, self-signed
  subject/issuer, exact `UnknownError` trust status, changed bytes, and a final
  hash matching Windows platform evidence;
- [ ] Windows evidence contains valid `authenticode`,
  `signpath_request_binding`, and `free_trial_self_signed` checks without secret
  values;
- [ ] macOS Developer ID, exact arm64, entitlements, notarization request/log
  binding, stapling, Gatekeeper, Workspace smoke, and license boundary pass;
- [ ] aggregate evidence binds the final signed Windows installer and final
  stapled macOS DMG; and
- [ ] one immutable Draft contains exactly the expected seven candidate assets
  and the reviewed release body, with no acceptance asset yet.

## Independent Candidate Audit

- [ ] download all Draft assets and reproduce sizes/SHA-256 values;
- [ ] validate both platform evidence files and aggregate evidence from the
  exact candidate commit;
- [ ] independently confirm the SignPath request is `Completed` and its public
  certificate facts match evidence;
- [ ] scan the complete hosted logs for API token, protected JSON, organization
  identifier, unique slugs, and thumbprint leakage;
- [ ] confirm the Draft remains `draft=true`, `prerelease=true`, exact-tag,
  exact-commit, exact-body, and single-use; and
- [ ] confirm no update-site or public Release state changed.

## Human Installed Acceptance

Automation and screenshots may support these rows but cannot mark them passed
without a human observation bound to the exact downloaded hashes.

### Windows x64

- [ ] clean-profile install from the exact final signed installer;
- [ ] installer warning/publisher presentation recorded truthfully (a Free Trial
  self-signed test certificate may still warn);
- [ ] installed `rho-desktop.exe`, Ark, version, source commit, and platform
  identity match the candidate;
- [ ] launch, Workspace R readiness, project open/switch, editor/Console run,
  Environment refresh, Agent/model-settings path, failure/recovery, and manual
  update check are reviewed;
- [ ] installed payload and installer signature/hash evidence are recorded; and
- [ ] uninstall succeeds and expected executable/registration state is removed
  without claiming project/application-data deletion.

### macOS Apple Silicon

- [ ] install the exact downloaded DMG into `/Applications` on a clean/replaced
  app path;
- [ ] Gatekeeper launch succeeds without bypass; app/Ark signatures,
  notarization/staple, version, commit, and arm64 identity match;
- [ ] launch, Workspace R readiness, project open/switch, editor/Console run,
  Environment refresh, Agent/model-settings path, failure/recovery, and manual
  update check are reviewed; and
- [ ] app removal behavior and retained local-data guidance are reviewed.

### Cross-platform and release presentation

- [ ] release notes and generated download page describe the Windows signature
  as Free Trial/self-signed/test-only, not Foundation or publicly trusted;
- [ ] SmartScreen warning risk and SHA-256 verification are visible;
- [ ] both platform download URLs and hashes are correct; and
- [ ] no P0 workflow failure, credential exposure, false trust claim, or
  unrecoverable install/uninstall issue remains.

## MAC5 And Publication

- [ ] exact downloaded candidate evidence SHA-256 is recorded;
- [ ] all human rows above are bound to the same platform hashes;
- [ ] residual limitations are documented;
- [ ] an explicit `GO` is written to
  `rho-0.4.0-dev.38-acceptance.json` with the required exact schema;
- [ ] the acceptance asset is uploaded once without changing any existing
  candidate asset;
- [ ] the publish workflow validates exact body/assets/evidence/GO and performs
  one Draft-to-public state transition without rebuilding;
- [ ] public tag, commit, body, seven candidate assets plus one acceptance asset,
  sizes, and hashes match the accepted Draft;
- [ ] update-site deployment validates the public evidence and projects the
  exact development release; and
- [ ] live page and development manifest are independently fetched and checked.

## Current Evidence Ledger

| Gate | Result | Evidence |
| --- | --- | --- |
| Contract authorization/cross-review | PASS | active DEV38-SIGN1 contract dated 2026-08-13 |
| Source implementation | OPEN | not yet integrated |
| Exact source matrix | OPEN | no candidate source SHA selected |
| Windows signed candidate | OPEN | no `dev.38` signing request or artifact exists |
| macOS signed/notarized candidate | OPEN | no `dev.38` artifact exists |
| Immutable Draft | OPEN | no tag or Release exists |
| Human Windows installed acceptance | OPEN | no configured Windows desktop is currently available through local Windows App |
| Human macOS installed acceptance | OPEN | exact candidate not built |
| MAC5 | `NO-GO` | candidate and installed evidence incomplete |
| Publication/update site | `NO-GO` | MAC5 GO absent |

## Current Decision

`GO` for bounded source implementation under DEV38-SIGN1A.

`NO-GO` for candidate acceptance, publication, or update-site mutation until
every preceding exact-candidate and human gate is true.

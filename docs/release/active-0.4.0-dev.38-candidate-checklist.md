# Rho 0.4.0-dev.38 Test-Signed Prerelease Checklist

Date: 2026-08-13

Status: active; DEV38-SIGN1 source integration, exact candidate construction,
and independent candidate audit passed. Automated macOS installed smoke passed
as supporting evidence; human Windows/macOS acceptance, MAC5, publication, and
live update evidence remain open

Owning contract:
`docs/plans/active-2026-08-13-dev38-test-signed-prerelease-spec.md`

Change class: D4

Risk: R4

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.38` | exact candidate metadata and installed macOS About surface agree |
| Release tag/name | `v0.4.0-dev.38` / `Rho 0.4.0-dev.38` | one unpublished Draft; no public tag exists |
| Source repository | `YuLab-SMU/Rho` | candidate mode admits only exact current protected `main` |
| Source commit | exact 40-hex protected-main SHA | `6f840796cbc04e6bb600474305148a8fe1043e74` |
| `rho.bridge` | `0.1.14` | unchanged; no R package contract change |
| `rho.agent` | `0.1.5` | unchanged; no R package contract change |
| Store schema | `12` | unchanged; no persistence migration |
| Windows package | x64 NSIS, SignPath Free Trial self-signed test certificate | final SHA-256 `4ee1154f5c67cb25ee69874054a069b6e49d19c225a7860a20cfef5391e03a61`; human install open |
| macOS package | Apple Silicon, Developer ID signed/notarized/stapled | final SHA-256 `9a26428727aee0cd98cd4c448e7c3853ac022fac64f629b5b1092c3b46b212e2`; automated installed smoke passed, human review open |
| Release decision | `NO-GO` | human platform acceptance and MAC5 remain open |

`0.4.0-dev.37` is consumed by Issue #33 and FT-SIGN1 evidence and is immutable.
No `dev.37` artifact, request, hash, installed result, or source commit may be
reused in this checklist.

## Candidate Construction Gate

- [x] version, Cargo/npm locks, Tauri metadata, frontend cache/mock identity,
  candidate/publish defaults, `NEWS.md`, release notes, and this checklist agree;
- [x] protected-main source matrix passes on macOS/Windows with Rust stable and
  `1.88.0` at the exact source commit;
- [x] the candidate workflow builds both platforms once from that exact commit;
- [x] Windows complete source/R/Rust/frontend/smoke validation passes before
  signing;
- [x] the unsigned Windows installer is exactly named, `NotSigned`, and hashed;
- [x] pinned SignPath module/configuration checks pass and one new request
  completes;
- [x] the returned Windows installer has the expected thumbprint, self-signed
  subject/issuer, exact `UnknownError` trust status, changed bytes, and a final
  hash matching Windows platform evidence;
- [x] Windows evidence contains valid `authenticode`,
  `signpath_request_binding`, and `free_trial_self_signed` checks without secret
  values;
- [x] macOS Developer ID, exact arm64, entitlements, notarization request/log
  binding, stapling, Gatekeeper, Workspace smoke, and license boundary pass;
- [x] aggregate evidence binds the final signed Windows installer and final
  stapled macOS DMG; and
- [x] one immutable Draft contains exactly the expected seven candidate assets
  and the reviewed release body, with no acceptance asset yet.

## Independent Candidate Audit

- [x] download all Draft assets and reproduce sizes/SHA-256 values;
- [x] validate both platform evidence files and aggregate evidence from the
  exact candidate commit;
- [x] independently confirm the SignPath request is `Completed` and its public
  certificate facts match evidence;
- [x] scan the complete hosted logs for API token, protected JSON, organization
  identifier, unique slugs, and thumbprint leakage;
- [x] confirm the Draft remains `draft=true`, `prerelease=true`, exact-tag,
  exact-commit, exact-body, and single-use; and
- [x] confirm no update-site or public Release state changed.

## Human Installed Acceptance

Automation and screenshots may support these rows but cannot mark them passed
without a human observation bound to the exact downloaded hashes.

Automated macOS support evidence on 2026-08-13 installed the exact downloaded
DMG at `/Applications/Rho.app` after preserving the preceding app. About showed
`0.4.0-dev.38` / `macos-aarch64`; Workspace R reached idle with R 4.5.2; a
data-frame execution appeared automatically in Environment and its table
preview; project switching succeeded; an intentional Console error exposed the
in-place Agent repair action; Workspace restart recovered to R idle and
Environment 0; Connections, capability routing, Base URL, and model capability
surfaces rendered; and the explicit update check truthfully reported that local
`dev.38` is newer than published `dev.24`. The DMG and mounted app passed
Developer ID/notary/staple/codesign/arm64 checks and the complete Workspace
smoke. Local `spctl --status` reports assessments disabled, so this support
evidence cannot mark the Gatekeeper or other human rows passed.

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
| Source implementation | PASS | PR #71 integrated candidate-only signing/evidence/public wording at `6f840796cbc04e6bb600474305148a8fe1043e74`; 65 JS tests, Rust workspace check/tests, both R package suites, shell fixtures, syntax/YAML/Cargo/diff validation passed |
| Exact source matrix | PASS | run `31678959111` passed macOS/Windows stable and Rust `1.88.0` at the exact source commit |
| Windows signed candidate | PASS (artifact) | run `31679767609`; exact SignPath request completed; final SHA-256 `4ee1154f5c67cb25ee69874054a069b6e49d19c225a7860a20cfef5391e03a61`; human installed acceptance open |
| macOS signed/notarized candidate | PASS (artifact) | run `31679767609`; final SHA-256 `9a26428727aee0cd98cd4c448e7c3853ac022fac64f629b5b1092c3b46b212e2`; automated installed smoke passed; human acceptance open |
| Immutable Draft | PASS | Draft Release `369760709` is unpublished, prerelease, exact-tag/commit/body, and contains exactly seven candidate assets |
| Human Windows installed acceptance | OPEN | no configured Windows desktop is currently available through local Windows App |
| Human macOS installed acceptance | OPEN | automated exact-DMG installed smoke passed; human observation and enabled-Gatekeeper review remain open |
| MAC5 | `NO-GO` | candidate and installed evidence incomplete |
| Publication/update site | `NO-GO` | MAC5 GO absent |

## Current Decision

`GO` for DEV38-SIGN1A source integration and DEV38-SIGN1B exact candidate/audit
completion.

`NO-GO` for DEV38-SIGN1C acceptance, MAC5, publication, or update-site mutation
until both exact human platform gates are true.

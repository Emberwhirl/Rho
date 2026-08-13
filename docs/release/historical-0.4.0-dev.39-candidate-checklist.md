# Rho 0.4.0-dev.39 Historical Conditional Prerelease Record

Date: 2026-08-13

Status: historical published conditional prerelease record; CPREL1A-CPREL1D,
protected integration, exact candidate construction, independent artifact
audit, actor-bound `CONDITIONAL_GO`, public prerelease publication, and live
update-site verification passed; Windows human installation and enabled-
Gatekeeper macOS human launch remain explicitly `NOT RUN`

Owning contract:
`docs/plans/implemented-2026-08-13-conditional-prerelease-policy-spec.md`

Change class: D4

Risk: R4

## Exact Identity

| Field | Final evidence |
| --- | --- |
| Application version | `0.4.0-dev.39` |
| Release tag/name | `v0.4.0-dev.39` / `Rho 0.4.0-dev.39` |
| Source repository | `YuLab-SMU/Rho` |
| Source commit | `579d6dc0d64e770aea14b2282e75ccde2076b345` |
| Pull request | [#73](https://github.com/YuLab-SMU/Rho/pull/73), merged 2026-08-13 |
| Release | [ID `370143482`](https://github.com/YuLab-SMU/Rho/releases/tag/v0.4.0-dev.39), public prerelease |
| Published at | `2026-08-13T19:15:59Z` |
| `rho.bridge` | `0.1.14`, unchanged |
| `rho.agent` | `0.1.5`, unchanged |
| Store schema | `12`, unchanged |
| Windows package | x64 NSIS, SignPath Free Trial self-signed test certificate with Authenticode |
| macOS package | Apple Silicon, Developer ID signed, notarized, and stapled |
| Release decision | `status: conditional` / `decision: CONDITIONAL_GO` |
| Decision scope | `public_prerelease_only` |

The identity and all eight assets are immutable. `0.4.0-dev.38` remains a
separate unpublished seven-asset Draft; none of its binaries, request, body,
hashes, evidence, or acceptance policy was reused.

## Source And Protected Integration

- all 66 fail-fast `scripts/test-*.mjs` contracts passed locally;
- candidate/release-notes/update-site/SignPath/conditional-policy tests, JS
  syntax, workflow YAML, and `git diff --check` passed;
- the complete locked Rust workspace passed with 177 desktop tests and one
  pre-existing opt-in Keychain smoke ignored;
- Rust `1.88.0` locked workspace validation passed;
- complete `rho.bridge` and `rho.agent` `testthat::test_local` suites passed;
- published `v0.4.0-dev.24` schema-v1 acceptance compatibility passed;
- PR-head matrix run
  [`31730361098`](https://github.com/YuLab-SMU/Rho/actions/runs/31730361098)
  passed macOS/Windows stable and Rust 1.88 jobs;
- exact merged-main matrix run
  [`31731476659`](https://github.com/YuLab-SMU/Rho/actions/runs/31731476659)
  passed the same four jobs against the source commit above; and
- ruleset `20728497` was restored with deletion and non-fast-forward blocks,
  one approval, stale-review dismissal, CODEOWNERS, last-push approval, review-
  thread resolution, no bypass actors, and the original merge methods.

## Candidate Construction

Authoritative candidate run
[`31732445952`](https://github.com/YuLab-SMU/Rho/actions/runs/31732445952)
completed successfully against the exact protected-main commit. Windows build,
smoke, pinned SignPath submission/return, and evidence passed. macOS build,
Developer ID signing, exact arm64 and entitlement checks, Apple notarization
binding, staple, hosted Gatekeeper assessment, mounted Workspace smoke, and
license boundary passed. Draft assembly produced exactly seven assets before
acceptance, with no public tag, Release, or update-site mutation.

## Immutable Public Assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `Rho_0.4.0-dev.39_x64-setup.exe` | 18,313,752 | `ebdc460669859e1ab3ef1c82e670e6bc3a59c8e5e123bf91b93398df02f3ea25` |
| `Rho_0.4.0-dev.39_x64-setup.exe.sha256` | 97 | `d5403cba95d778f1a870a2b10128b39a68b2512ead52a1e2e6c7c0ea8d7455cb` |
| `rho-0.4.0-dev.39-windows-x86_64-evidence.json` | 1,710 | `eba000aa848e57ef85609902de5e7d95d0628ac592cbebe9195a89dff7f936fa` |
| `Rho_0.4.0-dev.39_aarch64.dmg` | 21,169,221 | `d9814f9defa65ac209cffd51f9244d68f1af297fe26aa9b9aa62b0691285d434` |
| `Rho_0.4.0-dev.39_aarch64.dmg.sha256` | 95 | `610e94693679c5c5973f3dc617654afb1a74d9101f532155232203e2c67d4dfa` |
| `rho-0.4.0-dev.39-macos-aarch64-evidence.json` | 1,430 | `1daed9979542be1d7e9a0615d59efaabe581b1fbacd89328866a3c67ed9c14db` |
| `rho-0.4.0-dev.39-candidate-evidence.json` | 1,478 | `f612649acac861c3f3f877996afc762a5d399b8cb01ac8370d7f63bc97f96f10` |
| `rho-0.4.0-dev.39-acceptance.json` | 2,174 | `7812015d69dac1c88e27dae023260c8b913fad701c7d944dc128534c165d6ba5` |

All eight files were downloaded independently. Their byte sizes and SHA-256
values matched both GitHub asset digests and the aggregate evidence; both
checksum sidecars matched the exact final artifacts. The aggregate, platform,
and acceptance records passed the checked-in validators against the exact
version, tag, commit, platform set, candidate-evidence hash, and publisher
actor.

## Independent Trust And Runtime Audit

Windows evidence and downloaded bytes established:

- a valid PE security directory containing a PKCS#7 `WIN_CERTIFICATE`;
- self-signed subject/issuer `CN=Rho Test Signing`, SHA-1 thumbprint
  `74c895cbf9759ae1041a61f54f3b3bc6b0446511`, matching candidate evidence;
- pinned signing module version `4.4.6` and module SHA-256
  `4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae`;
- final signed SHA-256 matching the public installer and differing from the
  recorded unsigned input; and
- request binding, Authenticode, and Free Trial self-signed checks passed.

This is a test signature, not public Windows trust, SignPath Foundation
acceptance, a production publisher, or SmartScreen reputation.

macOS downloaded-byte audit established:

- `hdiutil verify` passed and the stapled ticket validated;
- automated `spctl` accepted both DMG and app as `Notarized Developer ID`, while
  also reporting the local `override=security disabled` condition;
- deep strict code-sign validation passed with identifier `org.yulab.rho`, Team
  ID `GAAY6Z9874`, and the reviewed Developer ID certificate chain;
- the app and bundled Ark executables were exactly `arm64`;
- both executable entitlement sets passed the checked-in exact validator;
- bundled AGPL license and third-party notices matched repository bytes; and
- the mounted app `--smoke-test` passed Workspace execution, Data Viewer,
  stale rejection, project isolation, restart, interrupt, and crash recovery.

The complete hosted run log contained no unmasked SignPath credential,
deployment configuration, protected project identity, bearer token, or raw
deployment configuration. Public request/certificate facts remain bounded to
the candidate evidence.

## Conditional Human Limitations

These are immutable limitations, not passed checks:

| Observation | Status | Reason |
| --- | --- | --- |
| Windows clean-profile human installation, warning/publisher presentation, representative workflow, recovery, update check, and uninstall | `NOT RUN` | `no_windows_device` |
| enabled-Gatekeeper human macOS launch | `NOT RUN` | `gatekeeper_assessments_disabled` |

Automated macOS and Windows support evidence above does not change either row.
The reviewed Release body and live download page visibly disclose both rows and
state that the prerelease is for evaluation and testing only.

## Conditional Acceptance And Publication

The deterministic generator created schema-v2 acceptance directly from the
independently downloaded aggregate evidence. It records:

- `status: conditional` and `decision: CONDITIONAL_GO`;
- authorizer/publisher `xiayh17` at `2026-08-13T19:13:07Z`;
- exact source, candidate-evidence digest, and platform records;
- scope `public_prerelease_only`; and
- the canonical two acknowledged risks and `not_run` limitations in exact
  order, with no additional waiver.

The asset was uploaded once as the eighth file. Protected publish run
[`31734766000`](https://github.com/YuLab-SMU/Rho/actions/runs/31734766000)
validated the body, eight assets, evidence, decision, actor, and exact source,
then performed the only Draft-to-public transition without rebuilding or
replacing an asset. Public tag `v0.4.0-dev.39` resolves to the exact source
commit and the reviewed Release body matches
`.github/release-notes/v0.4.0-dev.39.md` byte-for-byte.

Triggered update-site run
[`31734975029`](https://github.com/YuLab-SMU/Rho/actions/runs/31734975029)
validated the acceptance binding, published gh-pages commit
`8e5bcffa53c33ee1d4d6d1861d43bc6bcf410270`, and passed its deployed-manifest
probe. Independent cache-busted retrieval confirmed the live page's conditional
warning and development manifest version, URLs, sizes, and both artifact hashes.

## Final Decision

`RELEASED — CONDITIONAL_GO` for exact `0.4.0-dev.39` as a public development
prerelease only. This is not ordinary MAC5 `GO`, a stable release, or a claim
that either human observation passed. Branch protection was restored, the
release evidence is immutable, and the merged implementation branch was
removed during post-release reconciliation. The reconciliation branch is
removed after its own protected merge and is not release evidence.

Application and R package versions do not change for this documentation-only
reconciliation. `NEWS.md` already records the shipped conditional behavior.

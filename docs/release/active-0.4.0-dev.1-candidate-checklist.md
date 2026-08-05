# Rho 0.4.0-dev.1 Cross-Platform Candidate Checklist

Status: active; MAC4 candidate/update/signing/draft tooling implemented and
locally verified on 2026-08-05; no exact hosted draft, installed-candidate
acceptance, or release GO exists yet; MAC4-R fork rehearsal authorized on
2026-08-05, implemented and locally verified; credentialed hosted rehearsal
NOT RUN

Change class: D4 release candidate, signing/notarization, GitHub Release draft,
and update-publication inputs

Risk: R4

Owning documents: the active macOS arm64 specification owns the MAC4/MAC5
sequence and macOS artifact. The accepted About/update design owns schema,
channel, endpoint, allowlist, and redirect semantics. This checklist alone owns
the exact `0.4.0-dev.1` cross-platform candidate identity, evidence binding,
manual acceptance ledger, and GO/NO-GO decision. The `0.2.0-dev.12` checklist
does not apply to this candidate.

Authorization: the project owner requested "开始完成MAC4" on 2026-08-05.
This authorizes MAC4 implementation and draft-candidate construction only.
MAC5 installed acceptance, acceptance-evidence upload, publication, and live
Pages acceptance remain unauthorized. After identifying that upstream review
requires pre-merge hosted evidence, the project owner approved the bounded
artifact-only fork rehearsal with "行，那就这样做吧" on 2026-08-05. That
rehearsal has no candidate, Release, MAC5, or publication authority.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.1` | synchronized and locally verified |
| Release tag | `v0.4.0-dev.1` | workflow identity fixed; draft NOT RUN |
| Release name | `Rho 0.4.0-dev.1` | workflow identity fixed; draft NOT RUN |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | fixed |
| Source commit | one full 40-character SHA | pending hosted checkout |
| Windows platform | `windows_x86_64` | pending hosted build |
| macOS platform | `macos_aarch64` | pending hosted build |
| Minimum macOS | 14.0 | configured; exact candidate pending |
| Ark | 0.1.252 arm64 on macOS | pinned; exact candidate pending |
| Release decision | `NO-GO` | MAC5 not authorized or run |

The version/tag is single-use. If a draft or published release already exists
for the tag, candidate assembly fails without deleting, overwriting, or
replacing it. A withdrawn or rejected candidate advances to a new version.

## Required Draft Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.1_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.1_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.1-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.1_aarch64.dmg` | macOS candidate job | NOT RUN |
| `Rho_0.4.0-dev.1_aarch64.dmg.sha256` | macOS candidate job | NOT RUN |
| `rho-0.4.0-dev.1-macos-aarch64-evidence.json` | macOS candidate job | NOT RUN |
| `rho-0.4.0-dev.1-candidate-evidence.json` | draft assembly job | NOT RUN |

Each platform evidence file binds schema/type/status, version, tag, source
commit, platform, artifact name, byte size, lowercase SHA-256, and named checks.
The aggregate record requires both platform files to agree and binds the exact
asset set. Evidence JSON is capped at 256 KiB and checksum sidecars at 1 KiB.
Absolute runner paths, certificate/keychain paths, credentials, secret values,
and unbounded logs are forbidden.

## MAC4 Automated Candidate Gate

Before draft creation, the exact hosted checkout must pass:

- synchronized Cargo, Tauri, frontend package, lockfile, cache-busting, and tag
  identity checks;
- Rust format and complete workspace tests;
- complete `rho.bridge` and `rho.agent` tests;
- frontend JavaScript syntax and all deterministic `scripts/test-*.mjs` tests;
- deterministic candidate-evidence, update-manifest, workflow, and release
  contract fixtures including negative/failure cases;
- reproducible Ark bootstrap and architecture/checksum admission for the
  platform being built;
- Windows installer build and Workspace smoke on the supported GNU toolchain;
- macOS arm64 app/DMG build on `macos-26` with Xcode 26.6 and Workspace smoke;
- exact artifact filename, positive size, sidecar syntax, and recomputed hash
  agreement before any release API mutation.

A platform job failure prevents aggregate evidence and draft creation. A draft
job failure never publishes a partial release.

## MAC4 Local Implementation Evidence — 2026-08-05

Passed locally on Apple Silicon macOS 26.5.2 with Xcode 26.6, Node 22.22.3,
Rust 1.97.0, and arm64 R 4.5.2:

- synchronized Cargo workspace/lockfile, Tauri, frontend package/lockfile,
  browser mock, cache-busting, roadmap, and NEWS identity checks;
- candidate evidence and publish-admission fixtures, including malformed
  identity, missing/unknown platform, stale acceptance, NO-GO, evidence byte
  budget, and content hash/size rejection;
- legacy Windows-only and two-platform update generation, SemVer promotion,
  draft rejection, missing macOS, unknown platform, and bad asset/hash tests;
- 33 deterministic `scripts/test-*.mjs` suites, frontend syntax, workflow YAML,
  shell/bootstrap failure fixtures, both R package suites, Rust format, and the
  complete Rust workspace matrix;
- Tauri CLI 2.11.4 release `app,dmg` build with explicit `--no-sign`; the
  resulting `0.4.0-dev.1` app reports macOS 14.0 minimum, the app executable
  and bundled Ark are arm64, the DMG mounts with `Rho.app`, and the app-bundled
  Workspace smoke passed execution, Viewer, two-project, interrupt, restart,
  and crash-recovery checks.

The local DMG was deliberately unsigned and is development evidence only. Its
size/hash are not candidate identity and must not be copied into hosted
evidence. The Windows GNU target and PowerShell are absent locally; the hosted
Windows build is `NOT RUN`, not inferred from static configuration.

The repository does not contain signing/notarization credentials. Developer ID
import, hosted signing, notarization result, stapling, Gatekeeper, platform
artifact uploads, aggregate hosted evidence, and draft creation all remain
`NOT RUN`. No GitHub release or Pages state was changed.

## MAC4-R Fork Rehearsal Gate — IMPLEMENTED / HOSTED NOT RUN

The review-only rehearsal must run from the exact fork and cannot satisfy any
row in Required Draft Assets or MAC5 Installed Acceptance.

Local contract evidence covers exact repository/mode and default-branch
admission, candidate-only write permission, seven-file rehearsal upload,
bounded schema, type-confusion rejection, cleanup verification, and retry-safe
Run/Attempt artifact identity. Hosted rows remain open until the committed
workflow runs from fork `main` with repository secrets.

| Gate | Required evidence | State |
| --- | --- | --- |
| Repository admission | `build_mode=rehearsal` and exact `YuLab-SMU/Rho_for_mac` identity | NOT RUN |
| Immutable source | one full fork commit shared by both platform jobs | NOT RUN |
| Windows rehearsal | installer, checksum, platform evidence and Workspace smoke | NOT RUN |
| macOS rehearsal | signed/notarized/stapled DMG, checksum, Gatekeeper and Workspace smoke | NOT RUN |
| Aggregate rehearsal | bounded rehearsal record agrees with both platform files and hashes | NOT RUN |
| Credential cleanup | temporary `.p12`, `.p8`, and Keychain removed on every outcome | NOT RUN |
| Mutation boundary | Actions artifact only; no tag, Release, Pages, environment, or repository mutation | NOT RUN |

The final Actions artifact is retained for 14 days and contains only the two
platform artifact/checksum/evidence triplets plus
`rho-0.4.0-dev.1-rehearsal-evidence.json`. Candidate aggregate evidence is used
only transiently for validation and is not uploaded. Rehearsal evidence is not
accepted by candidate publication or update-site tooling. The main repository
must rebuild the exact candidate after merge.

## macOS Signing And Notarization Gate

The hosted macOS job must record all of these as separate passed checks:

- Developer ID certificate imported into a newly created temporary keychain;
- key partition access limited to Apple/codesign tools;
- exact configured signing identity present;
- Xcode 26.6 selected from `/Applications/Xcode_26.6.app`;
- arm64 app and bundled Ark architecture verified;
- hardened runtime and project entitlements used by Tauri;
- `codesign --verify --deep --strict --verbose=4` passes for the app;
- App Store Connect API notarization succeeds;
- the DMG is stapled and `xcrun stapler validate` passes;
- Gatekeeper assessment passes for the app and DMG;
- temporary certificate, `.p8`, and keychain are removed in an unconditional
  cleanup step.

The required repository secrets are `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `KEYCHAIN_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_TEAM_ID`, `APPLE_API_ISSUER`,
`APPLE_API_KEY`, and `APPLE_API_PRIVATE_KEY`. The workflow writes certificate
and API-key files only under `RUNNER_TEMP`; it sets `APPLE_API_KEY_PATH` to the
temporary `.p8` path. Secrets and their paths never enter release evidence.

## Draft Assembly Gate

The assembly job has `contents: write`; platform build jobs have only
`contents: read`. It may create exactly one draft prerelease after both platform
artifacts and the aggregate record validate. It must:

- resolve the requested ref to the same commit recorded by both jobs;
- reject an existing release/tag before mutation;
- create the release with `draft: true` and `prerelease: true`;
- upload the required files once without deleting or replacing assets;
- re-read release metadata and prove names/sizes agree with aggregate evidence;
- leave Pages/update-site publication untouched while the release is a draft.

## MAC5 Installed Acceptance — NOT AUTHORIZED / NOT RUN

All rows remain open until MAC5 is separately activated and the checks are run
against downloaded assets from the exact draft.

| Gate | Required evidence | State |
| --- | --- | --- |
| Asset identity | tag, commit, names, sizes and hashes match aggregate record | NOT RUN |
| macOS 14 clean install | quarantine-preserving download, mount/install/launch | NOT RUN |
| Current macOS clean install | quarantine-preserving download, mount/install/launch | NOT RUN |
| R 4.4 | discovery, Workspace/Agent workflow and recovery | NOT RUN |
| Current stable R | discovery, Workspace/Agent workflow and recovery | NOT RUN |
| Signature/notarization | codesign, notary result, staple and Gatekeeper | NOT RUN |
| Upgrade/reinstall | prior state compatibility and truthful recovery | NOT RUN |
| Uninstall | documented app/credential/data retention behavior | NOT RUN |
| Core workflow | Unicode/spaces/symlink project, Git, Quarto, Plot, Viewer, Agent | NOT RUN |
| Offline/update | failure recovery, channel policy and user-initiated redirect | NOT RUN |
| Windows retained | exact Windows installer acceptance for same tag/commit | NOT RUN |
| Release decision | explicit D4 GO for this immutable candidate | NO-GO |

## Publish Admission Contract

The separate publish workflow is inert until MAC5 adds
`rho-0.4.0-dev.1-acceptance.json` to the draft. That record must be bounded JSON
with schema/type, `status: "passed"`, `decision: "GO"`, exact version/tag/commit,
the aggregate evidence SHA-256, and the complete candidate asset mapping. The
publish workflow downloads and validates the draft plus this record, then may
only change `draft` from true to false. It may not rebuild, upload, delete,
rename, or replace candidate assets.

After publication, the separate update-site workflow may regenerate Pages from
the published release. Draft build, signed artifact existence, and release
publication do not by themselves prove live Pages acceptance.

## Rollback And Withdrawal

- Before publication: leave a failed draft unpublished and advance the
  version; never repair an accepted candidate in place.
- After publication but before Pages: the GitHub Release remains authoritative;
  Pages failure is a separate publication failure and must not fabricate a
  successful update manifest.
- After a later withdrawal: mark the prerelease withdrawn and remove it from
  update discovery through a reviewed new Pages state. Preserve release and
  evidence records; do not replace same-version assets.

## Current Decision

`NO-GO`. MAC4 implementation and locally available verification are complete,
and MAC4-R is implemented and locally verified but its hosted run is NOT RUN.
No credentialed hosted rehearsal or candidate, immutable draft, MAC5 installed
acceptance, or explicit GO exists.

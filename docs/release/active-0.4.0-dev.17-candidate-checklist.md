# Rho 0.4.0-dev.17 Cross-Platform Candidate Checklist

Status: active development-candidate identity; Issue #4 Model settings behavior
is implemented and locally verified; authoritative candidate assets,
GitHub Release draft, installed-candidate acceptance, MAC5, and release GO are
NOT RUN and unauthorized

Date: 2026-08-07

Change class: D4 release candidate, signing/notarization, GitHub Release draft,
installed acceptance, and update-publication inputs

Risk: R4

Owning documents: the active macOS arm64 specification owns the MAC4/MAC5
sequence, platform runtime, signing, notarization, and macOS artifact contract.
The active system-credential and simple-LLM-settings specification owns the
CRED-UX2 product behavior that requires this new application identity. The
accepted About/update design owns manifest schema, endpoint, allowlist,
redirect, and user-initiated-install policy. This checklist alone owns the
exact `0.4.0-dev.17` cross-platform candidate identity, candidate evidence,
installed-acceptance ledger, and GO/NO-GO decision.

The historical `0.4.0-dev.16` checklist records immutable review-only
rehearsals. None of its artifacts, hashes, run results, notarization receipts,
or acceptance statements can satisfy a `0.4.0-dev.17` row.

Authorization: the project owner requested completion of upstream Issue #4.
That authorizes the bounded CRED-UX2 implementation, affected validation,
version synchronization, and local development-app/DMG acceptance needed to
prove the implementation. It does not authorize an authoritative candidate
workflow dispatch, tag, GitHub Release or draft, evidence upload, MAC5,
publication, or update-site mutation. Those actions require a separate entry
review and explicit authorization.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.17` | source metadata synchronized; local app and DMG verified |
| Release tag | `v0.4.0-dev.17` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.17` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative candidate restriction unchanged |
| Source commit | one full 40-character default-branch SHA | NOT SELECTED |
| Windows platform | `windows_x86_64` | authoritative evidence NOT RUN |
| macOS platform | `macos_aarch64` | authoritative evidence NOT RUN |
| Minimum macOS | 14.0 | configured and present in the local app Info.plist; exact candidate pending |
| Ark | 0.1.252 arm64 on macOS | pinned; local bundled sidecar is arm64; exact candidate pending |
| Release decision | `NO-GO` | candidate and MAC5 are not authorized or run |

The version/tag is single-use. A failed, withdrawn, rejected, or already-used
identity advances to a new version; no candidate may delete, overwrite, or
replace an existing tag, Release, draft, or asset.

## Local Implementation Evidence

This section records reviewable development evidence only. It does not satisfy
an authoritative candidate-asset, immutable-draft, installed-acceptance, or
MAC5 row.

- All application version authorities, workflow defaults, cache-busting
  metadata, `NEWS.md`, roadmap, and this checklist are synchronized at
  `0.4.0-dev.17`; R package versions are unchanged.
- JavaScript syntax, all 40 `scripts/test-*.mjs`, candidate-release and update
  self-tests, workflow YAML parsing, Rust format and full workspace tests, both
  R package suites, the Ark macOS bootstrap fixtures, and `git diff --check`
  passed on 2026-08-07.
- Deterministic browser/mock acceptance passed the complete Issue #4 guided
  provider/model flow, provider filtering, readiness and partial-failure
  states, credential clearing, model editor, focus/Escape behavior, and a
  `680 x 820` narrow viewport without using or persisting a real key.
- The local Tauri 2.11.4 build produced an unsigned arm64 app and
  `Rho_0.4.0-dev.17_aarch64.dmg`. The DMG is 21,079,685 bytes with SHA-256
  `0f919f8366bade4d12554be87bf07f9117cbeac04397de9e7447935555516f76`;
  `hdiutil verify` and Workspace smoke from both the app and a read-only
  mounted DMG passed.
- Native local review confirmed the default Issue #4 provider-card surface and
  bundled R readiness. The child-dialog native accessibility recheck is not
  claimed because the Computer Use window service returned
  `cgWindowNotFound`; installed-candidate native accessibility, Keychain
  mutation, and live-provider evidence remain `NOT RUN`.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.17_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.17_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.17-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.17_aarch64.dmg` | macOS finalizer job | NOT RUN |
| `Rho_0.4.0-dev.17_aarch64.dmg.sha256` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.17-macos-aarch64-evidence.json` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.17-candidate-evidence.json` | draft assembly job | NOT RUN |

Every evidence record must bind its schema/type/status, version, tag, exact
source commit, repository, workflow run/attempt, platform, artifact filename,
positive byte size, lowercase SHA-256, and named checks. Both platform records
must agree before aggregate evidence exists. Evidence JSON remains capped at
256 KiB and checksum sidecars at 1 KiB. Absolute runner paths, certificate or
keychain paths, credentials, secret values, presigned URLs, and unbounded logs
are forbidden.

## Candidate Entry Gate

Before any authoritative workflow dispatch, record all of the following:

- explicit candidate-build authorization from the project owner;
- a clean, reviewed, pushed default-branch source commit in `YuLab-SMU/Rho`;
- synchronized Cargo, lockfile, Tauri, package, browser-mock, cache-busting,
  workflow-default, roadmap, checklist, and NEWS identities;
- CRED-UX2 implementation and deterministic frontend/manual UI evidence;
- complete affected Rust, R, JavaScript, release-contract, workflow, format,
  syntax, and diff validation against the exact source;
- review that no real API key appears in source, logs, screenshots, mock state,
  evidence, or artifacts;
- a fresh check that `v0.4.0-dev.17` and its Release/draft do not exist.

Failure of any entry row leaves the decision NO-GO and forbids candidate mode.
The default workflow mode remains `rehearsal`; candidate mode remains restricted
to the main repository and its current default-branch commit.

## Automated Candidate Gate

The exact hosted checkout must pass the unchanged MAC4 contract:

- all synchronized identity and source-containment checks;
- Rust format and complete workspace tests;
- complete `rho.bridge` and `rho.agent` tests;
- frontend JavaScript syntax and every deterministic `scripts/test-*.mjs`;
- candidate-evidence, update-manifest, workflow, and release-contract fixtures,
  including negative, malformed, oversized, stale, and recovery cases;
- reproducible Ark bootstrap, architecture, checksum, and toolchain admission;
- Windows installer build plus Workspace smoke;
- signed macOS arm64 app/DMG build, immutable final-DMG notarization request,
  bounded Accepted-log binding, stapling, both Gatekeeper assessments, exact
  entitlements, mounted-DMG Workspace smoke, and temporary-secret cleanup;
- exact artifact filename, positive size, sidecar syntax, and recomputed hash
  agreement before any release API mutation.

Platform jobs may not compose evidence across commits, workflow runs, or
attempts. A platform failure prevents aggregate evidence and draft creation.
A draft failure never publishes a partial release. A failed-job rerun may reuse
only the immutable notarization request allowed by the active macOS contract;
it must not silently resubmit or infer success from history.

## Immutable Draft Gate

If and only if the automated candidate gate passes, a separately authorized
candidate run may create one prerelease draft containing exactly the seven
required assets. Draft assembly must fail closed on any extra, missing,
duplicate, mismatched, stale, malformed, oversized, or recomputed-hash-invalid
asset. Draft creation is not publication and does not satisfy MAC5.

Current state: NOT RUN; no authoritative asset, tag, Release, or draft exists.

## MAC5 Installed Acceptance

MAC5 is a later, separately authorized mutation/acceptance package. It requires
clean installation of the exact immutable candidate on supported Windows x64
and Apple Silicon macOS systems, including the representative scientific
workflow, restart/recovery behavior, Keychain/Credential Manager behavior,
Gatekeeper/SmartScreen observations, About/update presentation, and the
CRED-UX2 Model settings workflow.

The Issue #4 acceptance slice must prove, without recording a real key:

- default provider-card presentation and a separately visible current model;
- a guided Add provider Connection step followed by its Model step;
- provider-specific Model lists and per-provider Advanced disclosure;
- separate API key, Provider danger, and Model danger operations;
- empty, missing-key, no-model, disabled-model, ready-to-test, ready,
  connection-error, storage-unavailable, long-name, and narrow-window states;
- truthful working/success/warning/failure feedback and recovery;
- keyboard focus containment, Escape behavior, and hidden-menu exclusion from
  the accessibility tree;
- key inputs clear after success, failure, cancellation, navigation, dialog
  close, and restart, and no key value appears in logs or evidence.

Current state: NOT RUN for an exact installed candidate. Local development-app
acceptance is implementation evidence only and cannot satisfy this row.

## Publication Gate

Publication, update-manifest generation, Pages mutation, and live update
acceptance remain separate and unauthorized. They require exact candidate
evidence, an immutable draft, complete MAC5 acceptance, a reviewed bounded
acceptance record, and an explicit GO. A local build, passing automation,
signed artifact, or draft is never sufficient by itself.

## Rollback And Recovery

- Before publication, preserve failures as evidence, leave drafts unpublished,
  and advance the application version for any replacement candidate.
- Never weaken credential, artifact, source, notarization, or acceptance gates
  to rescue a failing candidate.
- If local Issue #4 validation fails, repair only the active CRED-UX2 contract,
  rerun the complete affected matrix, and keep every release row NOT RUN.
- After publication, withdrawal is a reviewed new release/update-site state;
  preserve the original release and evidence rather than replacing assets.

## Current Decision

`NO-GO`. `0.4.0-dev.17` is the development identity for the Issue #4 Model
settings completion. Authoritative cross-platform candidate construction,
immutable draft creation, installed-candidate MAC5 acceptance, publication,
and live update acceptance are all NOT RUN and unauthorized.

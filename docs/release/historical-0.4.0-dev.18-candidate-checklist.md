# Rho 0.4.0-dev.18 Cross-Platform Candidate Checklist

Status: historical rejected development identity; CRED-UX3 provider model
discovery and CRED-UX4A capability routing were implemented and locally
verified, but the exact installed DMG exposed an unrecoverable settings-entry
state. No authoritative candidate assets, GitHub Release draft, MAC5 evidence,
or release GO were created.

Date: 2026-08-07

Change class: D4 release candidate, signing/notarization, GitHub Release draft,
installed acceptance, and update-publication inputs

Risk: R4

Owning documents: the active macOS arm64 specification owns the MAC4/MAC5
sequence, runtime, signing, notarization, and DMG contract. The active
system-credential and simple-LLM-settings specification owns CRED-UX3 behavior
and the active CRED-UX4A routing foundation. This checklist now preserves only
the immutable `0.4.0-dev.18` source, artifact, installed rejection, and NO-GO
record. The next active checklist owns all `0.4.0-dev.19` candidate authority.

The historical `0.4.0-dev.16` and `0.4.0-dev.17` checklists record immutable
earlier-source evidence. None of their artifacts, hashes, runs, notarization
receipts, or acceptance statements can satisfy a `0.4.0-dev.18` row.

Authorization: the project owner explicitly requested Provider-fetched model
lists instead of manual-first model entry. That authorizes bounded CRED-UX3
implementation, affected validation, synchronized application versioning, and
a local unsigned development app/DMG. On 2026-08-07 the owner separately
authorized bounded CRED-UX4A implementation and acceptance, but not CRED-UX4B
or CRED-UX4C. Neither authorization permits an authoritative candidate
workflow dispatch, tag, GitHub Release or draft, evidence upload,
MAC5, publication, or update-site mutation.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.18` | source metadata synchronized; post-redesign local development evidence is not installed-candidate acceptance |
| Release tag | `v0.4.0-dev.18` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.18` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative candidate restriction unchanged |
| Source commit | one full 40-character default-branch SHA | NOT SELECTED |
| Windows platform | `windows_x86_64` | authoritative evidence NOT RUN |
| macOS platform | `macos_aarch64` | authoritative evidence NOT RUN |
| Minimum macOS | 14.0 | configured; exact candidate pending |
| Ark | 0.1.252 arm64 on macOS | pinned; exact candidate pending |
| Release decision | `NO-GO` | candidate and MAC5 are not authorized or run |

The version/tag is single-use. A failed, withdrawn, rejected, or already-used
identity advances to a new version; no candidate may delete, overwrite, or
replace an existing tag, Release, draft, or asset.

## Local Implementation Evidence

This section records reviewable development evidence only. It cannot satisfy
an authoritative candidate-asset, immutable-draft, installed-acceptance, live
Provider, or MAC5 row.

- Application metadata, workflow defaults, browser mock identity,
  cache-busting metadata, `NEWS.md`, roadmap, and this checklist are
  synchronized at `0.4.0-dev.18`. The independently versioned `rho.agent`
  package advances from `0.1.2` to `0.1.3` because its exported session factory
  now accepts and validates the selected capability-route contract.
- CRED-UX3 and CRED-UX4A implement bounded Provider discovery, deterministic
  V1-to-V2 settings migration, revision-guarded capability routes, complete
  model capability provenance, one effective Ask/Plan/Act route, and exactly
  one selected-route credential per Agent child. Optional capability workers
  and media consumers are not implemented or authorized.
- Focused negative/failure-injection tests, the complete affected
  Rust/R/JavaScript matrix, deterministic browser/mock review, and a separate
  credential/contract review passed. These development facts do not satisfy
  installed-app, live-Provider, authoritative-candidate, or MAC5 acceptance.
- Tauri CLI 2.11.4 produced the post-redesign unsigned arm64 local development
  DMG. `hdiutil verify`, exact arm64 app/Ark checks, version/minimum-macOS
  metadata, and the complete read-only-mounted Workspace smoke passed. The
  21,166,579-byte DMG has SHA-256
  `75d6cdf20affb75ca94b5a81050c321eb41975b14c0a43bea2c40a9652da2723`.
  It is local development evidence only and is not a signed, notarized,
  immutable, installed, or authoritative candidate asset.
- No real Provider credential or request is used by deterministic tests or
  browser review. Live Provider acceptance remains `NOT RUN`.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.18_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.18_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.18-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.18_aarch64.dmg` | macOS finalizer job | NOT RUN |
| `Rho_0.4.0-dev.18_aarch64.dmg.sha256` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.18-macos-aarch64-evidence.json` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.18-candidate-evidence.json` | draft assembly job | NOT RUN |

Every evidence record must bind schema/type/status, version, tag, exact source
commit, repository, workflow run/attempt, platform, artifact filename, positive
byte size, lowercase SHA-256, and named checks. Platform records must agree
before aggregate evidence exists. Evidence JSON remains capped at 256 KiB and
checksum sidecars at 1 KiB. Absolute runner paths, certificate or keychain
paths, credentials, secret values, presigned URLs, and unbounded logs are
forbidden.

## Candidate Entry Gate

Before any authoritative workflow dispatch, record all of the following:

- explicit candidate-build authorization from the project owner;
- a clean, reviewed, pushed default-branch source commit in `YuLab-SMU/Rho`;
- synchronized Cargo, lockfile, Tauri, package, browser-mock, cache-busting,
  workflow-default, roadmap, checklist, and NEWS identities;
- CRED-UX3 and CRED-UX4A implementation, migration/recovery evidence,
  negative/security review, and deterministic routing UI evidence;
- complete affected Rust, R, JavaScript, release-contract, workflow, format,
  syntax, and diff validation against the exact source;
- review that no real API key appears in source, logs, screenshots, mock state,
  evidence, or artifacts;
- a fresh check that `v0.4.0-dev.18` and its Release/draft do not exist.

Failure of any row leaves the decision NO-GO and forbids candidate mode. The
default workflow mode remains `rehearsal`; candidate mode remains restricted
to the main repository and its current default-branch commit.

## Automated Candidate Gate

The exact hosted checkout must pass the unchanged MAC4 contract plus CRED-UX3
and CRED-UX4A:

- synchronized identity and source-containment checks;
- Rust format and complete workspace tests;
- complete `rho.bridge` and `rho.agent` tests;
- frontend syntax and every deterministic `scripts/test-*.mjs`;
- model-discovery URL/header/shape, credential/redaction, redirect, timeout,
  size, model-count, stale-result, mutation-boundary, and manual-recovery tests;
- V1-to-V2 backup/migration/reopen, corrupt/unsupported/failure recovery,
  revision concurrency, route compatibility/dependency, two-Provider routing,
  one-child/one-credential, catalog provenance, and no-route-override tests;
- three-layer Model routing/Connections/Model library states, compatible/needs
  review/incompatible grouping, stale retry, keyboard/focus, long-name, and
  narrow-window browser/mock evidence;
- candidate-evidence, update-manifest, workflow, and release-contract fixtures;
- reproducible Ark bootstrap, architecture, checksum, and toolchain admission;
- Windows installer build plus Workspace smoke;
- signed macOS arm64 app/DMG build, immutable one-request notarization binding,
  stapling, Gatekeeper, exact entitlements, mounted-DMG Workspace smoke, and
  temporary-secret cleanup;
- exact filenames, positive sizes, sidecar syntax, and recomputed hashes before
  any release API mutation.

Platform jobs may not compose evidence across commits, workflow runs, or
attempts. A platform failure prevents aggregate evidence and draft creation.
A draft failure never publishes a partial release.

## Immutable Draft Gate

If and only if the automated candidate gate passes, a separately authorized
candidate run may create one prerelease draft containing exactly the seven
required assets. Draft assembly fails closed on any extra, missing, duplicate,
mismatched, stale, malformed, oversized, or recomputed-hash-invalid asset.
Draft creation is not publication and does not satisfy MAC5.

Current state: NOT RUN; no authoritative asset, tag, Release, or draft exists.

## MAC5 Installed Acceptance

MAC5 is a later, separately authorized package. It requires clean installation
of the exact immutable candidate on supported Windows x64 and Apple Silicon
macOS systems, including representative scientific workflow, restart/recovery,
credential-store behavior, platform trust observations, About/update, and
Model settings.

CRED-UX3 installed acceptance must use a disposable credential without
recording it and prove one successful live model list, one auth/failure
fallback, manual entry, refresh, Provider switching, close/reopen recovery,
and no model mutation before Save. It also retains the CRED-UX2 accessibility,
narrow-window, key-clearing, separated-management, and danger-zone checks.

CRED-UX4A installed acceptance must additionally prove V1 close/reopen
migration, separate Chat and Act routes across two disposable Provider
connections, compatible/needs-review/incompatible presentation, explicit
unknown-capability declaration, stale-dialog recovery, no route assignment on
model import, one selected-route key per turn, and no silent Provider or route
fallback. It must not invoke an unauthorized media or embedding worker.

Current state: NOT RUN for an exact installed candidate. Local development-app
and deterministic mock evidence cannot satisfy this row.

## Publication Gate

Publication, update-manifest generation, Pages mutation, and live update
acceptance remain separate and unauthorized. They require exact candidate
evidence, an immutable draft, complete MAC5 acceptance, a reviewed bounded
acceptance record, and an explicit GO.

## Rollback And Recovery

- Preserve failures as evidence, leave drafts unpublished, and advance the
  application version for any replacement candidate.
- Never weaken credential, network, artifact, source, notarization, or
  acceptance gates to rescue a failing candidate.
- If CRED-UX3 or CRED-UX4A validation fails, repair only the active contract,
  rerun the complete affected matrix, and keep every release row NOT RUN.

## Current Decision

`NO-GO`, immutable and historical. The owner installed the exact local
`0.4.0-dev.18` DMG and observed that a failed settings read disabled the only
model-settings entry control while instructing the user to open those settings.
That installed rejection supersedes all earlier local development acceptance
language. The identity, artifact, and hash must not be overwritten or reused;
all replacement work advances to `0.4.0-dev.19`.

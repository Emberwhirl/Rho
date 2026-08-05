# macOS Apple Silicon Support

Status: active; full direction authorized by the project owner on 2026-08-05;
MAC1 implementation, automated verification, and independent contract review
complete on 2026-08-05; MAC2 implementation, automated verification, arm64
debug-app runtime acceptance, and separate contract review complete on
2026-08-05; MAC3 implementation, affected automated verification, isolated
native-Keychain smoke, unsigned arm64 development-app workflow acceptance, and
separate contract review complete on 2026-08-05; the MAC3 mandatory stop is
reached; MAC4 entry review complete and explicitly authorized on 2026-08-05;
MAC4 implementation, locally available verification, version/NEWS review, and
separate contract review complete on 2026-08-05; hosted signing/notarization,
candidate assets, and draft creation remain NOT RUN; the MAC4 mandatory stop
is reached; MAC4-R fork rehearsal entry review complete and explicitly
authorized on 2026-08-05; its implementation, local automated verification,
and separate contract review are complete; the credentialed hosted run remains
NOT RUN; MAC5 remains proposed and unauthorized

Change class: D3 shared platform architecture, runtime distribution,
credential boundary, update protocol, and release automation. The exact
candidate and publication work in MAC4-MAC5 is additionally D4.

Risk: R3 for MAC1-MAC3 and R4 for MAC4-MAC5.

Owning documents: the active development roadmap retains milestone order and
the complete M3 acceptance gate. This specification owns the Apple Silicon
macOS 14+ implementation stream, its platform adapters, bundled Ark runtime,
R discovery, Apple Keychain integration, additive update artifact, and signed
DMG handoff. The accepted About/update specification retains channel,
allowlist, manifest-fetch, SemVer, and user-initiated-install policy. Existing
project, Workspace R, Agent R, approval, persistence, and scientific evidence
contracts remain authoritative.

Authorization evidence: after reviewing a decision-complete implementation
plan, the project owner requested "Implement the plan" on 2026-08-05. This
activated MAC1. After the MAC1 implementation checkpoint and evidence were
reported, the project owner requested "激活后续步骤" on 2026-08-05. Per the
one-package governance rule, this activated MAC2 only. After the MAC2
checkpoint was committed and its evidence reported, the project owner
requested "激活 MAC3" on 2026-08-05. This activates MAC3 only after the entry
review recorded below. The project owner then confirmed "允许开始 MAC3 实现和验收"
on 2026-08-05. MAC4 and MAC5 still require their own entry-condition review and
recorded authorization amendment before product-code work starts. After the
MAC3 checkpoint and evidence were committed, the project owner requested
"开始完成MAC4" on 2026-08-05. This activates MAC4 only under the entry review
and mandatory stop recorded below; MAC5 remains unauthorized. After the MAC4
implementation was pushed for upstream review, the project owner identified
that the main repository requires pre-merge hosted build evidence and then
approved the bounded fork rehearsal proposal with "行，那就这样做吧" on
2026-08-05. This activates MAC4-R only; it does not authorize a fork Release,
an authoritative candidate, MAC5 acceptance, or publication.

Mandatory stop: implement MAC4's additive update schema, synchronized
`0.4.0-dev.1` candidate identity, deterministic evidence tooling, parallel
Windows/macOS candidate build, signed/notarized macOS packaging, immutable
draft-release assembly, and separately gated publish workflow; run all locally
available validation and record every hosted secret/signing/draft gate that was
not run; reconcile NEWS and contracts; then stop before MAC5 exact-candidate
installed acceptance, acceptance-evidence upload, release publication, or live
Pages acceptance.

MAC4-R mandatory stop: add a repository-bound, artifact-only rehearsal lane;
prove its positive and negative admission contract locally; push it to the fork
default branch; run one exact-commit Windows/macOS hosted rehearsal using the
fork repository secrets; record the run, artifact hashes, and any failure
truthfully; then stop. Do not create a Git tag or Release, do not promote fork
artifacts into the main candidate, and do not activate MAC5.

## Goal And Success Criteria

Deliver Rho as a public, Developer-ID-signed and Apple-notarized direct-download
DMG for Apple Silicon Macs while preserving Windows x64 behavior and the same
Workspace/Agent ownership boundaries.

The first candidate is `0.4.0-dev.1`. It supports macOS 14 or later, arm64 R
4.4 or later, and an arm64 Ark 0.1.252 sidecar. It is developed in
`YuLab-SMU/Rho_for_mac`, reviewed into `YuLab-SMU/Rho`, and released only by the
main repository through GitHub Releases and the Rho website.

Success requires all of the following facts to be recorded separately:

- platform-neutral desktop code and configurations build on Windows and macOS;
- the installed app runs its bundled arm64 Ark with a selected arm64 R;
- macOS integration, Keychain, keyboard, files, Git, Quarto, and recovery
  behavior pass the affected workflow matrix;
- the exact DMG passes signature, notarization, staple, Gatekeeper, clean
  install, quarantine, upgrade/reinstall, and uninstall acceptance;
- the same published candidate retains the supported Windows x64 artifact;
- a D4 checklist records an explicit GO before the draft release and update
  site become public.

## Decisions And Non-goals

- Architecture: Apple Silicon only for this candidate. Intel x64 and Universal
  Binary remain open M3 work.
- Minimum OS: macOS 14.0.
- Distribution: direct DMG from GitHub Releases and the Rho website. No Mac App
  Store and no App Sandbox.
- Signing: Developer ID Application, hardened runtime, minimal entitlements,
  App Store Connect API-key notarization, and stapling are mandatory for public
  release. No identity is hard-coded in the repository.
- R support: retain the existing R 4.4 minimum and test the implementation-time
  current stable R as well. The first candidate accepts arm64 R only.
- Updates: discovery and redirect only. No background installer download,
  automatic replacement, delta update, or silent restart.
- No new public Workspace protocol, persistence schema, approval lane, shell
  execution authority, remote execution, or scientific behavior is introduced.
- Linux, Intel macOS, App Store packaging, automatic update installation, and
  executing user shell startup files are out of scope.

## Compatibility And Ownership

### Desktop configuration

The base Tauri configuration contains only cross-platform identity, frontend,
window, security, and shared bundle metadata. Tauri's platform files own bundle
targets, platform resources, and platform icons:

- Windows retains NSIS, WebView2 loader, current Ark resources, and `.ico`/PNG
  icons in `tauri.windows.conf.json`.
- macOS uses app and DMG targets, an `.icns` icon, minimum system version 14.0,
  hardened runtime, and a minimal entitlement file in
  `tauri.macos.conf.json`.

MAC1 does not bundle Ark or produce a distributable candidate. It creates a
buildable platform boundary and uses generated RGBA icon inputs so the Tauri
macro and packaging configuration can be validated on arm64 macOS.

### Runtime and environment

MAC2 adds `macos-arm64` to the project-owned Ark runtime manifest. Ark 0.1.252
is downloaded from its pinned release, verified against SHA-256
`aa1186f6e1ad271abaf246fd76e0aa9039cdeeff2cb52147e8887060afd5fb07`, checked
for arm64 Mach-O architecture, and staged as
`binaries/ark-aarch64-apple-darwin`. Generated runtime binaries remain ignored;
the manifest, bootstrap script, license handling, and configuration are
tracked.

The installed app locates Ark beside the macOS app executable and retains the
existing Windows resource lookup. The existing Rust/Jet kernel launch path
remains authoritative; no Tauri shell plugin is added.

Rscript discovery order is:

1. a valid persisted user selection;
2. `RHO_RSCRIPT`;
3. `/Library/Frameworks/R.framework/Resources/bin/Rscript`;
4. `/Library/Frameworks/R.framework/Versions/Current/Resources/bin/Rscript`;
5. a deterministic search of the application child-process PATH.

The probe returns version, architecture, R home/bin, path separator, libraries,
and effective startup-file paths. R below 4.4 is rejected. Non-arm64 R is
rejected with stable recovery code `R_ARCH_MISMATCH`, without modifying the R
installation or user files.

The child-process PATH merges, in order, inherited entries, selected R bin,
`/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`, `/usr/sbin`,
`/sbin`, and an existing `~/.local/bin`. Native path APIs deduplicate entries.
No shell or shell startup file is executed. Ark kernelspec, supervised Git,
Agent R, and Quarto discovery consume this environment.

Jet's existing Unix process group, signal interrupt, watchdog, and shutdown
semantics remain authoritative. MAC2 may add only a narrow
`ArkSession::terminate_process_group()` recovery wrapper for the existing
desktop `Arc::try_unwrap` failure path: SIGTERM, bounded wait, then SIGKILL.

### macOS integration and credentials

MAC3 maps safe external navigation and log-directory opening to macOS `open`,
uses `HOME` only as a platform fallback before canonical project validation,
and removes Windows executable names from macOS-facing picker and recovery
copy. It does not change canonical project identity or containment rules.

The existing keyring abstraction uses Keyring 4.1.6's `v1` Apple native
Keychain store on macOS. Stable provider IDs, precedence, size bounds,
redaction, Agent-only injection, idempotent delete, and `.Renviron`
compatibility remain unchanged. No Keychain entitlement or sharing group is
added for the non-sandboxed direct-download app. Default automated tests use
an injected credential store; a native Keychain smoke is explicit, isolated,
and cleanup-bound so routine tests never alter a developer credential.

The basic editor recognizes Command+Enter on macOS. Monaco uses Command for
command-or-control actions and Command-click definition navigation. Windows
Ctrl behavior remains unchanged. Browser/mock mode gains an explicit,
deterministic macOS fixture; it never infers platform behavior from a developer
machine.

### Update manifest

MAC4 keeps `schema_version: 1` and adds optional
`artifacts.macos_aarch64` with the same `url`, lowercase 64-character
`sha256`, and positive byte `size` fields as the Windows artifact. Existing
Windows clients may ignore the additive field. New clients select the current
platform artifact; a valid feed without one returns recoverable
`UPDATE_PLATFORM_UNAVAILABLE` and never blocks startup.

All existing response limits, timeouts, SemVer/channel rules, text rendering,
and Rho/GitHub URL allowlists remain unchanged. Notarization is release
evidence, not a manifest boolean. A published asset is never silently replaced
under the same version.

## Work Packages

### MAC1: Platform-neutral build shell — authorized

- split shared, Windows, and macOS Tauri configuration ownership;
- generate RGBA application icons and an `.icns` without changing product
  branding;
- configure macOS app/DMG metadata, macOS 14 minimum, hardened runtime, and
  minimal entitlements;
- add the smallest platform helpers needed for safe URL/directory opening and
  platform-appropriate default project fallback, with unit tests;
- remove macOS build-time references to Windows-only dependencies while
  preserving the existing Windows target configuration;
- prove macOS desktop check and configuration merge, plus Windows
  cross-configuration validation where the local toolchain permits it.

Exit gate: MAC1 diff contains no Ark bootstrap, R discovery, Keychain, update
schema, signing workflow, version bump, NEWS claim, or release publication.

### MAC2: Bundled Ark and arm64 R vertical slice — authorized 2026-08-05

Entry review:

- MAC1 is committed as `e4a3196`; its macOS configuration, desktop/workspace
  tests, arm64 debug build, independent review, version decision, and NO-GO
  release status are recorded above.
- The worktree was clean at activation and contained no unrelated user changes.
- Ark 0.1.252 remains the project-pinned runtime. The macOS arm64 archive and
  exact SHA-256 named in this contract are the only authorized new runtime
  input. The pinned GitHub HTTPS URL may follow HTTPS-only release-asset
  redirects, but the result is accepted only after the exact hash and arm64
  Mach-O checks pass; alternate versions, universal/x64 archives, manifest
  overrides, and unverified local binaries are rejected.
- Existing Jet process groups/watchdog, broker project identity, Workspace R
  authority, Agent R separation, R 4.4 minimum, and user startup-file policy
  are unchanged entry constraints.
- MAC2 may change only runtime manifest/bootstrap/lookup, R discovery/probe,
  deterministic child PATH/kernelspec environment, bounded Unix fallback
  cleanup, their tests, and browser/mock state strictly required to keep a new
  desktop runtime command truthful. MAC3-MAC5 surfaces remain out of scope.

- add pinned Ark manifest/bootstrap/sidecar and installed/development lookup;
- implement R discovery, architecture/version validation, deterministic PATH,
  and platform-correct kernelspec environment;
- close Unix shutdown recovery without changing Jet launch authority;
- demonstrate editor-to-Workspace R execution, interrupt, restart, crash
  recovery, and absence of orphan process groups.

Exit gate: a tracked Ark binary is forbidden; the ignored staged sidecar must
be reproducible from the pinned manifest. The debug app must launch the bundled
arm64 Ark with arm64 R 4.4+ and recover truthfully from missing Ark, checksum or
architecture failure, missing/old/x86 R, interrupt, shutdown, and crash. Stop
after MAC2 review even if MAC3 appears mechanically adjacent.

### MAC3: System integration and UI parity — authorized 2026-08-05

Entry review:

- MAC2 is committed as `8cb1a85`; its pinned Ark/R runtime, full Rust
  workspace evidence, arm64 bundled-app smoke, baseline observations, version
  decision, and NO-GO release status are recorded below. The worktree was
  clean at MAC3 activation and contained no unrelated user changes.
- Keyring 4.1.6 is already the Windows credential library. Its documented
  `v1` feature selects Apple native Keychain Services on macOS; MAC3 may add a
  macOS-target dependency and resulting target-specific lockfile entries, but
  no second credential library, Tauri credential plugin, entitlement, access
  group, shared vault, or secret migration.
- The active system-credential contract retains service `Rho Agent LLM`,
  stable provider-profile account IDs, the 16 KiB limit, stored-over-
  `.Renviron` precedence, Agent-only child injection, presentation redaction,
  replace/delete recovery, and unavailable/fallback truth. MAC3 changes only
  the production macOS adapter and macOS acceptance evidence.
- MAC1's allowlisted, no-shell `platform.rs` open/reveal adapter remains the
  native navigation authority. MAC3 may make R picker titles, filters, paths,
  and recovery copy platform-correct and exercise the existing adapter from
  the UI; it may not add arbitrary shell, URL, directory, or file authority.
- UX-KEYS-1 retains command routing and editor-action semantics; accepted WS2
  retains definition lookup/navigation. MAC3 adds only Command equivalents to
  the existing basic-editor execution and Monaco definition gestures while
  retaining Windows Ctrl behavior. Platform state comes from the desktop
  descriptor or an explicit mock query fixture, never `navigator.platform` or
  the developer machine.
- BH1/BH2 retain normalized project identity, containment, switching,
  rollback, and two-project truth. Watcher, Git, Quarto, panel, and Agent work
  in MAC3 are regression/installed-bundle validation of existing contracts,
  not new workflow or execution authority.
- MAC2's four `rho.bridge` observations are bounded entry gates. The macOS
  `/private/var` alias requires canonical-path comparison in the test only.
  The escaped local lockfile path is an implementation defect against the
  active WS1-L2 requirement that detail be shown only when the source is
  provably inside the project; its owner and behavior remain WS1-L2, and MAC3
  may only restore that contract with regression coverage. Bioconductor
  fixture provenance must be validated independently of the packages installed
  on the test machine; fixture viewer semantics remain unchanged.
- MAC3 is one R3 vertical slice. It may touch the target-specific Keychain
  adapter, platform-facing runtime copy/dialog behavior, Command gestures,
  explicit macOS mock fixture, the three bounded baseline repairs, focused
  regression tests, and this package's evidence documents. It may not change
  schema, project ownership, approval lanes, public protocol, runtime launch
  authority, scientific semantics, update feeds, signing, versions, NEWS, or
  release workflows.

Implementation scope:

- activate Apple Keychain through the existing credential abstraction, with
  injected-store automated coverage and an opt-in cleanup-bound native smoke;
- complete native open/dialog/log behavior and macOS recovery copy;
- add Command shortcuts, Command-click, and deterministic macOS mock parity;
- repair the three bounded cross-platform test/containment gates without
  redefining their owning product contracts;
- validate project paths, watching, Git, Quarto, panels, Agent, and
  two-project isolation from an unsigned installed development app bundle.

Exit gate: Keychain success, replacement, deletion, missing-delete,
provider-isolation, backend-failure, rollback, precedence, Agent-only
injection, redaction, and cleanup evidence pass without a real provider secret
in automation. macOS labels, picker filters, recovery copy, safe open/reveal,
Command gestures, and deterministic mock fixtures pass while Windows behavior
remains covered. The complete affected Rust workspace, `rho.agent`,
`rho.bridge`, frontend/mock, two-project, and platform regression matrix passes
or every unavailable runner is recorded truthfully. A launched app bundle
passes spaces/Unicode/symlink project paths, watching, Git, Quarto, panels,
Agent credential projection, and recovery; it is not a signed candidate,
clean-install, quarantine, update, or release acceptance. Stop after MAC3
review even if MAC4 appears mechanically adjacent.

### MAC4: Signed candidate and additive update publication — authorized 2026-08-05

Entry review:

- MAC3 is committed as `94aabf1`; its Keychain/UI/bridge implementation,
  complete affected automation, final arm64 app smoke, isolated development-app
  acceptance, version decision, and NO-GO release state are recorded below.
  The worktree was clean at MAC4 activation and contained no unrelated user
  changes.
- This package is D4/R4 because it changes candidate identity, release
  evidence, signing/notarization, GitHub Release draft creation, and update-site
  publication inputs. The new exact-candidate checklist is
  `docs/release/active-0.4.0-dev.1-candidate-checklist.md`; the old `0.2.0`
  checklist and `rho-0.2-release.json` remain authorities for their own
  candidate and are not reused as MAC4 acceptance.
- The accepted About/update design retains schema version 1, endpoints,
  channels, SemVer, bounds, allowlists, and user-initiated redirect behavior.
  MAC4 may add optional `artifacts.macos_aarch64` data and multi-platform page
  projection. Existing Windows-only manifests stay valid and Windows remains a
  required artifact for the new cross-platform candidate.
- GitHub's current standard Apple Silicon label is `macos-26`, not
  `macos-26-arm64`. The runner image provides Xcode 26.6 at
  `/Applications/Xcode_26.6.app`; the workflow must select that exact developer
  directory and fail if `xcodebuild -version` does not report 26.6.
- Tauri consumes `APPLE_API_ISSUER`, `APPLE_API_KEY`, and a filesystem path in
  `APPLE_API_KEY_PATH`. GitHub stores the base64 `.p8` content in
  `APPLE_API_PRIVATE_KEY`; the workflow writes it under `RUNNER_TEMP`, exports
  the real temporary path, and removes it in an unconditional cleanup step.
  Treating secret content as the path variable is forbidden.
- Candidate construction and publication are separate authorities. MAC4 may
  create a draft prerelease only after both platform jobs and aggregate
  evidence validate. The publish workflow may only flip an existing immutable
  draft after MAC5 uploads bounded GO acceptance evidence matching the same
  version, tag, commit, asset names, sizes, and hashes. MAC4 never publishes.
- A tag/version is single-use. Candidate assembly fails if any release with the
  same tag already exists, never deletes or replaces release assets, and uses a
  new version after withdrawal or failed accepted-candidate replacement.
- MAC4 may update Cargo/Tauri/frontend/cache-busting identities to
  `0.4.0-dev.1` and add truthful NEWS only after implementation verification.
  R package versions remain independent and unchanged because their exported
  contracts do not change.

- amend the accepted About/update implementation and generator for
  `macos_aarch64`;
- create a D4 `0.4.0-dev.1` exact-candidate checklist;
- replace immediate single-platform publication with parallel candidate build
  jobs that create a draft release, followed by a separate verified publish
  workflow;
- pin the hosted runner to `macos-26` and Xcode 26.6; import a Developer
  ID `.p12` into a temporary keychain, notarize through App Store Connect API
  credentials, staple, and emit checksums and evidence;
- synchronize Cargo, Tauri, and frontend versions to `0.4.0-dev.1` only after
  MAC1-MAC3 review, then add truthful NEWS entries.

Required CI secret interfaces are `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `KEYCHAIN_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_TEAM_ID`, `APPLE_API_ISSUER`,
`APPLE_API_KEY`, and `APPLE_API_PRIVATE_KEY`. The workflow alone sets
`APPLE_API_KEY_PATH` to its temporary `.p8` file. Secret values and local
keychain/key paths never enter logs, artifacts, manifests, or repository files.

The cross-platform draft contains:

- `Rho_0.4.0-dev.1_x64-setup.exe` and its `.sha256` sidecar;
- `rho-0.4.0-dev.1-windows-x86_64-evidence.json`;
- `Rho_0.4.0-dev.1_aarch64.dmg`;
- `Rho_0.4.0-dev.1_aarch64.dmg.sha256`;
- `rho-0.4.0-dev.1-macos-aarch64-evidence.json`;
- `rho-0.4.0-dev.1-candidate-evidence.json`, binding both platform records to
  one version, tag, commit, asset set, sizes, and hashes.

Exit gate: deterministic tests reject malformed identity, missing platforms,
duplicate names, stale/foreign evidence, checksum/size mismatches, draft input
to Pages, and publish attempts without exact MAC5 GO evidence. Local unsigned
DMG builds may validate configuration but are never reported as signed. Hosted
Developer ID signing, notarization, stapling, Gatekeeper checks, draft creation,
and uploaded hashes are separate facts and remain `NOT RUN` until a credentialed
workflow creates the exact draft. Stop after MAC4 implementation/review and any
available draft evidence; do not perform MAC5 acceptance or publish the release.

### MAC4-R: Fork-only signed rehearsal — authorized 2026-08-05

Problem and evidence: the first upstream review requires hosted cross-platform
build evidence before merge, while GitHub does not expose repository secrets to
an upstream pull-request job and manual dispatch requires the workflow to exist
on the repository default branch. Running the current candidate mode in the
fork would create a misleading draft whose source repository contradicts the
exact-candidate checklist.

Contract:

- `workflow_dispatch` gains one required choice input, `build_mode`, whose safe
  default is `rehearsal`; accepted values are only `rehearsal` and `candidate`;
- `rehearsal` is admitted only when `github.repository` is exactly
  `YuLab-SMU/Rho_for_mac`; `candidate` is admitted only when it is exactly
  `YuLab-SMU/Rho`; every other mode/repository pairing fails in the identity
  job before a platform build uses credentials;
- the selected workflow ref and repository default branch must both be `main`,
  and the requested source ref must resolve to the current default-branch HEAD.
  Every checkout disables persisted Git credentials. This prevents a manual
  run from redirecting Apple secrets into unreviewed branch code;
- both modes resolve and check out one full commit and run the same Windows x64
  and signed/notarized macOS arm64 platform jobs. Secret names, temporary-file
  handling, unconditional Keychain cleanup, and platform evidence remain the
  MAC4 contract;
- candidate mode alone may run the `contents: write` draft-assembly job.
  Rehearsal mode has `contents: read`, never creates or mutates a tag, Release,
  Pages state, environment, issue, pull request, or repository content;
- rehearsal mode downloads both platform artifacts, runs the normal aggregate
  validator only as an internal consistency check, discards candidate aggregate
  output, and uploads one 14-day Actions artifact containing the six platform
  files plus bounded `rho_candidate_rehearsal_evidence`;
- rehearsal evidence binds status, source repository, version, release tag,
  full commit, GitHub run ID and attempt, both platform artifact names, sizes,
  hashes, and platform-evidence hashes. It contains no credential, runner path,
  Keychain path, API-key path, or unbounded log;
- rehearsal artifacts and evidence are review-only. The candidate workflow in
  `YuLab-SMU/Rho` must rebuild both platforms and may not ingest, promote, copy,
  or publish them. MAC5, publish admission, and update-site generation reject
  the rehearsal evidence type by construction.

Failure and recovery:

- missing/invalid secrets, checkout drift, platform failure, signing failure,
  notarization failure, cleanup failure, missing platform, malformed evidence,
  or checksum/size mismatch prevents final rehearsal evidence;
- Actions may retain a successfully uploaded platform input when a sibling job
  later fails, but such partial artifacts have no aggregate rehearsal record and
  therefore are not passing evidence;
- a retry is a new run attempt bound into new evidence. It does not delete or
  replace a release because rehearsal has no release permission or mutation.
  Intermediate platform artifact containers are scoped to the GitHub Run ID
  and may be replaced within that Run; the final rehearsal artifact includes
  both Run ID and Attempt and is never overwritten by a later attempt;
- cancellation still executes the existing unconditional Apple credential
  cleanup step. Absence of final rehearsal evidence is reported as failure or
  cancellation, never success.

Verification and exit gate:

- deterministic tests cover safe-default mode, exact repository guards,
  least-privilege rehearsal assembly, candidate-only write permission, no
  Release step in rehearsal, 14-day retention, exact seven-file artifact, and
  rejection of malformed/foreign/stale/oversized rehearsal evidence;
- the hosted exit requires both platform jobs and the aggregate rehearsal job
  to pass for one exact fork commit, followed by recording the run URL, artifact
  identity, and hashes in this active document and the pull request;
- application and R package versions remain unchanged and `NEWS.md` is not
  amended because this is an internal review-evidence lane with no user-visible
  application or package contract change;
- stop after recording rehearsal evidence. A main-repository draft remains a
  separate MAC4 fact, the release decision remains `NO-GO`, and MAC5 remains
  unauthorized.

### MAC5: Exact-candidate acceptance and publication — proposed

- bind automated and human evidence to the exact tag, commit, assets, sizes,
  and hashes in the draft release;
- complete clean macOS 14 and current-macOS installed acceptance with R 4.4
  and the current stable R;
- verify signature, notarization, staple, Gatekeeper, quarantine launch,
  reinstall/upgrade/uninstall, core scientific workflow, and recovery;
- publish from the main repository only after an explicit D4 GO; update Pages
  only from a published release, never a build-complete or draft event.

Rollback preserves evidence: withdraw the macOS update-site entry and mark the
prerelease withdrawn. Do not replace a same-version asset; use a new candidate.

## Verification Contract

### MAC1 focused evidence

- JSON/config validation proves the base config has no platform resources,
  Windows retains NSIS/current resources, and macOS owns app/DMG, minimum 14.0,
  hardened runtime, entitlements, and `.icns`;
- all PNG bundle icons report RGBA and the `.icns` is a valid Apple icon file;
- platform helper tests cover supported command selection, URL allowlist
  preservation, HOME fallback, missing HOME, spaces, and Unicode;
- `cargo check -p rho-desktop` passes on Apple Silicon;
- `cargo fmt --all -- --check`, focused tests, frontend syntax, configuration
  validation, and `git diff --check` pass;
- Windows target/config regression is run in CI or explicitly recorded as
  unrun locally, never inferred from macOS results.

### MAC3 focused evidence

- injected credential-store tests cover success, replacement, deletion,
  missing delete, provider isolation, validation, backend failure,
  metadata/credential rollback, `.Renviron` fallback and precedence, Agent-only
  process injection, and proof that secrets never enter persisted settings,
  runtime profiles, command arguments, diagnostics, events, logs, or mock
  responses;
- an opt-in serial native-Keychain smoke uses a unique MAC3 service/account,
  proves set/get/replace/delete, and verifies cleanup even on failure; it is
  never part of default automation and never uses a real provider credential;
- platform tests cover macOS R picker title/filter, missing/old/wrong-arch R
  copy, safe product URL and log reveal, spaces/Unicode paths, missing HOME,
  and unchanged Windows command selection/copy;
- frontend tests cover basic-editor Command+Enter and Command+Shift+Enter,
  Monaco Command-click, existing command-or-control shortcuts, Ctrl regression,
  input/dialog ownership, and an explicit deterministic macOS mock fixture;
- `rho.bridge` regressions cover canonical temporary-directory equality,
  local-source containment including `..`, sibling-prefix, absolute, missing,
  Unicode, and symlink cases, and fixture provenance checks independent of
  locally installed Bioconductor versions;
- the affected Rust workspace, both affected R packages, frontend/mock suites,
  configuration/syntax checks, `git diff --check`, and available Windows
  regression run before completion;
- unsigned app-bundle acceptance exercises spaces, Unicode, symlinks, project
  watching, supervised Git and Quarto discovery, editor/Console/Environment/
  Viewer/Plots/Problems/Agent panels, two-project isolation, Keychain status,
  interrupt/restart/failure recovery, and post-test Keychain/process cleanup.

### MAC4-MAC5 evidence

- R discovery precedence, persisted/invalid/missing R, R 4.3 rejection, arm64
  acceptance, x86 mismatch, Unicode/space paths, PATH bounds and no-shell
  execution;
- Ark missing/checksum/architecture/bootstrap failures, sidecar lookup, smoke
  execution, interrupt/shutdown/crash recovery, and no orphan process group;
- update compatibility fixtures for Windows-only and two-platform feeds,
  missing current artifact, malformed metadata, untrusted URL, and tampered
  checksum/evidence;
- complete affected Rust workspace, R package, frontend/mock, two-project,
  Windows regression, and installed-app workflow suites;
- release checks use `codesign --verify --deep --strict --verbose=4`, `spctl`,
  notarization result inspection, and `xcrun stapler validate` against the exact
  candidate.

## Version, Documentation, And Release State

MAC1-MAC3 remain `0.4.0-dev.0` and are not distributable candidates. They do
not change exported R package behavior, so no R package bump is expected.
`NEWS.md` is unchanged until reviewed user-visible behavior enters MAC4's
candidate.

This document stays active after code lands while later packages, installed
acceptance, or release gates remain open. The roadmap may record implementation
presence only after the corresponding evidence exists. Neither a local build,
an unsigned DMG, automated tests, nor a notarized draft alone constitutes M3
acceptance or release GO.

## MAC1 Implementation Evidence — 2026-08-05

Implementation present:

- Tauri base configuration is platform-neutral; Windows retains its existing
  NSIS, WebView2, Ark resource, and icon inputs in the Windows platform file;
  macOS owns app/DMG, macOS 14.0, hardened runtime, minimal entitlements, and
  `.icns` configuration in the macOS platform file.
- Existing brand artwork was regenerated as RGBA PNG, ICO, and ICNS assets.
  Pixel/color inspection and a composited visual review confirmed the teal
  field and white R were preserved.
- Safe product URL validation remains in the update boundary. A tested platform
  command adapter now maps validated navigation and log reveal to
  `explorer.exe`, macOS `open`, or `xdg-open` without invoking a shell.
- Windows keeps its existing `D:\Rho`/`USERPROFILE` default behavior. macOS
  uses `HOME/Documents/Rho` before the unchanged project normalization and
  containment boundary. Missing-home, spaces, and Unicode cases are covered.
- The previously Windows-only symlink security fixture now uses the native
  Windows or Unix API, allowing the same escape regression to run on macOS.
  Non-Windows no-op console helpers no longer emit unused-parameter warnings.

Automated evidence passed:

- `node scripts/test-desktop-platform-config.mjs`;
- `node --check desktop/dist/app.js`;
- `plutil -lint desktop/src-tauri/Entitlements.plist`;
- `cargo fmt --all -- --check`;
- focused platform and default-project-root tests: 6 passed;
- `cargo test -p rho-desktop`: 109 passed;
- `cargo check -p rho-desktop`;
- `cargo test --workspace`: all workspace and documentation tests passed;
- Tauri CLI 2.11.4 arm64 debug build with `--no-bundle`;
- Tauri CLI 2.11.4 arm64 debug app bundle build;
- the resulting local debug executable is Mach-O arm64 and its app metadata
  reports `LSMinimumSystemVersion` 14.0 and identifier `org.yulab.rho`;
- `git diff --check`.

Independent contract review found no blocking ownership, security, or scope
deviation. It confirmed that Windows build/release scripts continue reading
shared product/version metadata while Tauri owns platform-file merging, and
that no Ark manifest, R discovery, Keychain backend, updater schema, workflow,
application/R-package version, or NEWS change entered MAC1.

Explicitly not run or not accepted:

- Windows compilation, NSIS packaging, and installed-app regression require a
  Windows runner and remain open evidence; static Windows configuration and
  command behavior tests passed locally.
- R package tests were not run because MAC1 changes no R source or package
  contract.
- The debug app has only the Rust linker's ad-hoc executable signature; bundle
  signing, notarization, stapling, Gatekeeper, clean-install, and runtime smoke
  acceptance are MAC4-MAC5 gates and are not claimed.

Version outcome: application remains `0.4.0-dev.0`, R package versions are
unchanged, and `NEWS.md` is unchanged. Release decision: NO-GO; MAC1 is a
reviewed development checkpoint, not a distributable candidate.

## MAC2 Implementation Evidence — 2026-08-05

Implementation present:

- `runtime/ark.json` pins the official Ark 0.1.252 macOS arm64 archive and
  lowercase SHA-256. The macOS bootstrap accepts only the repository manifest,
  uses HTTPS-only redirects, verifies the hash before extraction, requires the
  expected binary plus license and notice, validates arm64 Mach-O, stages the
  Tauri target-triple sidecar atomically, and leaves generated runtime inputs
  ignored.
- Tauri packages the sidecar beside the app executable as `ark` and installs
  Ark's `LICENSE` and `NOTICE` under app resources. Installed lookup prefers
  that sibling; development lookup falls back to the ignored staged sidecar.
  Existing Windows resource paths and x64 discovery behavior remain present.
- R discovery now follows the authorized persisted selection, `RHO_RSCRIPT`,
  standard macOS framework locations, and deterministic child PATH order. The
  probe records R home/bin, architecture, native path separator, version,
  libraries, and effective startup-file paths. Apple Silicon rejects non-arm64
  R with stable code `R_ARCH_MISMATCH`; R 4.4 remains the minimum.
- Kernelspec, supervised Git, and Agent R processes consume the same native,
  deduplicated child PATH without invoking a shell. The runtime cache moved to
  version 2 so older records cannot omit architecture or R-bin evidence.
- The desktop's exceptional shared-`Arc` shutdown path now delegates to a
  narrow Unix Ark process-group fallback: SIGTERM, one-second bounded wait,
  then SIGKILL. Jet remains the sole launch, interrupt, watchdog, and ordinary
  shutdown authority.
- The desktop smoke path now uses the platform sidecar, verifies an interrupt
  followed by successful execution, retains the existing two-project and
  graceful-restart checks, kills one Ark process group to simulate failure,
  and proves a fresh Ark session can execute afterward.

Automated and local runtime evidence passed:

- `bash -n scripts/bootstrap-ark-macos.sh scripts/test-bootstrap-ark-macos.sh`;
- `scripts/test-bootstrap-ark-macos.sh`, covering checksum mismatch, missing
  Ark, and non-Mach-O architecture rejection;
- a real `scripts/bootstrap-ark-macos.sh` run against the pinned archive; its
  downloaded SHA-256 was
  `aa1186f6e1ad271abaf246fd76e0aa9039cdeeff2cb52147e8887060afd5fb07`,
  staged Ark reported `Ark 0.1.252`, and `file`/`lipo` reported arm64 Mach-O;
- `node scripts/test-desktop-platform-config.mjs` and
  `node --check desktop/dist/app.js`;
- `cargo fmt --all -- --check`, `cargo check -p rho-desktop`, focused kernel,
  Agent-environment, runtime-discovery, Ark-lookup, recovery-code, PATH, cache,
  and platform tests;
- `cargo test -p rho-desktop` and `cargo test --workspace`;
- `testthat::test_local('r/rho.agent')`;
- Tauri CLI 2.11.4 `--debug --bundles app --target
  aarch64-apple-darwin --no-sign` produced an arm64 debug `Rho.app` containing
  arm64 `rho-desktop`, arm64 Ark 0.1.252, and the Ark license/notice;
- the bundled app executable, with `RHO_RSCRIPT` unset, selected arm64 R 4.5.2
  from the standard framework and passed Workspace execution, Plot,
  Environment, paged Viewer, stale-view rejection, two-project isolation,
  interrupt/recovery, graceful restart, simulated crash/restart, and durable
  event smoke checks;
- after smoke exit, `pgrep` found no process whose command referenced the
  bundled `Rho.app/Contents/MacOS/ark`;
- `git diff --check`.

Separate contract review found no blocking ownership or scope deviation. The
implementation does not change public protocol, persistence schema, project
identity, approval lanes, credentials, frontend command state, update schema,
signing, publication, application/R-package version, or `NEWS.md`. The only
contract wording correction permits the pinned GitHub URL's HTTPS-only asset
redirect while retaining exact hash and architecture admission. Browser/mock
changes were unnecessary because no Tauri command or visible runtime-state
shape changed.

Explicitly open or not accepted:

- the local Rust installation has only the `aarch64-apple-darwin` target, so
  Windows compilation, Windows installed regression, and NSIS packaging were
  not run. Static Windows Ark lookup, R discovery, command behavior, and Tauri
  configuration tests passed; this is not equivalent to a Windows runner.
- an additional, non-affected `rho.bridge` full-suite run exposed four existing
  environment/fixture differences: macOS `/private/var` canonicalization, one
  escaped local-source expectation, and two installed Bioconductor versions
  newer than the checked-in fixture. No R source changed in MAC2, the actual
  embedded bridge passed the bundled-app smoke, and these results are not
  reported as passing. They remain a bounded MAC3 workflow-validation gate.
- network-dependent Agent model smoke was not run; deterministic tests prove
  the supervised Agent R command receives the child PATH without exposing its
  credential, and MAC2 does not claim provider/network acceptance.
- the debug app was intentionally unsigned and was not a DMG, release
  candidate, notarized artifact, clean install, or public distribution.
  Keychain, native UI parity, exact-candidate signing, update publication, and
  release acceptance remain MAC3-MAC5 work.

Version outcome: application remains `0.4.0-dev.0`, R package versions are
unchanged, and `NEWS.md` is unchanged. Release decision: NO-GO. The mandatory
MAC2 stop is reached. MAC3 was subsequently entry-reviewed and activated by
the authorization recorded above; MAC4 was later entry-reviewed and authorized
after the MAC3 stop. MAC5 remains inactive until its own entry review and
authorization record.

## MAC3 Implementation Evidence — 2026-08-05

Implementation present:

- macOS now enables keyring 4.1.6 with its Apple-native `v1` backend behind the
  existing credential-store abstraction. Production retains service
  `Rho Agent LLM`, stable provider-profile accounts, the 16 KiB bound,
  stored-over-environment precedence, Agent-only injection, redacted views,
  rollback behavior, and unchanged Windows production selection. No Keychain
  entitlement, access group, migration, project credential, or second store
  was added.
- the opt-in macOS Keychain test uses a unique service/account and cleanup
  guard to prove set, get, replace, delete, idempotent missing delete, and a
  final missing read without using a provider credential. Default tests still
  use injected memory/failure stores.
- R selection dialogs and recovery copy now use platform-owned `Rscript` or
  `Rscript.exe` names and filters. The existing no-shell open/reveal adapter
  remains the only native navigation authority.
- the basic editor accepts Command+Enter and Command+Shift+Enter, Monaco
  definition navigation accepts Command-click, and existing Ctrl behavior is
  retained. Browser mode uses only an explicit `platform=macos-aarch64`
  fixture; unknown or absent fixtures remain Windows and no navigator field is
  consulted.
- the three bounded bridge gates are repaired without changing their owners:
  lint test paths compare canonical roots; local lockfile labels resolve the
  nearest existing ancestor and reject `..`, sibling-prefix, absolute, and
  symlink escapes while retaining missing/Unicode paths inside the project;
  portable fixture provenance is checked independently from the developer's
  installed Bioconductor package versions.

Automated verification passed:

- `cargo fmt --all -- --check` and `cargo check -p rho-desktop`;
- `cargo test --workspace --no-fail-fast`; the desktop binary reported 121
  passed and one intentionally ignored native-Keychain test, and every other
  workspace unit and documentation test passed;
- the exact ignored native-Keychain test run reported one passed test and
  verified its cleanup-bound final missing read;
- `testthat::test_local('r/rho.agent')` reported 45 passed expectations and
  `testthat::test_local('r/rho.bridge')` reported 514 passed expectations; its
  focused workspace run reported 324 passed expectations;
- `node --check desktop/dist/app.js` and all 32 `scripts/test-*.mjs` suites,
  including the editor-shortcut and deterministic macOS-platform suites;
- Tauri CLI 2.11.4 `--debug --bundles app --target
  aarch64-apple-darwin --no-sign` produced `Rho.app`; `file` and `lipo`
  reported an arm64 Mach-O desktop executable linked to Apple's Security and
  WebKit frameworks;
- the standard `Rho.app` executable, with `RHO_RSCRIPT` unset, passed the
  complete bundled smoke including Workspace execution, Plot, Environment,
  Viewer, stale rejection, two-project isolation, interrupt, restart, crash
  recovery, and durable events;
- `git diff --check`.

Unsigned development-app acceptance passed with an acceptance-only product
name and bundle identifier so existing Rho application state was not reused.
The same built code opened a temporary Git project whose name contained spaces
and Unicode, displayed its canonical `/private/var` root, and excluded a
project symlink targeting outside the root. The installed UI then demonstrated:

- Workspace R 4.5.2 startup and `getwd()` at the canonical project root;
- explicit Quarto discovery at `/usr/local/bin/quarto` with version 1.8.27 and
  a truthful `Quarto ready` Environment projection;
- a Console-created data frame and Plot, Environment object projection,
  Outputs preview, Logs, and a zero-state Problems panel;
- creation and immediate file-tree observation of
  `mac3-watcher-研究.R`, Git projection as one untracked working change, and
  Command+Enter execution returning `42`;
- the Agent/model-settings surface's presentation-safe system-store wording
  and existing environment-source projection without displaying, entering, or
  transmitting a credential; no provider-network request was made;
- Workspace R restart from the UI followed by a return to `R idle`; the exact
  bundle smoke separately covered interrupt and crash recovery.

After the app quit, no process command referenced the acceptance bundle or its
Ark child. The isolated project, application support, cache, and preferences
were moved to Trash under explicit MAC3 acceptance names; existing Rho state
and an unrelated already-running Ark session were left untouched.

Separate contract review found no blocking ownership or scope deviation. The
implementation changes no public protocol, persistence schema, project or
approval authority, Workspace/Agent process ownership, update feed, signing,
release workflow, application/R-package version, or `NEWS.md`. The bridge
source change is the bounded WS1-L2 containment conformance repair authorized
at entry, and its exported package contract is unchanged. Cargo lockfile
content did not change because the Apple keyring transitive packages were
already resolved.

Explicitly open or not accepted:

- only `aarch64-apple-darwin` is installed locally, so Windows compilation,
  Windows installed regression, and NSIS packaging were not run. Static
  Windows platform, frontend fallback, and credential-selection regressions
  passed; this is not equivalent to a Windows runner.
- Command-click definition behavior is covered deterministically in frontend
  automation but was not claimed as a separate mouse-level manual result.
- no real provider-network Agent smoke was run and no real provider credential
  was written during UI acceptance; credential semantics are covered by
  injected tests and the isolated native-Keychain smoke.
- the development app was unsigned and is not a DMG, exact candidate,
  notarized artifact, quarantined clean install, upgrade/uninstall test, update
  publication, or public release.

Version outcome: application remains `0.4.0-dev.0`, R package versions are
unchanged, and `NEWS.md` is unchanged. Release decision: NO-GO. The mandatory
MAC3 stop is reached. MAC4 was subsequently entry-reviewed and authorized as
recorded above; MAC5 remains inactive until its own entry review and explicit
authorization are recorded.

## MAC4 Implementation Evidence — 2026-08-05

Implementation present:

- update schema version 1 now accepts and validates optional
  `artifacts.macos_aarch64` metadata without breaking Windows-only feeds. The
  Apple Silicon client reports stable `UPDATE_PLATFORM_UNAVAILABLE` when the
  current release has no Mac artifact; Windows admission retains its required
  Windows artifact. Rust tests cover both-platform success, legacy Windows
  compatibility, missing Mac, untrusted URL, hash, and size failures;
- the release-page generator accepts legacy `rho-0.2-release.json` evidence or
  exact cross-platform aggregate evidence. It validates tag, commit, channel,
  artifact names, URLs, sizes, hashes, and recognized platform keys, then
  renders platform-specific downloads without changing the redirect-only
  application update policy;
- `candidate-release.mjs` owns bounded platform, aggregate, acceptance, and
  publish-admission schemas. It recomputes local artifact/sidecar/evidence
  hashes, requires both platforms and exact source identity, caps evidence,
  and rejects missing/duplicate/foreign/stale, NO-GO, oversized, or
  content-mismatched inputs;
- `Build Rho Candidate / Rehearsal` resolves one full commit, runs parallel
  least-privilege Windows x64 and `macos-26` jobs, selects Xcode 26.6, stages
  the API `.p8` under `RUNNER_TEMP`, imports Developer ID credentials into a
  temporary Keychain, uses Tauri's App Store Connect variables, verifies
  notarization history/signature/staple/Gatekeeper/arm64/smoke gates, and
  unconditionally removes temporary Apple files and Keychain;
- draft assembly requires both platform jobs, rejects an existing tag or
  release, creates one draft prerelease, uploads the seven exact assets once,
  and re-reads names and sizes. It contains no asset deletion or replacement;
- `Publish Rho Candidate` is separately protected by environment
  `rho-release`. It downloads and re-hashes the exact draft, requires bounded
  MAC5 `status: passed` and `decision: GO` evidence matching aggregate SHA,
  version/tag/commit and the complete platform mapping, then performs only the
  draft-to-published state transition. It cannot build, upload, delete, rename,
  or replace assets;
- Pages automation now handles legacy or aggregate evidence only after a
  release is public, downloads and re-hashes both candidate platform-evidence
  assets, emits Windows and optional Apple Silicon downloads, and
  post-deployment checks every present recognized artifact. Draft construction
  cannot trigger Pages;
- application metadata, workspace lockfile packages, Tauri, frontend
  package/lockfile, browser mock, cache-busting, roadmap, and NEWS are
  synchronized at `0.4.0-dev.1`. R package versions remain unchanged because
  their exported contracts did not change.

Local automated and packaging evidence passed:

- candidate and update-site self-tests plus all 33 deterministic
  `scripts/test-*.mjs` suites and `node --check desktop/dist/app.js`;
- YAML parsing for all three affected workflows, shell syntax, Ark bootstrap
  checksum/missing/non-Mach-O failure fixtures, and `git diff --check`;
- `cargo fmt --all -- --check` and `cargo test --workspace --no-fail-fast`;
- complete `rho.bridge` and `rho.agent` testthat suites;
- Tauri CLI 2.11.4 release build with `--bundles app,dmg --no-sign --ci` on
  arm64 macOS 26.5.2 / Xcode 26.6 / R 4.5.2. The app metadata reports version
  `0.4.0-dev.1` and macOS 14.0 minimum; app and bundled Ark are arm64; the DMG
  mounted with `Rho.app`; and its bundled executable passed the complete
  Workspace smoke, including Viewer, stale rejection, two-project isolation,
  interrupt, restart, and crash recovery.

The local DMG was explicitly unsigned. Its locally observed bytes and hash are
not candidate evidence and are not recorded as a distributable identity.
Only `aarch64-apple-darwin` is installed locally and PowerShell is unavailable,
so Windows compilation/NSIS/smoke and the PowerShell metadata check are
`NOT RUN`; deterministic Windows contract/configuration tests passed but are
not a substitute for the hosted job.

No repository Apple secret, credentialed hosted run, signed/notarized artifact,
staple, Gatekeeper candidate assessment, candidate upload, aggregate hosted
evidence, GitHub draft, installed candidate, or Pages publication was created
or claimed. Local inspection found a developer signing identity, but MAC4 did
not use it because no exact App Store Connect notarization credential set was
provided and the contract forbids treating a partial local signature as a
candidate.

Post-test contract review found no blocking ownership, schema, policy,
persistence, authority, or sequencing deviation. The only implementation-time
correction was to build both `app,dmg`: Tauri cleans the app bundle after a
DMG-only build, while MAC4 must retain the app for exact architecture,
signature, Gatekeeper, and smoke checks. This stays inside the accepted bundle
targets and is statically enforced.

Version outcome: application is `0.4.0-dev.1`; R package versions are
unchanged; NEWS records the user-visible Mac and cross-platform update support.
Release decision: NO-GO. The MAC4 mandatory stop is reached. MAC5 remains
unauthorized, and no acceptance evidence upload, release publication, or live
Pages acceptance may proceed without its own activation.

## MAC4-R Local Implementation Evidence — 2026-08-05

Implementation present:

- the manual workflow has a safe-default `rehearsal` choice and uses the same
  complete Windows and signed/notarized macOS platform jobs for both modes;
- deterministic admission accepts only rehearsal/fork and candidate/main
  pairings, requires the workflow and source commit to be the current default
  `main`, and disables persisted credentials on all five checkouts;
- rehearsal aggregation has only `contents: read`, validates both platform
  inputs, deletes transient candidate aggregate evidence, and uploads exactly
  six platform files plus one bounded rehearsal record for 14 days;
- candidate draft assembly alone retains `contents: write` and is additionally
  guarded to `build_mode=candidate` in `YuLab-SMU/Rho`;
- rehearsal evidence has an exact schema, 256-KiB limit, fork repository, full
  source commit, Run ID/Attempt, and both platform artifact/evidence hashes.
  Candidate publish admission rejects it;
- credential cleanup now fails closed: the conditional always-run step removes
  and verifies absence of the temporary Keychain, `.p12`, and `.p8`, so final
  rehearsal evidence cannot follow an observed cleanup failure;
- intermediate artifact containers use Run-ID names and explicit v4 overwrite
  semantics for retry recovery, while final rehearsal artifacts are unique per
  Run Attempt.

Local automated evidence passed:

- `node scripts/candidate-release.mjs --test true`, including accepted and
  rejected repository/mode pairs, non-main workflow ref, foreign repository,
  invalid Run ID/Attempt, stale commit, output containment, byte budget, and
  candidate/publish type-confusion rejection;
- `node scripts/generate-update-site.mjs --test true`, all deterministic
  `scripts/test-*.mjs` suites, and JavaScript syntax checks;
- Ruby YAML parsing, actionlint 1.7.12, and `git diff --check` for the affected
  workflow and repository state.

The separate post-test review found no unresolved ownership, schema, secret,
permission, recovery, update, or release-authority conflict. The review added
the default-branch source guard and retry-safe intermediate artifact naming;
both corrections remain inside the authorized rehearsal boundary.

Version outcome: application and R package versions remain unchanged;
`NEWS.md` is unchanged because this lane is internal review tooling. Hosted
Windows build, credential import, Developer ID signing, notarization, stapling,
Gatekeeper, rehearsal artifact upload, and recorded hosted hashes remain
`NOT RUN` until the committed workflow is pushed to fork `main`. Release
decision remains NO-GO; MAC5 remains unauthorized.

# macOS Apple Silicon Support

Status: active; full direction authorized by the project owner on 2026-08-05;
MAC1 implementation, automated verification, and independent contract review
complete on 2026-08-05; MAC2 implementation, automated verification, arm64
debug-app runtime acceptance, and separate contract review complete on
2026-08-05; MAC3-MAC5 remain proposed and unauthorized

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
one-package governance rule, this activates MAC2 only. Every later package
still requires entry-condition review and a recorded authorization amendment
before product-code work starts.

Mandatory stop: complete MAC2's bundled Ark and arm64 R vertical slice,
affected automated verification, runtime recovery evidence, independent
contract review, and documentation reconciliation; then stop before Keychain,
frontend/macOS integration, updater, signing, candidate, or publication work.

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

The existing keyring abstraction uses the Keyring 4 Apple native Keychain
store on macOS. Stable provider IDs, precedence, size bounds, redaction,
Agent-only injection, idempotent delete, and `.Renviron` compatibility remain
unchanged. No Keychain entitlement or sharing group is added for the
non-sandboxed direct-download app.

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

### MAC3: System integration and UI parity — proposed

- activate Apple Keychain through the existing credential abstraction;
- complete native open/dialog/log behavior and macOS recovery copy;
- add Command shortcuts, Command-click, and deterministic macOS mock parity;
- validate project paths, watching, Git, Quarto, panels, Agent, and
  two-project isolation on an installed development app.

### MAC4: Signed candidate and additive update publication — proposed

- amend the accepted About/update implementation and generator for
  `macos_aarch64`;
- create a D4 `0.4.0-dev.1` exact-candidate checklist;
- replace immediate single-platform publication with parallel candidate build
  jobs that create a draft release, followed by a separate verified publish
  workflow;
- pin the hosted runner to `macos-26-arm64` and Xcode 26.6; import a Developer
  ID `.p12` into a temporary keychain, notarize through App Store Connect API
  credentials, staple, and emit checksums and evidence;
- synchronize Cargo, Tauri, and frontend versions to `0.4.0-dev.1` only after
  MAC1-MAC3 review, then add truthful NEWS entries.

Required CI secret interfaces are `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `KEYCHAIN_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_TEAM_ID`, `APPLE_API_ISSUER`,
`APPLE_API_KEY`, and `APPLE_API_KEY_PATH`. Secret values and local keychain
paths never enter logs, artifacts, manifests, or repository files.

Candidate assets are:

- `Rho_0.4.0-dev.1_aarch64.dmg`;
- `Rho_0.4.0-dev.1_aarch64.dmg.sha256`;
- `rho-0.4.0-dev.1-macos-aarch64-evidence.json`.

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

### Later-package evidence

- R discovery precedence, persisted/invalid/missing R, R 4.3 rejection, arm64
  acceptance, x86 mismatch, Unicode/space paths, PATH bounds and no-shell
  execution;
- Ark missing/checksum/architecture/bootstrap failures, sidecar lookup, smoke
  execution, interrupt/shutdown/crash recovery, and no orphan process group;
- Keychain backend success, replace/delete/isolation/failure/redaction and
  installed prompt behavior without real credentials in automated tests;
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
MAC2 stop is reached; MAC3-MAC5 remain inactive until their separate entry
review and authorization record.

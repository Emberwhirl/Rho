# Linux x64 AppImage Support

Status: proposed integration design; implementation not authorized

Date: 2026-08-11

Scope: Linux x64 AppImage distribution for the desktop application, a runtime
dependency check for the missing WebKitGTK 4.1 library, local and hosted build
lanes, and the Linux R discovery path.

Cross-reviewed against:

- `docs/project/active-development-roadmap.md` (M3 cross-platform beta;
  Linux x64 remains required before the full M3 gate closes);
- `docs/plans/active-2026-08-05-macos-arm64-support-spec.md` (the authorized
  macOS stream is the platform-adapter template; Linux follows the same
  configuration-ownership, runtime-manifest, R-discovery, and evidence model);
- `docs/implementation/implemented-windows-build-environment.md` (build and
  acceptance contract for the current Windows prototype);
- `docs/plans/proposed-2026-07-26-implemented-baseline-hardening-plan.md`.

Implementation entry rule: no product-code work begins before explicit
authorization. Each work package below requires a separate focused handoff and
its own acceptance gate, following the one-package governance rule.

## Summary

Rho is a Tauri 2 (Rust) desktop R workbench. Windows x64 is validated; macOS
arm64 is complete through MAC5 for its development candidate; Linux x64 is the
remaining required M3 platform. This proposal defines the Linux distribution
approach.

The project owner chose AppImage as the primary Linux distribution format
("方案一"), with one additional requirement: when the target machine lacks a
required system library (WebKitGTK 4.1), Rho must fail with a friendly,
actionable message telling the user which command installs the dependency —
rather than failing with an opaque dynamic-linker error.

Decisions recorded with the project owner on 2026-08-11:

- distribution: AppImage single-file portable package, primary path;
- build lanes: GitHub Actions hosted build (primary) and a local bash build
  script (development/debug), mirroring the Windows script pattern;
- support baseline: mainstream server distributions — Ubuntu LTS (22.04+) and
  RHEL-family servers, with the glibc implications documented below;
- `./configure; make; make install` is rejected: it is the GNU autotools model
  for C/C++ projects and does not apply to a Rust/Tauri application.

## Goals

This proposal will:

- produce a portable `Rho_<version>_x86_64.AppImage` that runs after
  `chmod +x`, without requiring `sudo` or a package manager;
- pin and bundle the Ark Linux x64 sidecar through the same manifest,
  checksum, and bootstrap discipline used on Windows and macOS;
- detect a missing `libwebkit2gtk-4.1.so.0` before the dynamic linker can fail
  the binary, and show the user the exact install command for their
  distribution;
- add Linux R discovery (Ubuntu paths, `/usr/lib/R`, conda, `RHO_RSCRIPT`
  override) consistent with the existing persisted-selection-first model;
- keep Windows x64 and macOS arm64 behavior unchanged.

## Non-Goals

This proposal does not authorize:

- a `.deb` / `.rpm` package lane (deferred until a user need exists);
- Linux arm64 AppImage (Ark `linux-arm64` asset exists; deferred);
- automatic update delivery for Linux (the update manifest remains
  redirect-only discovery);
- executing user shell startup files;
- any change to the Workbench Protocol, persistence schema, approval lanes,
  project identity, or scientific execution authority;
- replacing the local bash build lane with a Docker container in this round
  (Docker may be used inside CI only if the hosted runner cannot satisfy the
  dependency baseline).

## Technical Prerequisites (confirmed 2026-08-11)

All three were verified before this proposal was written:

1. **Ark Linux artifacts exist.** `gh release view 0.1.252 --repo
   posit-dev/ark` lists `ark-0.1.252-linux-x64.zip` (and `-linux-arm64.zip`).
   The exact SHA-256 must be captured from the release and pinned in
   `runtime/ark.json` under a new `linux-x64` key during LIN1.
2. **Tauri 2 natively bundles AppImage.** `tauri build` emits
   `.AppImage`; the build needs `libwebkit2gtk-4.1-dev` plus the documented
   Debian/Ubuntu package set. Tauri officially recommends Ubuntu 22.04 or
   Debian 12 as the oldest build base for glibc compatibility.
3. **WebKitGTK 4.1 is a runtime dependency that AppImage does not bundle.**
   AppImage bundles the application's own libraries, but WebKitGTK is large
   (100+ MB) and the webkit sub-processes (`WebKitNetworkProcess` etc.) still
   load system libraries at runtime. Clean machines fail with
   `WebKitNetworkProcess Not Found` or a missing `libwebkit2gtk-4.1.so.0`.

   **Detection placement constraint:** if `libwebkit2gtk-4.1.so.0` is absent,
   dynamic linking fails before `main()`. In-process Rust detection cannot
   trigger. The check must run in the AppImage `AppRun` wrapper, before
   `exec` of the Rho binary.

### glibc baseline decision

AppImage builds against the oldest supported base system. Ubuntu 22.04 ships
glibc 2.35 and provides `libwebkit2gtk-4.1-dev` from its standard repositories,
so it is the chosen build base. Consequence:

- supported: Ubuntu 22.04+, Debian 12+, and RHEL-family servers whose glibc is
  >= 2.35 (Rocky/Alma 9 satisfies this);
- excluded: Ubuntu 20.04 and earlier, Debian 11 and earlier, RHEL/CentOS/Rocky
  8 and earlier (glibc < 2.35).

This matches the chosen "mainstream server distributions" baseline and is
documented in the release notes so users on excluded systems are not surprised.

## Governing Architecture

```text
User downloads Rho_<version>_x86_64.AppImage
    |
    chmod +x; ./Rho_<version>_x86_64.AppImage
    |
AppRun wrapper (bash)                     <- dependency check lives here
    |  ldconfig -p | grep libwebkit2gtk-4.1.so.0
    |  missing -> friendly per-distro install hint; exit 1
    v
Rho binary (embedded frontend + Rust backend)
    |
    +-- bundled Ark linux-x64 sidecar (pinned, checksum-verified)
    +-- system R discovered via Linux path order (or RHO_RSCRIPT)
```

The AppRun wrapper is the only new entry point. It checks the required system
library, prints a bounded, distribution-specific install command when missing,
and otherwise `exec`s the Rho binary with the original arguments. The wrapper
must never silently install, download, or require network access.

## Work Packages

### LIN1: Ark linux-x64 manifest and bootstrap — requires authorization

- capture the exact `ark-0.1.252-linux-x64.zip` URL and SHA-256 from the
  posit-dev/ark release; add `linux-x64` to `runtime/ark.json`;
- add `scripts/bootstrap-ark-linux.sh`: downloads with checksum verification,
  stages `binaries/ark-x86_64-unknown-linux-gnu`, writes a Linux kernelspec with
  the resolved R home/bin/libraries and PATH (no user/site/project startup
  files, matching the Windows/Mac controlled-startup policy);
- reject non-x86-64 ELF binaries, missing license/notice, checksum mismatch,
  and alternate versions, with fixtures.

Exit gate: generated runtime binaries remain ignored; the pinned sidecar is
reproducible from the manifest; negative fixtures pass. No product code changes.

### LIN2: Linux build script and hosted workflow — requires authorization

Local lane (mirrors `build-windows-installer.ps1`):

- `scripts/build-linux.sh`: verifies prerequisites (Rust GNU target,
  `libwebkit2gtk-4.1-dev`, Tauri CLI 2.11.4), runs `prepare-runtime-resources`
  equivalent for Linux, invokes `npx "@tauri-apps/cli@2.11.4" build`, and emits
  the AppImage path plus SHA-256;
- reports the same required artifact facts as the Windows build report.

Hosted lane:

- a GitHub Actions job on `ubuntu-22.04` installing the documented dependency
  set, building the AppImage, computing `.sha256`, and uploading the artifact,
  wired into the existing candidate/rehearsal workflow shape where
  applicable;
- workflow must fail if the produced AppImage is not executable or its
  internal `AppRun` does not contain the dependency check from LIN3.

Exit gate: both lanes produce an AppImage containing the checked `AppRun` and
bundled Ark; artifact byte size and SHA-256 recorded.

### LIN3: AppRun dependency check with friendly hint — requires authorization

- replace the default AppRun of the generated AppImage with a bounded bash
  wrapper that:
  1. reads `/etc/os-release` to classify the distribution family
     (debian/ubuntu, rhel/fedora/rocky/alma, suse, arch — unknown families
     print a generic pointer);
  2. runs `ldconfig -p | grep -q libwebkit2gtk-4.1.so.0`;
  3. on absence, prints the exact install command for the detected family
     (e.g. `sudo apt install libwebkit2gtk-4.1-0` on Ubuntu/Debian,
     `sudo dnf install webkit2gtk4.1` on RHEL-family) and exits 1;
  4. otherwise `exec`s the Rho binary unchanged;
- the wrapper must be reproducible: deterministic tests assert the generated
  AppImage's AppRun contains the check, uses only `sh`-portable syntax, and
  prints expected hints for each os-release fixture without network access.

Exit gate: fixture-driven tests cover present/missing library, each supported
distribution family, unknown family, and argument passthrough. No silent
installation or download in the wrapper.

### LIN4: Linux R discovery — requires authorization

- R discovery order (Linux): persisted user selection, `RHO_RSCRIPT`,
  `/usr/lib/R/bin/Rscript`, `/usr/local/lib/R/bin/Rscript`, `/opt/...` conda
  paths as present, then the deterministic child-process PATH;
- reject R < 4.4 with a stable recovery code (reuse the existing
  `R_ARCH_MISMATCH`-style gate for x86-64 architecture);
- child-process PATH merges inherited entries, selected R bin, `/usr/local/bin`,
  `/usr/bin`, `/bin`; no shell startup files executed;
- the probe reports version, architecture, home/bin, path separator,
  libraries, and effective startup-file paths, matching the MAC2 contract.

Exit gate: unit and fixture coverage for present/missing/wrong-arch/old R,
PATH order, and no-shell guarantee.

### LIN5: Verification and acceptance — requires authorization

- complete the affected Rust workspace, `rho.agent`, `rho.bridge`, frontend/
  mock, and workflow contract suites;
- clean-machine manual acceptance on at least one supported distro
  (Ubuntu 22.04 or 24.04): install the documented dependency, run the
  AppImage, confirm Ark starts from the bundled sidecar, execute `x <- 1:5`,
  inspect in Environment, create a plot, switch projects, and quit cleanly;
- negative acceptance: on a machine without `libwebkit2gtk-4.1-0`, the
  AppRun hint appears and the app fails with the friendly message, never with
  a raw `libwebkit2gtk-4.1.so.0: cannot open shared object file` traceback;
- record artifact path, size, SHA-256, distro/glibc evidence, and skipped
  checks truthfully.

Exit gate: all above pass or every unavailable runner is recorded; release
decision is NO-GO until an explicit owner GO.

## Version, Documentation, And Release State

This proposal remains `proposed`. It changes no application version, R package
version, `NEWS.md`, or release status. Each LIN package must be separately
authorized; implementation may not start on any package before this contract
is renamed to `active-` and its entry review records the authorization. A
user-visible Linux release remains a separate later decision gated by the M3
roadmap acceptance gate.

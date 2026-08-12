# Rho 0.4.0-dev.37 Source And Windows Issue #33 Acceptance Checklist

Status: active replacement source contract; the five original installed Issue
#33 scenarios passed on `dev.36`; the Monaco watcher evidence predicate is
corrected to observe actual background-document reload and project revision;
exact-source installed Windows acceptance is authorized and open; SignPath,
production Windows signing, exact cross-platform candidate, human installed-
candidate acceptance, MAC5, publication, and updater mutation remain open

Date: 2026-08-12

Change class: D4 exact-source installer acceptance and single-use development
identity

Risk: R4 installer construction, installed desktop automation, evidence binding,
cleanup recovery, and strict separation from release acceptance

Authorization: after reviewing Issue #33 and its remaining Windows evidence
gap, the project owner instructed `尽快修复和关闭` on 2026-08-12. This
authorizes one fresh synchronized identity, bounded exact-source Windows
acceptance, ephemeral clean-runner installation, auditable evidence, protected
integration, and Issue closure only after all six scenarios pass. It does not
authorize SignPath configuration, public signing, release-candidate
construction, MAC5, publication, or updater mutation.

SP-READY1 SignPath repository readiness carries forward unchanged. The owner MFA audit,
external SignPath application/GitHub App configuration, production two-stage
Windows signing, and signed-candidate evidence remain open.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.37` | Cargo/lock, Tauri, npm/lock, frontend mock/cache, workflow defaults, release-contract tests, roadmap, checklist, and `NEWS.md` synchronized before artifact construction |
| `rho.bridge` version | `0.1.14` | unchanged; no exported R package contract change |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract change |
| Store schema | `12` | unchanged; no persistence migration |
| Review tag/name | `v0.4.0-dev.37` / `Rho 0.4.0-dev.37` | identity only; the Issue #33 workflow creates no tag or Release |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Windows acceptance source | exact current protected `main` commit selected by the workflow | must match installed `app_info.commit` |
| Release decision | Issue acceptance may proceed; release remains `NO-GO` | signing and all candidate/publication gates remain open |

`dev.34`, `dev.35`, and `dev.36` are historical and rejected. Run
`31633600383` consumed `dev.34` on quoted registry-path handling. Run
`31635375821` consumed `dev.35` when CDP was unavailable. Run `31641866471`
consumed `dev.36`: installer identity, installation, installed runtime, five
scenarios, screenshot, and cleanup passed, but the sixth harness waited on a
counter that `refreshProject()` does not mutate. None may be reused or
relabelled. `dev.37` is single-use: any later user-visible source change or
artifact-producing failed run requires a new identity.

## Windows Issue #33 Acceptance Contract

The dedicated workflow may build and upload one unsigned, short-lived internal
review installer. It must not create or update a tag, Release, update manifest,
download page, or publication record. It must:

1. admit only exact current protected `main` and prove checkout, Cargo version,
   installer filename, and embedded installed `app_info` version/commit agree;
2. build with the pinned GNU/Rtools/Ark path and repository-owned Issue #33
   Tauri overlay, normalize the registry install path, install silently in a
   clean profile, and launch only the resolved installed executable; Ark may use
   four checksum-before-promotion attempts, while only this workflow may request
   at most three Tauri invocations for recognized transient NSIS-tool transport
   failures after compilation; unknown, exhausted, and ordinary candidate
   failures remain single-attempt and fail closed;
3. preserve the normal window configuration and Wry security/UX flags while
   adding only a fixed loopback WebView2 debugging port to this internal flavor;
   ordinary candidate construction must remain debug-port-free;
4. repeat the five original scenarios: Agent-refresh focus, non-Agent Run
   refresh/execution focus, automatic Agent edit plus external reload focus,
   Runs pointer activation during replacement, and older Console reading
   position while output is appended;
5. repeat EDITOR-VIEWPORT-R1 by opening `analysis.R`, placing its cursor near the
   end, scrolling Monaco upward, opening `watch.md` as a clean background
   document without changing the active editor, and externally changing
   `watch.md`; acceptance waits for both its actual reloaded saved content and
   a higher project revision, then proves `analysis.R` remains active and its
   Monaco scroll position, visible range, and cursor are unchanged;
6. never use `projectRefreshSequence` as watcher proof: `refreshProject()` does
   not mutate that project-lifecycle counter, so such a predicate is
   unsatisfiable even when watcher reload succeeds;
7. fail closed on assertions, timeout, identity mismatch, malformed registry
   paths, missing installed runtime, build-tree executable, screenshot failure,
   or incomplete cleanup; always stop the app, run the registered uninstaller,
   verify executable/registry removal, and upload bounded JSON, screenshot,
   installer hash, and logs.

The automation may seed bounded Agent/Run presentation records through CDP for
deterministic timing, but it must use shipped rendering/focus helpers, real
Workspace R execution, the real project watcher, real Monaco, and the installed
Tauri bridge. Browser/mock mode and source-only assertions cannot satisfy this
gate.

## Acceptance And Closure

Issue #33 may close only when, on the same exact upstream commit:

- focused frontend regression, JavaScript syntax, and the protected
  macOS/Windows stable/MSRV source matrix pass;
- the installed Windows workflow reports all six scenarios `PASS`, records the
  installed executable, version, commit, installer SHA-256, screenshot, and
  cleanup, and uploads machine-readable evidence;
- this checklist, the active Issue #33 specification, and cross-review ledger
  record exact run, commit, artifact, hashes, and result; and
- the closing Issue comment distinguishes product-defect closure from Windows
  signing, release-candidate, human installed acceptance, MAC5, and publication.

Automation can close the reproduced product defect after exact-source installed
verification, but it cannot replace the human workflow in
`test/acceptance-project/MANUAL-ACCEPTANCE.md` or satisfy a future signed exact-
candidate gate.

## Current Decision

`GO` for the bounded exact-source Windows Issue #33 acceptance work package.
`NO-GO` for SignPath production signing, exact candidate construction, human
installed-candidate acceptance, MAC5, publication, and updater mutation.

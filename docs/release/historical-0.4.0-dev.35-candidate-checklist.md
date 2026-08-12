# Rho 0.4.0-dev.35 Source And Windows Issue #33 Acceptance Checklist

Status: historical rejected internal acceptance package; exact-source build,
NSIS installation, installed-byte/runtime resolution, application startup, and
fail-closed uninstall cleanup passed, but WebView2 CDP admission failed before
all six interaction scenarios; SignPath approval, production Windows signing,
exact cross-platform candidate, human installed-candidate acceptance, MAC5,
publication, and updater mutation were not attempted

Date: 2026-08-12

Change class: D4 exact-source installer acceptance and single-use development
identity

Risk: R4 installer construction, installed desktop automation, evidence binding,
cleanup recovery, and strict separation from release acceptance

SP-READY1 SignPath repository readiness carries forward unchanged. The owner MFA audit,
external SignPath application/GitHub App configuration, production
two-stage Windows signing, and signed-candidate evidence remain open.

Authorization: after reviewing Issue #33 and the remaining Windows evidence gap,
the project owner instructed `尽快修复和关闭` on 2026-08-12. This authorizes a
fresh synchronized application identity, a bounded exact-source Windows
acceptance workflow, ephemeral installation on a clean hosted runner, auditable
evidence, protected integration, and Issue closure only after every named
scenario passes. It does not authorize SignPath configuration, Windows public
signing, candidate construction, MAC5, publication, or updater mutation.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.35` | Cargo/lock, Tauri, npm/lock, frontend mock/cache, workflow defaults, release-contract tests, roadmap, checklist, and `NEWS.md` synchronized before artifact construction |
| `rho.bridge` version | `0.1.14` | unchanged; no exported R package contract change |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract change |
| Store schema | `12` | unchanged; no persistence migration |
| Review tag/name | `v0.4.0-dev.35` / `Rho 0.4.0-dev.35` | identity only; the Issue #33 workflow creates no tag or Release |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Windows acceptance source | exact current protected `main` commit selected by the workflow | must match the installed app's embedded `app_info.commit` |
| Release decision | Issue acceptance may proceed; release remains `NO-GO` | external signing and all candidate/publication gates remain open |

`0.4.0-dev.34` is historical and rejected. Run `31633600383` produced its
unsigned internal installer, then failed installed-byte resolution and cleanup
because the NSIS registry `InstallLocation` was quoted; no interaction scenario
ran. That artifact cannot be reused or relabelled. `0.4.0-dev.35` is single-use:
any later user-visible source change or artifact-producing failed run requires a
new version.

## Windows Issue #33 Acceptance Contract

The dedicated workflow may build and upload one unsigned, short-lived internal
review installer. It must not create or update a tag, Release, update manifest,
download page, or publication record. The workflow must:

1. admit only the exact current protected default-branch commit and prove the
   checkout, Cargo version, installer filename, and embedded `app_info` version
   and commit agree;
2. build the normal NSIS package with the pinned GNU/Rtools/Ark path, install it
   silently into a clean hosted Windows profile, normalize a balanced quoted or
   unquoted fully qualified registry `InstallLocation`, and launch the executable
   from the resolved installation directory rather than `target/release`;
   transient Ark transport failures may use the active Issue #33 contract's
   bounded four-attempt, checksum-before-promotion recovery, but still fail
   closed before package construction when recovery is exhausted;
3. enable WebView2 remote debugging only through the launched process's runner-
   scoped environment, bind it to loopback, and prove the inspected page has the
   Tauri bridge and Windows desktop identity;
4. repeat Issue #33's five original interaction scenarios: Agent-refresh focus,
   non-Agent Run refresh/execution focus, automatic Agent edit plus external
   reload focus, pointer activation during Runs replacement, and older Console
   reading position while output is appended;
5. repeat EDITOR-VIEWPORT-R1 by keeping a cursor near the end, scrolling Monaco
   upward, externally changing another supported project file, and proving the
   watcher refresh preserves the viewport without moving the cursor;
6. fail closed on any assertion, timeout, identity mismatch, malformed/non-
   absolute registry path, missing installed runtime, wrong executable path,
   unavailable screenshot, or incomplete cleanup;
7. always terminate the launched app, invoke the exact registered uninstaller,
   verify the installed executable and registry entry are removed, and upload
   bounded JSON, screenshot, installer hash, and logs for review.

The automation may seed presentation records in the installed page through CDP
to make polling and pointer timing deterministic, but it must use the shipped
`renderAgentTimeline`, `renderRuns`, `renderVolatileLane`, Agent file-update,
Console append, Monaco, real `execute_r`, project watcher, and Tauri command
paths. It may not load browser/mock mode or claim broad manual candidate
acceptance.

## Acceptance And Closure

Issue #33 may close only when all of the following are true on the same exact
upstream commit:

- the focused deterministic frontend regression and JavaScript syntax pass;
- the protected macOS/Windows stable/MSRV source matrix passes;
- the installed Windows workflow reports all six scenarios `PASS`, records the
  exact installed executable, version, commit, installer SHA-256 and cleanup,
  and uploads a screenshot plus machine-readable evidence;
- the active Issue #33 specification and cross-review ledger record the exact
  run, commit, artifact and result; and
- the Issue receives a closing comment that distinguishes source/Issue
  acceptance from Windows signing, release-candidate, MAC5, and publication
  status.

This gate is deliberately narrower than release acceptance. Automation can
close the reproduced product defect after exact-source installed Windows
verification, but it cannot replace the human workflow in
`test/acceptance-project/MANUAL-ACCEPTANCE.md` or satisfy a future signed exact-
candidate gate. Those release facts remain open even after Issue #33 closes.

## Rejection Evidence

Exact protected-main commit `ab2df2cb0dba37e91692d3f40abcf89085b3f67b`
passed all four macOS/Windows stable/MSRV jobs in Rust Compatibility run
`31635365392`. Installed run `31635375821` built and installed
`Rho_0.4.0-dev.35_x64-setup.exe`, SHA-256
`8c44f4841451908cf644bafb43d9d1283b9e63e87fb2de63c1b235c74e0e1f02`.
The resolved installed executable was outside the build tree and had SHA-256
`137c36a309c5693e2dd7c5a1bcd1b58e0ef53c510e6bf069c86c0ad2c85b8416`;
the installed Ark runtime and exact uninstaller were present. Startup logs
recorded successful runtime probe, schema 12, Workspace start, project switch,
and Agent retry.

The runner-set `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` did not expose port 9222.
Wry creates WebView2 with explicit `AdditionalBrowserArguments`, so its default
argument string superseded the environment-only attempt. The driver timed out
before opening a CDP session; no interaction scenario or screenshot ran. The
`always()` recovery path then invoked the exact uninstaller and verified both
the executable and registry entry were removed. Artifact `9157190586` is
short-lived internal failure evidence only and cannot be relabelled or reused.

## Current Decision

`REJECTED` for Issue #33 closure and every release use. The bounded acceptance
work package advances to `0.4.0-dev.36` with an acceptance-build-only Tauri
configuration overlay. `NO-GO` remains for SignPath production signing, exact
candidate construction, human installed-candidate acceptance, MAC5,
publication, and updater mutation.

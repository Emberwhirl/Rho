# Rho 0.4.0-dev.36 Source And Windows Issue #33 Acceptance Checklist

Status: historical rejected internal acceptance package; Issue #33 source repair, editor-
viewport follow-up, and file-proposal reading-position follow-up are integrated;
quoted NSIS registry-path normalization and acceptance-only WebView2 argument
injection are implemented; exact-source installed Windows run `31641866471`
built, installed, proved five scenarios, and cleaned up, but the sixth harness
waited on a counter the real watcher refresh does not change; SignPath approval,
production Windows signing, exact cross-platform candidate, human installed-
candidate acceptance, MAC5, publication, and updater mutation remain open

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
| Application version | `0.4.0-dev.36` | Cargo/lock, Tauri, npm/lock, frontend mock/cache, workflow defaults, release-contract tests, roadmap, checklist, and `NEWS.md` synchronized before artifact construction |
| `rho.bridge` version | `0.1.14` | unchanged; no exported R package contract change |
| `rho.agent` version | `0.1.5` | unchanged; no exported R package contract change |
| Store schema | `12` | unchanged; no persistence migration |
| Review tag/name | `v0.4.0-dev.36` / `Rho 0.4.0-dev.36` | identity only; the Issue #33 workflow creates no tag or Release |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Windows acceptance source | exact current protected `main` commit selected by the workflow | must match the installed app's embedded `app_info.commit` |
| Release decision | Issue acceptance may proceed; release remains `NO-GO` | external signing and all candidate/publication gates remain open |

`0.4.0-dev.34` and `0.4.0-dev.35` are historical and rejected. Run
`31633600383` consumed `dev.34` on quoted registry-path handling. Run
`31635375821` consumed `dev.35` after build, installation, startup, installed
identity, runtime, and cleanup passed but WebView2 CDP remained unavailable;
no interaction scenario ran. Neither artifact can be reused or relabelled.
`0.4.0-dev.36` was consumed and rejected by artifact-producing run
`31641866471`; it cannot be reused or relabelled.

## Windows Issue #33 Acceptance Contract

The dedicated workflow may build and upload one unsigned, short-lived internal
review installer. It must not create or update a tag, Release, update manifest,
download page, or publication record. The workflow must:

1. admit only the exact current protected default-branch commit and prove the
   checkout, Cargo version, installer filename, and embedded `app_info` version
   and commit agree;
2. build an internal NSIS review package with the pinned GNU/Rtools/Ark path,
   apply only the checked-in Issue #33 Tauri configuration overlay, install it
   silently into a clean hosted Windows profile, normalize a balanced quoted or
   unquoted fully qualified registry `InstallLocation`, and launch the executable
   from the resolved installation directory rather than `target/release`;
   transient Ark transport failures may use the active Issue #33 contract's
   bounded four-attempt, checksum-before-promotion recovery, but still fail
   closed before package construction when recovery is exhausted; the
   dedicated workflow may also request at most three Tauri invocations for a
   recognized transient official NSIS-tool transport failure after successful
   compilation, while unknown failures and ordinary candidate builds remain
   single-attempt and fail closed;
3. have that overlay preserve the complete normal window configuration and
   Wry's default security/UX flags while adding only a fixed loopback WebView2
   remote-debugging port for the ephemeral runner; prove the inspected page has
   the Tauri bridge and Windows desktop identity. The generic Windows build
   script must reject an overlay outside the repository, while normal candidate
   construction must pass no overlay and contain no remote-debugging argument;
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

## Current Decision

`REJECTED` for Issue #33 closure because all six scenarios did not complete.
`NO-GO` for SignPath production signing, exact candidate construction, human
installed-candidate acceptance, MAC5, publication, and updater mutation.

Run `31638482434` attempt 1 stopped after the release executable compiled when
the official Tauri NSIS download disconnected; attempt 2 stopped at the same
pre-installer boundary on HTTP `503`. Neither attempt constructed or uploaded
an installer, installed Rho, or ran a scenario, so `dev.36` remained available
at that checkpoint for the bounded recovery specified by
WINDOWS-INSTALLED-ISSUE33-A1.

Protected-main run `31641866471` at
`4d687b2f8354f7af71fa52512111068c3ea5480e` then constructed and installed
`Rho_0.4.0-dev.36_x64-setup.exe`, SHA-256
`fa141bd8e0533f84345d919b57567309b7eba64ac9494b916c39edf4a716fbda`.
The installed executable SHA-256 was
`dde318af23a47d50ac10a50f0173b35c6fda7f85010c4a9252b349eddd9aa433`;
embedded version/commit/platform and the installed Ark runtime matched.
`agent_refresh_focus`, `run_refresh_and_execution_focus`,
`automatic_edit_and_external_reload_focus`, `runs_pointer_activation`, and
`console_reading_position` passed. `monaco_watcher_viewport` timed out because
the harness required `state.projectRefreshSequence` to advance even though the
real watcher calls `refreshProject()`, which does not mutate that counter. The
screenshot SHA-256 was
`c834ba4d6e9611e75c689c4a7bbbc31158ab4f3d7bb5c1f28c06933a6f00fbb2`,
cleanup removed the installed executable and registry entry, and artifact
`9159573725` preserves the bounded evidence. This is rejected partial evidence:
it does not prove the sixth scenario, close Issue #33, or change release
`NO-GO`.

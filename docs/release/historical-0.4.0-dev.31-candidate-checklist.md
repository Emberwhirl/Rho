# Rho 0.4.0-dev.31 Cross-Platform Candidate Checklist

Status: historical rejected-candidate contract; Data Viewer row-shape repair,
exact current-main candidate run `31524766123`, seven-asset unpublished Draft
`368795113`, independent asset verification, macOS trust, mounted-Workspace
checks, affected browser/mock interaction, and exact installed macOS Data
Viewer/focus/live-Provider repair/proposal exercises pass; installed References
and Rename fail because the frontend consumes the outer Workspace broker
envelope; candidate rejected and publication prohibited

Date: 2026-08-11
Last updated: 2026-08-11

Change class: D1 correction of an existing typed Data Viewer response contract
plus the required D4 single-use development identity

Risk: R2 for the Workspace R/Ark/Tauri/frontend response boundary; R4 for
hosted candidate, signing/notarization, Release, update site, or publication
action

Owning documents: the active Data Viewer JSON Row Shape Repair specification
owns DATA-VIEWER-ROW-SHAPE-R1 source behavior and acceptance. Implemented WP2
retains object/view/page/revision/bounds authority, WS3-Q1/Q2 retain query,
sort, type, and cell-state semantics, and Issue #33 retains focus/refresh
presentation. WS2-R1-R1 and RENAME-RECOVERY-R1 own the installed response-
envelope correction. The active macOS arm64 specification owns packaging and
trust gates. This checklist alone owns immutable `0.4.0-dev.31` evidence.

Authorization: the project owner's standing instruction to continue repairing
and accepting every non-legal Issue and PR until closure, the instruction to
release today's latest version, and the current instruction to continue
acceptance authorize this repair, source integration, exact replacement
candidate construction, and installed review. They do not waive any Windows
signing, installed, MAC5, publication, or updater gate.

`0.4.0-dev.30` and Draft `368736031` are immutable and rejected. Their
artifacts, hashes, notarization evidence, focus passes, installed failure, or
any future action against that Draft cannot be relabelled, replaced, or
composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.31` | workspace, Tauri, npm, frontend cache, workflow defaults, tests, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.14` | DESCRIPTION and package NEWS synchronized for ordered row-array serialization |
| `rho.agent` version | `0.1.5` | unchanged; no exported Agent package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.31` / `Rho 0.4.0-dev.31` | unpublished Draft `368795113`; `draft=true`, `prerelease=true`, `published_at=null` |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Authoritative repair merge | `a54fa2c48d84a77f67a0a37896869823d83738ac` | PR #39 merged exact reviewed head `ec4ddf52d85ce4b32fa3dc369cdcdd9e346c81a2` |
| Candidate source | `7b52e827c702165148e9abf6200027324e385ad6` | exact upstream default-branch head and run/Draft `target_commitish` |
| Windows artifact | `Rho_0.4.0-dev.31_x64-setup.exe` | 18,282,771 bytes; SHA-256 `cd09d2a358bb0c1f4c4f9ce632539d22cfa5162a0f3fe91224790247f86d87a1` |
| macOS artifact | `Rho_0.4.0-dev.31_aarch64.dmg` | 21,159,206 bytes; SHA-256 `6ce27db15eef873bed6f5ecf698f907ec52b5e33d546c04e38b6841b1df0bc3b` |
| Release decision | candidate construction `PASS`; installed References/Rename `FAIL`; candidate `REJECTED`; release `NO-GO` | preserve the unpublished Draft; no acceptance, MAC5, publication, or updater action may use `dev.31` |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Included Repair

- Workspace R strips data-frame column names from every row's `cells` and
  `cell_states`, preserving an ordered JSON array with one item per returned
  column even when labels are duplicate or non-syntactic.
- The real desktop smoke rejects non-array or misaligned row payloads after
  they cross Ark and Tauri.
- The frontend rejects malformed row payloads before iteration and reports a
  protocol/read failure truthfully. Only explicit stale view-token or
  workspace-revision responses show the refresh-required stale message.

No command, schema, mutation, polling, project, approval, credential, network,
filesystem, export, or route authority changes.

## Source Verification And Review Gate

Focused failing-first R coverage reproduced the installed defect before the
repair: both row vectors retained names and both encoded as JSON objects. The
fixed source passes the focused R and frontend row-shape regressions, complete
`rho.bridge` and `rho.agent` suites, JavaScript syntax, every frontend/release
contract script, Rust formatting, locked workspace check/tests, the exact
desktop smoke including project-switch/restart/crash recovery, and
`git diff --check`.

The locked Rust suite reports desktop 176 passed with one opt-in native
Keychain smoke ignored, server 59 passed, store 108 passed, and all other
workspace/unit/doc tests passed. Post-verification contract review found no
broadened ownership or authority, no new dependency or schema, no unordered
coercion, and no mock/real shape conflict. After version synchronization, all
55 frontend/release contracts, both complete R package suites, locked Rust
format/check/tests, exact desktop smoke, JavaScript syntax, metadata
consistency, and `git diff --check` passed again.

Hosted Rust Compatibility run `31523265847` passed the exact PR head on
macOS-26 stable and 1.88.0 plus Windows stable and 1.88.0. PR #39 was marked
ready only after all four checks completed, remained cleanly mergeable, and
merged without bypass as `a54fa2c48d84a77f67a0a37896869823d83738ac`.

## Hosted Candidate And Independent Verification

Protected workflow run `31524766123` completed successfully against exact
upstream default-branch commit
`7b52e827c702165148e9abf6200027324e385ad6`. Identity resolution, Windows x64
construction, macOS arm64 signing/submission, exact Apple notarization wait,
secret-free staple/finalization, and Draft assembly all passed. The macOS
submission and Windows construction ran in parallel; the accepted notarization
record remained bound to the exact submitted DMG before finalization.

Draft `368795113` is still unpublished and contains exactly seven unique
assets: aggregate evidence, both platform evidence files, both installers, and
their two checksum sidecars. Independent download and validation reproduced
both sidecar hashes, accepted the aggregate identity/version/tag/commit, found
all six Windows and thirteen macOS evidence checks passed, and matched the
actual size and SHA-256 of every platform artifact, sidecar, and evidence file
to the aggregate record.

The exact downloaded macOS DMG independently passed `hdiutil` verification,
DMG `stapler validate`, DMG and mounted-app Gatekeeper assessment, strict deep
Developer ID verification, exact arm64 inspection for both `rho-desktop` and
bundled Ark, and the reviewed entitlement validator for both executables. The
mounted executable's real Workspace smoke passed with five Data Viewer rows,
genuine stale-token rejection, two-project and restart isolation, interrupt
recovery, and crash recovery.

The exact signed bundle was also installed as `/Applications/Rho.app` and
reported application/build `0.4.0-dev.31`. It started Workspace R against the
existing schema-12 user store, recorded `opened_current`, restored the selected
project, and completed Agent-runtime retry.

Computer Use against that exact installed bundle passed the affected Data
Viewer gate: a 120-row frame rendered, paged, filtered, and sorted; a live
mutation refreshed automatically; a delayed structural mutation produced a
genuine stale-token rejection; and explicit Environment refresh recovered the
121-row state. Representative Issue #33 checks retained Agent-composer and
Environment-row focus plus Plot selection across more than two refresh cycles,
and Console reading position remained stable while a long R stream continued.
The exact Console repair action launched one live DeepSeek repair turn from a
file-backed parse failure. The proposed one-file correction left source
unchanged before review, Accept applied it, verified-only Undo appeared, and
Undo restored the original malformed fixture.

Installed References and Rename then rejected the candidate. A clean top-level
fixture containing three exact occurrences produced `undefined`, `0 matches
across 0 files` in References; F2 retained the replacement and recovered to the
retry dialog but could not open Review. Clean nested and parse-valid files
failed identically. Direct execution of the reviewed Workspace R reference
function returned all three exact records with complete scan metadata. The
production Tauri command returns the standard broker envelope, while these
frontend consumers read the outer envelope as the inner reference record; the
browser mock's direct-record shape had masked the defect. Go to Definition uses
the same erroneous projection and is included in the repair scope. The app was
quit cleanly, the temporary reference fixture removed, and the original
malformed acceptance fixture restored.

Connected Chromium browser/mock interaction against this exact frontend also
passed the affected gates. A 60-row Data Viewer paged from rows 1-50 to 51-60,
filtered exactly to `S59`, and completed unsorted/ascending/descending cycles.
Its refresh probe advanced token and revision while preserving query, sort,
and row window, cleared a disappeared object, and ignored a late foreign-
project response. Agent activity retained mouse and keyboard focus across more
than two poll cycles; an Agent composer draft, an Environment row, and selected
Plot 2 each retained focus/state across 4.5 seconds of refresh. A Console at
scroll offset 284 retained that exact offset while a failed source run appended
71 pixels of output. The Problems repair probe created exactly one typed turn
for file, parse-token, Console, and manual-selection cases while its foreign-
project, stale-source, failed-request, project-switch, and route guards stayed
closed. A UI-generated append proposal collapsed after Accept, exposed Undo
only after verification, and visibly reached `Undone`; Rename opened a nonempty
two-file/three-location Review, while an injected lookup failure kept Review
closed and reopened `Rename symbol - try again` with the requested replacement
prefilled. These browser facts do not satisfy signed installed-app acceptance.

## Integration And Candidate Gates

1. **PASS** — only the reviewed repair, evidence, version, and release-contract
   files were committed from the isolated worktree; the owner's unrelated
   checkout was preserved.
2. **PASS** — scoped PR #39 passed the four hosted Rust identities and merged
   the exact reviewed head into upstream `main` without force or bypass.
3. **PASS** — exact default-branch head `7b52e827` ran in `candidate` mode as
   workflow `31524766123` and created only unpublished Draft `368795113`.
4. **PASS** — aggregate/platform evidence, all seven unique assets, actual
   bytes/hashes, macOS arm64/signature/entitlement/notarization/staple/
   Gatekeeper identity, and Draft-only state were independently verified.
5. **FAIL** — exact installed macOS Data Viewer, Issue #33, live-Provider
   repair, file-proposal Accept, and verified Undo pass, but installed
   References reports an undefined symbol/zero scan and Rename cannot reach
   Review for a valid three-reference fixture.
6. **BLOCKED BY REJECTION** — Windows installed/signing, acceptance upload,
   MAC5, publication, and updater gates may not continue under this identity.

## Current Decision

Source repair, validation, upstream integration, exact candidate construction,
Draft assembly, independent asset verification, macOS trust, mounted Workspace
smoke, and several installed interaction slices are complete. Exact installed
References/Rename acceptance failed. Current decision: candidate `REJECTED` and
release `NO-GO`. Preserve Draft `368795113`; no acceptance upload, MAC5, public
publication, or update-site mutation may use it. The repair advances to a fresh
`0.4.0-dev.32` identity; all `dev.31` evidence is non-composable.

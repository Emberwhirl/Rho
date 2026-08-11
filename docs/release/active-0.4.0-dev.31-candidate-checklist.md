# Rho 0.4.0-dev.31 Cross-Platform Candidate Checklist

Status: active replacement source-candidate contract; Data Viewer row-shape
repair implemented, reviewed, versioned, source-validated, and integrated
through upstream PR #39; exact candidate construction, installed acceptance,
Windows signing disposition, MAC5, publication, and updater evidence open

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
presentation. The active macOS arm64 specification owns packaging and trust
gates. This checklist alone owns the exact `0.4.0-dev.31` identity and any
future candidate, installed, MAC5, publication, or updater evidence.

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
| Release tag/name | `v0.4.0-dev.31` / `Rho 0.4.0-dev.31` | reserved defaults only; no tag or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Authoritative repair merge | `a54fa2c48d84a77f67a0a37896869823d83738ac` | PR #39 merged exact reviewed head `ec4ddf52d85ce4b32fa3dc369cdcdd9e346c81a2` |
| Windows/macOS artifacts | exact `dev.31` candidate only | not built |
| Release decision | source repair `PASS`; release `NO-GO` | every artifact and installed/release gate remains open |

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

## Integration And Candidate Gates

1. **PASS** — only the reviewed repair, evidence, version, and release-contract
   files were committed from the isolated worktree; the owner's unrelated
   checkout was preserved.
2. **PASS** — scoped PR #39 passed the four hosted Rust identities and merged
   the exact reviewed head into upstream `main` without force or bypass.
3. Confirm the merge SHA is the current default-branch head and run the exact
   candidate workflow in `candidate` mode for `v0.4.0-dev.31`.
4. Independently verify the aggregate evidence, seven expected unique assets,
   Windows identity, macOS arm64/signature/entitlement/notarization/staple/
   Gatekeeper identity, and that the Release remains an unpublished Draft.
5. Complete browser/mock and exact installed Windows/macOS review. The macOS
   Data Viewer gate must create/select/page/filter/sort a data frame, force a
   genuine stale revision, and recover by explicit refresh. Issue #33 focus
   exercises remain required on the replacement installed candidate.
6. Resolve Issue #26's Windows signing disposition without treating an
   unsigned installer as a public-release pass.
7. Reconcile candidate-bound acceptance evidence, then stop for an explicit
   MAC5 GO. Publication and updater mutation occur only after all gates pass.

## Current Decision

Source repair, affected validation, review, version synchronization, and
upstream integration are complete. Every distributable gate remains open.
Current decision: `NO-GO` for acceptance upload, MAC5, public publication, or
update-site mutation until an exact current-main candidate is constructed and
accepted.

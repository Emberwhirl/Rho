# Rho 0.4.0-dev.24 Cross-Platform Candidate Checklist

Status: active replacement development-candidate identity; Issue #6 R5 and
Issue #9 TASK-RAIL-SEMANTICS-1 source implementation are present; affected
frontend/static/browser validation and the exact review-only fork rehearsal
pass; authoritative candidate/draft production and owner-installed/live-
Provider acceptance remain open

Date: 2026-08-08
Last updated: 2026-08-09

Change class: D1/R1 Task Rail presentation correction plus the required D4
single-use replacement development identity

Risk: R1 for the bounded frontend behavior; R4 for any hosted candidate,
artifact promotion, signing/notarization, release action, or publication

Owning documents: the active Problems-to-Agent specification retains parser-
token repair authority; the Task Rail semantics specification owns only mode,
status, selection, and accessibility presentation; the active macOS arm64
specification owns packaging and trust gates. This checklist alone owns the
exact `0.4.0-dev.24` identity, future candidate evidence, installed-acceptance
ledger, and GO/NO-GO decision.

Authorization: on 2026-08-08 the project owner explicitly requested continued
implementation of GitHub Issue #9. The active governance requires a new
user-visible candidate identity, synchronized NEWS/metadata, tests, review, and
commit. This does not authorize a local or hosted artifact, tag, GitHub
Release/draft, signing/notarization, update-site mutation, MAC5, or publication.

Authorization amendment: on 2026-08-09 the project owner accepted the exact
`dev.24` local development-app experience, requested that the reviewed branch
be merged to `Rho_for_mac/main`, and explicitly authorized dispatch of the
macOS build workflow. The repository exposes macOS signing/notarization only
through the combined `Build Rho Candidate / Rehearsal` workflow, so this
authorization admitted one exact-default-branch `rehearsal` dispatch and its
coupled Windows verification job. At that checkpoint it did not admit
`candidate` mode, a tag, Release/draft, update-site mutation, MAC5, or
publication. Development-app acceptance is not installed-DMG acceptance.

Candidate-entry authorization: after the review-only rehearsal and upstream
`main` integration passed, the project owner requested "开始发布" on 2026-08-09.
This activates the authoritative `candidate` build/draft stage for one exact
current `YuLab-SMU/Rho/main` commit. It permits the workflow to build both
platforms, sign/notarize the macOS DMG, create the immutable draft prerelease,
and attach its bounded candidate evidence. It does not authorize the later
`Publish Rho Candidate` workflow, update-site mutation, or a public Release.
Those remain blocked on exact owner-installed candidate acceptance, a bound
MAC5 `GO` record, and a separate final publication decision.

`0.4.0-dev.20` through `0.4.0-dev.22` are immutable rejected predecessors.
`0.4.0-dev.23` is an immutable superseded predecessor whose R5 source tests
passed but whose artifact and installed acceptance were not run. No predecessor
artifact, hash, receipt, or acceptance row can satisfy this checklist.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.24` | source metadata synchronized |
| `rho.bridge` version | `0.1.13` | unchanged |
| `rho.agent` version | `0.1.5` | unchanged |
| Store schema | `11` | unchanged |
| Release tag | `v0.4.0-dev.24` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.24` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Local source commit | `c83ddfb4563778c1bf6190bd5ce833bb0a6a2e72` | reviewed rehearsal source checkpoint |
| Authoritative source commit | one reviewed 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | review-only rehearsal passed; authoritative candidate NOT RUN |
| Minimum macOS | 14.0 | configuration unchanged |
| Release decision | `NO-GO` | candidate matrix and acceptance open |

The version/tag is single-use. Rejection or a later user-visible source change
advances to another version; no artifact, tag, draft, hash, or evidence file may
be overwritten or relabelled.

## Combined Corrective Scope

The parser-token behavior carried forward from `dev.23` is unchanged:

- only `rho.bridge` may admit a bounded parser-owned `<text>:line:column:`
  coordinate during the exact parse phase;
- schema 11 durably distinguishes `r_parse_token` from `r_expression` without
  historical backfill;
- Console and Problems bind the same exact failed run and select a validated
  token automatically; EOF/ambiguous locations remain explicit-selection
  fallbacks;
- no automatic Provider request, R execution, proposal acceptance, save, fuzzy
  matching, approval, or file mutation is introduced.

Issue #9 adds only the following Task Rail projection:

- the row order is status dot, mode icon, then prompt preview;
- Ask uses MessageCircle, Plan uses ListChecks, and Act uses PencilLine through
  the existing local inline SVG sprite;
- mode icons have transparent backgrounds and neutral foregrounds; the current
  or keyboard-focused row may use Rho teal;
- status dots remain the only status-color slots and expose their own labels;
- rows expose independent mode/status names, tooltips, `aria-current`, visible
  keyboard focus, truthful empty text, and bounded long/Unicode ellipsis;
- unknown historical modes use a neutral Bot fallback;
- approval, execution, risk, persistence, credentials, and broker policy remain
  unchanged.

## Development Verification

Current exact-source Issue #9 evidence on 2026-08-08:

- `node --check desktop/dist/app.js`: PASS;
- all 46 fail-fast repository `scripts/test-*.mjs` contracts: PASS, including
  the focused Task Rail regression and existing release/notarization fixtures;
- `cargo check --workspace --all-targets`: PASS with only existing unused Git
  helper warnings; no Rust behavior changed;
- exact Chromium `1440 x 900`: PASS with Ask/Plan/Act, completed/running/failed,
  empty/long/Unicode preview states, one current item, transparent mode
  backgrounds, independent mode/status colors and names, no list/document
  overflow, and zero page exceptions;
- exact Chromium `900 x 700`: PASS with the existing responsive rail hide,
  usable remaining Agent surface, no document overflow, and zero exceptions;
- keyboard interaction: PASS with a visible 2 px focus outline, selection
  transfer, `aria-current`, and focus restoration;
- `git diff --check` and implementation-to-contract review: PASS.

The complete cross-platform matrix and exact app/installer/DMG smoke were not
rerun merely to record the initial R1 source slice. They were subsequently run
by the exact review-only rehearsal recorded below. Historical `dev.23` test
results remain historical and are not relabelled as `dev.24` evidence.

## Review-Only Rehearsal Evidence

Fork run [`31294667960`](https://github.com/YuLab-SMU/Rho_for_mac/actions/runs/31294667960)
completed successfully on 2026-08-09 against exact commit
`c83ddfb4563778c1bf6190bd5ce833bb0a6a2e72`. Identity admission, the complete
Windows and macOS candidate matrices, Developer ID signing, entitlement checks,
Apple notarization and binding, staple, Gatekeeper, mounted-DMG Workspace
smoke, and seven-file review-only aggregation all passed. Draft creation was
skipped as required for `rehearsal` mode.

GitHub artifact `9032765026`, named
`rho-0.4.0-dev.24-rehearsal-c83ddfb4563778c1bf6190bd5ce833bb0a6a2e72-31294667960-1`,
was downloaded independently. Both checksum files validated their artifacts,
and the checked-in validators admitted both platform records and the aggregate
rehearsal record against the exact repository, version, tag, commit, Run ID,
and attempt.

| Review-only file | Bytes | SHA-256 |
| --- | ---: | --- |
| `Rho_0.4.0-dev.24_aarch64.dmg` | 20,967,642 | `b28b70e285e770b17836ab9c3bd3524fff23c86e153ccfd8e3138419dd9db6ce` |
| `Rho_0.4.0-dev.24_aarch64.dmg.sha256` | 95 | `7c436aaa7fb6b855f1a042beb7877a092933da8e619b97dd57ad3721903f40e6` |
| `rho-0.4.0-dev.24-macos-aarch64-evidence.json` | 1,358 | `4b1c09d414850304cac708fdcf831e69774e4f24ee158ec1515cd692c25c706f` |
| `Rho_0.4.0-dev.24_x64-setup.exe` | 18,151,451 | `263c0e0bd1147e31405f36bcd8f4e9ec50e4499c76310d742d1639953cccb2e6` |
| `Rho_0.4.0-dev.24_x64-setup.exe.sha256` | 97 | `89e8190e8327f126fc001bcb3940a1a4b279d22bb07c4fee02b08892a3cebe97` |
| `rho-0.4.0-dev.24-windows-x86_64-evidence.json` | 904 | `938f535d903cf79081101f8ae2389e5e998666ff724400d73cc934c8dd8aeae4` |
| `rho-0.4.0-dev.24-rehearsal-evidence.json` | 1,582 | `3880db4b13619856c8d94a28cbc524958d0551005cac79dfa998c23dd6e5216d` |

This is immutable review-only fork evidence. The authorization record itself
creates a later documentation-only default-branch commit, so the authoritative
candidate workflow must rerun and bind all candidate assets to that exact new
commit; these rehearsal files cannot be copied or relabelled into the draft.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.24_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.24_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.24-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.24_aarch64.dmg` | local macOS build / later finalizer | NOT RUN |
| `Rho_0.4.0-dev.24_aarch64.dmg.sha256` | local macOS build / later finalizer | NOT RUN |
| `rho-0.4.0-dev.24-macos-aarch64-evidence.json` | macOS finalizer | NOT RUN |
| `rho-0.4.0-dev.24-candidate-evidence.json` | draft assembly | NOT RUN |

The identically named files in the review-only rehearsal do not satisfy these
authoritative rows. Separate owner authorization is now recorded; the hosted
candidate action may start only after this reviewed amendment is pushed to the
authoritative default branch, a fresh tag/Release non-existence check passes,
and the workflow binds its complete validation to that exact commit.

## Installed Acceptance

An exact immutable `dev.24` installed build must cover both carried-forward and
new behavior:

- reproduce the full-width-comma file parse failure, expose `Fix with Agent` at
  the Console site, select the exact invalid token, and start one real
  tool-capable read-only Ask repair turn without opening Problems or asking for
  a redundant selection; keep the file unchanged before Accept;
- populate Agent-first history with healthy and failed Ask/Plan/Act turns and
  confirm that Act itself is neutral, only true failed status is red, shapes
  and tooltips/names are distinct, selection/focus is clear, and narrow layout
  remains usable;
- retain truthful EOF/no-range, route/setup, credential redaction, refresh,
  restart, duplicate, changed-source, stale, schema-upgrade, and project-switch
  behavior.

This gate is `NOT RUN`.

The review-only fork rehearsal passed and authoritative candidate/draft
construction is now authorized as recorded above. MAC5 acceptance, public
Release publication, update publication, Pages mutation, and release GO remain
separately gated and unauthorized until the exact draft candidate is installed
and accepted.

## Current Decision

`NO-GO`. TASK-RAIL-SEMANTICS-1 source validation and the review-only rehearsal
pass, and authoritative candidate/draft construction is authorized. The exact
authoritative candidate, owner-installed/live-Provider acceptance, MAC5 GO,
and final publication remain open; no public Release is authorized.

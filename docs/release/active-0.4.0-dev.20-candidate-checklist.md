# Rho 0.4.0-dev.20 Cross-Platform Candidate Checklist

Status: active development-candidate identity for PROBLEMS-AGENT-REPAIR-2;
implementation, complete affected automated verification, deterministic
browser behavior review, version synchronization, and exact local unsigned
app/DMG verification are complete; owner-installed acceptance, authoritative assets,
GitHub Release draft, MAC5, publication, and release GO are NOT RUN

Date: 2026-08-08

Change class: D3 user-visible repair workflow and durable diagnostic schema
plus D4 replacement development identity

Risk: R3 migration/recovery, project isolation, source identity, Agent routing,
credential isolation, proposal review, and browser/mock parity; R4 for any
later candidate or release action

Owning documents: the active Problems-to-Agent repair specification owns the
Issue #6 behavior and schema v10 contract. The active system-credential
specification owns capability routing and one-credential resolution. The
active macOS arm64 specification continues to own packaging and trust gates.
This checklist alone owns the exact `0.4.0-dev.20` identity and its future
candidate/acceptance ledger.

Authorization: on 2026-08-08 the project owner explicitly authorized complete
resolution of GitHub Issue #6. This authorizes implementation, tests,
documentation, versioning, commit and source push. It does not authorize a
tag, Release/draft, signed or notarized candidate, update-site mutation, MAC5,
or publication.

`0.4.0-dev.19` is an immutable historical predecessor. Its artifacts and
acceptance evidence cannot satisfy this checklist.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.20` | source metadata synchronized |
| `rho.bridge` version | `0.1.12` | DESCRIPTION and package NEWS synchronized |
| `rho.agent` version | `0.1.4` | unchanged; no package API changed |
| Release tag | `v0.4.0-dev.20` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.20` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Source commit | one full 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | exact local unsigned app/DMG verified |
| Minimum macOS | 14.0 | configuration unchanged |
| Release decision | `NO-GO` | installed/candidate acceptance NOT RUN |

The version/tag is single-use. A rejected or already-used identity advances to
another version; no artifact, tag, draft, hash, or evidence file may be
overwritten or relabelled.

## Implemented Development Scope

- Workspace R returns a bounded exact top-level expression range for
  evaluation failures without deriving parse locations from message text.
- Admitted editor source ranges are translated from R character columns into
  editor UTF-16 coordinates, checked inside the submitted range, and persisted
  only for real project files.
- Store schema v10 keeps the complete nullable range atomically. v9 migration
  uses the existing same-directory backup and transaction; historical rows
  remain unlocated, and injected failures roll back and reopen safely.
- Problems projects exact ranges and bounded traceback/run context for only the
  active project. `Fix with Agent` verifies the current project, run, file and
  failed source before selecting the expression automatically.
- The closed `problem_repair` task uses read-only Ask policy with
  `auto_approve=false`, resolves the effective function-calling Act route, and
  exposes only that route's Provider credential. Ordinary turns are unchanged.
- A successful file repair can create one existing reviewable
  `replace_selection` proposal without changing the file. Console repair is
  diagnostic-only unless read-only inspection later establishes a real file.
- Old/parse diagnostics with no trusted range offer an explicit same-file
  selection fallback marked `user_selection`; Rho never guesses or persists
  that range as runtime evidence.
- Missing routes/credentials deep-link to `agent.act`. Missing source/run,
  stale text, request failure, foreign project, or a project switch during
  preparation creates no turn and leaves source unchanged.

## Development Verification

Completed local evidence on 2026-08-08:

- `rho.bridge`: 535 passed, 0 failed, 0 warned, 0 skipped;
- `rho.agent`: 109 passed, 0 failed, 0 warned, 0 skipped;
- `rho-store`: 97 passed; v7/v8/v9 migrations, v9 rollback/recovery, malformed
  range rejection, and two-project isolation included;
- `rho-server`: 51 passed; source admission/translation, Unicode conversion,
  out-of-scope rejection, and diagnostic/run-context prompt coverage included;
- `rho-desktop`: 151 passed, 0 failed, one pre-existing opt-in Keychain smoke
  ignored; Repair route, one-credential, source-range and recovery tests
  included;
- all 44 frontend `scripts/test-*.mjs` suites and JavaScript syntax: PASS;
- deterministic Chromium preview at `1440 x 900`: no page errors or horizontal
  overflow; exact `summary(qc)` selection; Ask `problem_repair`; function-call
  route inheritance; `replace_selection` proposal for `analysis.R`; Console
  context without false proposal; explicit-selection fallback; route deep
  link; stale, foreign-project, request-failure and preparation-switch guards;
  source unchanged before explicit acceptance;
- Rust formatting and affected package checks: PASS;
- exact final full-workspace/all-target verification: PASS after final
  metadata/document review;
- local unsigned `Rho.app`/DMG build and mounted smoke for this exact identity:
  PASS; Tauri CLI 2.11.4, exact app/Ark arm64, version `0.4.0-dev.20`, macOS
  14.0 minimum, and `hdiutil verify`; final post-format DMG size 21,224,710
  bytes, SHA-256
  `9f011b15ab90c792ac177c3c0a87b530d8f92279fd77c1d9e362645ba11073ca`;
- live Provider request and real credential use: NOT RUN.

Passing development verification cannot satisfy installed-app, signed or
notarized candidate, MAC5, publication, or release acceptance.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.20_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.20_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.20-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.20_aarch64.dmg` | macOS finalizer job | NOT RUN |
| `Rho_0.4.0-dev.20_aarch64.dmg.sha256` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.20-macos-aarch64-evidence.json` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.20-candidate-evidence.json` | draft assembly job | NOT RUN |

No candidate action may start without separate owner authorization, a clean
reviewed pushed default-branch commit in the authoritative repository, a fresh
tag/Release non-existence check, and complete exact-source validation.

## Installed Acceptance And Publication

Installed acceptance must use the exact immutable candidate and prove a real
file execution failure produces an exact durable range after restart; one
Problems click prepares a reviewable proposal without manual selection; source
does not change before Accept; Reject and stale Accept remain safe; Console and
manual-selection fallback are truthful; two projects remain isolated; route
and credential blockers are actionable; and no secret appears in UI, logs or
evidence. It remains `NOT RUN`.

MAC5, candidate draft creation, update publication, Pages mutation, tag/Release
creation, and release GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`. `0.4.0-dev.20` is the active development identity. Source
implementation and affected automated/browser verification pass. Final
all-workspace verification and exact local unsigned artifact verification
pass. Owner-installed acceptance, authoritative candidate assets, MAC5, and
publication remain open.

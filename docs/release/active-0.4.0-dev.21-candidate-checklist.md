# Rho 0.4.0-dev.21 Cross-Platform Candidate Checklist

Status: active corrective development-candidate identity for
PROBLEMS-AGENT-REPAIR-3, CRED-UX4A-R2, and WS3-Q1-R1; implementation, complete
affected automated verification, deterministic browser behavior review, and
exact local unsigned arm64 artifact verification are complete;
owner-installed/live-Provider acceptance, authoritative assets, GitHub Release
draft, MAC5, publication, and release GO are NOT RUN

Date: 2026-08-08

Change class: D3 Agent runtime/credential-route correction plus D2 selected
Workspace viewer recovery and D4 replacement development identity

Risk: R3 registered Provider identity, exact one-credential routing, and
installed repair flow; R2 revision/project-bound read-only Data Viewer refresh;
R4 for any later hosted candidate or release action

Owning documents: the active Problems-to-Agent specification owns the one-click
repair flow; the active system-credential specification owns canonical
registered runtime identity and one-credential resolution; the active WS3
broker-data-query specification owns selected-view refresh; the active macOS
arm64 specification owns packaging and trust gates. This checklist alone owns
the exact `0.4.0-dev.21` identity and its acceptance ledger.

Authorization: the project owner supplied installed `dev.20` rejection evidence
and requested correction of the Issue #6 flow. The existing Issue #6 authority
covers implementation, tests, documentation, versioning, commit, and source
push. It does not authorize a tag, Release/draft, signed/notarized candidate,
update-site mutation, MAC5, or publication.

`0.4.0-dev.20` is an immutable rejected predecessor. Its artifacts, hashes, and
acceptance evidence cannot satisfy this checklist.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.21` | source metadata synchronized |
| `rho.bridge` version | `0.1.12` | unchanged |
| `rho.agent` version | `0.1.5` | runtime contract and package NEWS synchronized |
| Store schema | `10` | unchanged; no migration in this correction |
| Release tag | `v0.4.0-dev.21` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.21` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Local source commit | `ee96146e5c3760b38b729e78b60d596a08bd995b` | exact clean feature-branch source used for the local unsigned artifact |
| Authoritative source commit | one reviewed 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | exact local unsigned artifact PASS |
| Minimum macOS | 14.0 | configuration unchanged |
| Release decision | `NO-GO` | owner-installed/live-Provider acceptance NOT RUN |

The version/tag is single-use. Rejection advances to another version; no
artifact, tag, draft, hash, or evidence file may be overwritten or relabelled.

## Corrective Scope

- Registered Provider profiles construct the reviewed credential-bound runtime
  at the same canonical Provider ID carried by their admitted route. The
  resolved session model, route model, and profile Provider/model fields must
  match before any Provider request.
- `problem_repair` remains Ask policy with `auto_approve=false`, resolves only
  the function-calling `agent.act` route, and receives exactly that route's one
  credential. There is no fallback or unsolicited Provider call.
- After Workspace identity changes, Environment force-reinspects the currently
  selected object and reads its page with a new view token. This includes an R
  execution that mutates an object before failing.
- Refresh preserves a compatible selected view, literal query, sort, page size,
  and bounded row/column window; it clamps a shrunken window, clears a removed
  object, and rejects older refresh/inspection/page responses or a response
  arriving after project switch.
- No settings/store schema, Workspace mutation, polling, approval, automatic R
  execution, proposal acceptance, file write, or credential authority changes.

## Development Verification

Completed corrective evidence on 2026-08-08:

- `rho.agent`: 120 passed, including reviewed registered-Provider construction,
  canonical route normalization, session creation without a request, mismatch
  rejection, and custom-Provider identity isolation;
- `rho.bridge`: 535 passed;
- `rho-store`: 97 passed;
- `rho-server`: 52 passed, including the exact desktop child startup sequence;
- `rho-desktop`: 151 passed, 0 failed, with one pre-existing opt-in Keychain
  smoke ignored;
- all 45 frontend `scripts/test-*.mjs` suites and JavaScript syntax: PASS;
- complete Rust workspace/all-target verification and Rust formatting: PASS;
- deterministic Chromium behavior at `1440 x 900` and `800 x 900`: a failed R
  execution advances the selected `qc_paged` view from revision 1 to 2 with one
  automatic inspect/read, preserves query `S`, descending column-1 sort, and
  row offset 25, shows no stale error or horizontal overflow, clears a removed
  object, rejects a foreign-project late response, and reports no page errors;
- disposable test credentials only; live Provider request and real credential
  use: NOT RUN.
- Tauri CLI `2.11.4` built the clean-source unsigned arm64 `Rho.app` and DMG;
  `hdiutil verify`, mounted arm64/metadata checks, and complete Workspace smoke
  passed. The DMG is 21,234,112 bytes with SHA-256
  `e52a37305eea076275e4c6eb88a7bb3e9faba9db71fec1161c13d5e7c5cd657f`.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.21_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.21_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.21-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.21_aarch64.dmg` | local macOS build / later finalizer | local unsigned PASS; authoritative finalizer NOT RUN |
| `Rho_0.4.0-dev.21_aarch64.dmg.sha256` | local macOS build / later finalizer | local hash PASS; authoritative finalizer NOT RUN |
| `rho-0.4.0-dev.21-macos-aarch64-evidence.json` | macOS finalizer | NOT RUN |
| `rho-0.4.0-dev.21-candidate-evidence.json` | draft assembly | NOT RUN |

No hosted candidate action may start without separate owner authorization, a
clean reviewed pushed default-branch commit in the authoritative repository, a
fresh tag/Release non-existence check, and complete exact-source validation.

## Installed Acceptance

The owner must install the exact immutable `dev.21` artifact and reproduce the
same file failure. One Problems click must start a real tool-capable Ask repair
turn and reach either a diagnosis or one existing reviewable file proposal
without a second selection. The file must remain unchanged before Accept.

The same failed execution must leave Environment inventory and the selected
Data Viewer on the current object revision without a stale-refresh instruction.
Query/sort/page state, object removal, retry, restart, stale acceptance, and two
projects remain truthful. Provider/Keychain use must expose no secret in UI,
logs, evidence, or process arguments. This gate is `NOT RUN`.

MAC5, candidate draft creation, update publication, Pages mutation, tag/Release
creation, and release GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`. Source implementation, the complete affected automated/browser
matrix, and exact local unsigned arm64 artifact verification pass at
`0.4.0-dev.21`. Owner-installed/live-Provider acceptance remains open; no
hosted or published candidate is authorized.

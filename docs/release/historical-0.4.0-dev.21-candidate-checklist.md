# Rho 0.4.0-dev.21 Historical Rejected Candidate Checklist

Status: historical rejected development-candidate identity for
PROBLEMS-AGENT-REPAIR-3, CRED-UX4A-R2, and WS3-Q1-R1; implementation, complete
affected automated verification, deterministic browser behavior review, and
exact local unsigned arm64 artifact verification are complete;
owner workflow review rejected the Problems-only repair entry on 2026-08-08;
authoritative assets, GitHub Release draft, MAC5, publication, and release GO
were NOT RUN

Date: 2026-08-08

Change class: historical D3 Agent runtime/credential-route correction plus D2
selected Workspace viewer recovery and D4 single-use candidate identity

Risk: closed historical record only; this identity cannot satisfy a later
candidate, installed acceptance, hosted artifact, or release gate

Owning documents: the active Problems-to-Agent specification owns the one-click
repair flow; the active system-credential specification owns canonical
registered runtime identity and one-credential resolution; the active WS3
broker-data-query specification owns selected-view refresh; the active macOS
arm64 specification owns packaging and trust gates. This checklist alone owns
the exact immutable `0.4.0-dev.21` identity and its rejection ledger.

Authorization: the project owner supplied installed `dev.20` rejection evidence
and requested the corrections represented by this source. After the immutable
`dev.21` DMG was handed off, owner review rejected the remaining requirement to
navigate to Problems before repair. That rejection closes this identity; it
does not authorize relabelling, rebuilding, a tag, Release/draft,
signed/notarized candidate, update-site mutation, MAC5, or publication.

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
| Release decision | `NO-GO` | owner workflow review rejected Problems-only repair entry |

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

## Owner Acceptance Rejection

The owner reviewed the exact `dev.21` behavior and rejected the requirement to
leave the Console error site and discover the repair action under Problems.
Problems remains useful as durable history, but it cannot be the mandatory
entry for a just-failed execution. This is a user-visible acceptance failure,
so the already handed-off DMG, source identity, and hash remain immutable and
cannot be promoted.

The registered-Provider and selected Data Viewer corrections retain their
recorded automated/local-artifact evidence, but they do not override this
candidate-level rejection. Live-Provider acceptance was not completed for a
promotable `dev.21` candidate.

MAC5, candidate draft creation, update publication, Pages mutation, tag/Release
creation, and release GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`, permanently. Source implementation, the affected automated/browser
matrix, and exact local unsigned arm64 artifact verification passed at
`0.4.0-dev.21`, but owner workflow review rejected the Problems-only entry.
Replacement work advances to `0.4.0-dev.22`; no `dev.21` artifact, hash, tag,
draft, or evidence may be overwritten or reused.

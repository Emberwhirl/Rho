# Rho 0.4.0-dev.22 Historical Candidate Checklist

Status: historical rejected identity; PROBLEMS-AGENT-REPAIR-4 implementation,
complete affected automation/browser review, and exact local unsigned arm64
artifact verification passed, but owner acceptance exposed that a file-backed
R parse error still degraded to manual selection despite carrying a validated
submitted file/range and parser-reported location

Date: 2026-08-08

Change class: D2 shared Console/Problems repair entry plus D4 replacement
development identity

Risk: R2 transient-to-durable failed-run binding, refresh recovery, duplicate
dispatch prevention, and project isolation; R4 for any hosted candidate or
release action

Owning documents: the active Problems-to-Agent specification owns exact failed
run/range context and the shared repair action; Console owns the direct
error-site projection while Problems owns durable history. The active macOS
arm64 specification owns packaging and trust gates. This historical checklist
alone owns the immutable `0.4.0-dev.22` identity, artifact evidence, installed
rejection, and NO-GO ledger.

Authorization: on 2026-08-08 the project owner rejected the `dev.21`
Problems-only navigation and explicitly directed implementation of an Agent
repair entry at the Console error site. Existing Issue #6 authority covers the
bounded implementation, tests, documentation, replacement version, local
unsigned validation artifact, commit, and source push. It does not authorize a
tag, Release/draft, signed/notarized candidate, update-site mutation, MAC5, or
publication.

`0.4.0-dev.20` and `0.4.0-dev.21` are immutable rejected predecessors. Their
artifacts, hashes, and acceptance evidence cannot satisfy this checklist.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.22` | source metadata synchronized |
| `rho.bridge` version | `0.1.12` | unchanged |
| `rho.agent` version | `0.1.5` | unchanged |
| Store schema | `10` | unchanged; no migration in this correction |
| Release tag | `v0.4.0-dev.22` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.22` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Local source commit | `2b5809151a154c0ca35c092f2e53dd7e064ab11b` | exact clean feature-branch source used for local unsigned artifact |
| Authoritative source commit | one reviewed 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | exact local unsigned artifact PASS |
| Minimum macOS | 14.0 | configuration unchanged |
| Release decision | `NO-GO` | owner workflow rejected parse-error manual selection |

The version/tag is single-use. Rejection advances to another version; no
artifact, tag, draft, hash, or evidence file may be overwritten or relabelled.

## Corrective Scope

- A failed non-render Workspace R execution with a durable execution ID renders
  a structured Console error row and repair action at the failure site. The
  user does not need to open Problems first.
- The action remains disabled until a Problems refresh started after the error
  resolves the exact complete run ID in the same project. It never submits the
  transient UI copy or partial context.
- Console and Problems share one state/action helper for `Fix with Agent`,
  `Select code for Agent`, and `Set up Agent repair`, then use the existing
  `fixProblemWithAgent()` and typed read-only Ask `problem_repair` path.
- Duplicate clicks create at most one turn. Refresh failure has a bounded retry;
  a durable-context miss requires rerunning code. A project switch permanently
  disables the old action, and older/late refreshes cannot re-enable it.
- Render failures, arbitrary stderr events, startup/connection failures, and
  invoke failures do not gain a misleading source-repair action.
- No command, schema, persistence, credential, approval, automatic Provider
  request, R execution, proposal acceptance, save, or file mutation authority
  changes.

## Development Verification

Current evidence on 2026-08-08:

- JavaScript syntax and all 45 frontend `scripts/test-*.mjs` suites: PASS;
- `rho.agent`: 120 expectations passed; `rho.bridge`: 535 expectations passed;
- complete Rust workspace/all-target verification: PASS, including
  `rho-store` 97, `rho-server` 52, and `rho-desktop` 151 passed with its one
  pre-existing opt-in Keychain smoke ignored; Rust formatting: PASS;
- deterministic Chromium behavior at `1440 x 900` and `800 x 900`: direct
  Console action visible, no prompt/action overlap or horizontal overflow, no
  page errors, exact run/range binding, one click/one typed repair turn, no
  Problems navigation, source unchanged before Accept, failed-refresh recovery,
  bounded missing-context recovery, duplicate-click rejection, and
  previous-project disablement: PASS;
- disposable mock credentials only; live Provider request and real credential
  use: NOT RUN;
- Tauri CLI `2.11.4` built the clean-source unsigned arm64 `Rho.app` and DMG in
  about 71 seconds. `hdiutil verify`, mounted bundle metadata/architecture, and
  complete Workspace smoke passed. The DMG is 21,224,605 bytes with SHA-256
  `6550ebd87d1def65c317eeb9e8de12077c39cfa3c0b3ae00bee8dea7df0e0c50`.
  The app and bundled Ark are arm64; the app reports `0.4.0-dev.22`, minimum
  macOS 14.0, ad-hoc signature, and no Team ID.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.22_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.22_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.22-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.22_aarch64.dmg` | local macOS build / later finalizer | local unsigned PASS; authoritative finalizer NOT RUN |
| `Rho_0.4.0-dev.22_aarch64.dmg.sha256` | local macOS build / later finalizer | local hash PASS; authoritative finalizer NOT RUN |
| `rho-0.4.0-dev.22-macos-aarch64-evidence.json` | macOS finalizer | NOT RUN |
| `rho-0.4.0-dev.22-candidate-evidence.json` | draft assembly | NOT RUN |

No hosted candidate action may start without separate owner authorization, a
clean reviewed pushed default-branch commit in the authoritative repository, a
fresh tag/Release non-existence check, and complete exact-source validation.

## Installed Acceptance

The owner opened the exact local `dev.22` DMG and reproduced a file-mode parse
failure in `scatter_plot_example.R`. The request durably recorded that source,
document version 2, and submitted range `1:1-39:1`; R reported
`<text>:23:46` for a full-width comma inside `runif(34, 0, 10，)`. The bridge
returned no structured error range under the R2 no-message-derived-location
policy, so the Console correctly bound the exact failed run but exposed
`Select code for Agent` and required the user to select the already identified
token. The simultaneous status `Exact failed run ready` made the missing range
insufficiently clear. Because the acceptance contract requires direct repair
without reselecting the same code, installed workflow acceptance is `FAIL`.

The application made no automatic Provider request, R execution, proposal
acceptance, save, or source change. The failure therefore rejects workflow
acceptance, not the existing authority boundaries.

MAC5, candidate draft creation, update publication, Pages mutation, tag/Release
creation, and release GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`, permanently. Implementation, automated/browser validation, and the
exact local unsigned artifact remain valid evidence for their recorded source,
but owner workflow acceptance failed on the parse-error recovery path.
Replacement work advances to `0.4.0-dev.23`; no `dev.22` artifact, hash, tag,
Release, acceptance row, or evidence may be rebuilt, relabelled, or reused.

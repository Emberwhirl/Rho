# Rho 0.4.0-dev.23 Cross-Platform Candidate Checklist

Status: active replacement development-candidate identity for
PROBLEMS-AGENT-REPAIR-5; implementation and complete affected automated/browser
validation pass; exact local unsigned artifact verification and
owner-installed/live-Provider acceptance remain open

Date: 2026-08-08

Change class: D3 parser diagnostic and schema migration correction plus D4
replacement development identity

Risk: R3 parser-location admission, Unicode coordinate translation,
transactional schema-v11 migration/recovery, durable diagnostic truth, and
project isolation; R4 for any hosted candidate or release action

Owning documents: the active Problems-to-Agent specification owns parse-token
admission and repair behavior; the store owns durable range validation and
migration; Runs/Workspace execution own diagnostic truth; Console owns the
direct error-site projection and Problems owns durable history. The active
macOS arm64 specification owns packaging and trust gates. This checklist alone
owns the exact `0.4.0-dev.23` identity and acceptance ledger.

Authorization: on 2026-08-08 the project owner rejected the `dev.22` installed
parse-error workflow and explicitly authorized PROBLEMS-AGENT-REPAIR-5,
`dev.23`, tests, a local unsigned DMG, commit, and source push. This does not
authorize a tag, Release/draft, signed/notarized candidate, update-site
mutation, MAC5, or publication.

`0.4.0-dev.20` through `0.4.0-dev.22` are immutable rejected predecessors.
Their artifacts, hashes, receipts, and acceptance evidence cannot satisfy this
checklist.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.23` | source metadata synchronized |
| `rho.bridge` version | `0.1.13` | DESCRIPTION and package NEWS synchronized |
| `rho.agent` version | `0.1.5` | unchanged |
| Store schema | `11` | migration/recovery and project-isolation verification pass |
| Release tag | `v0.4.0-dev.23` | workflow default only; tag NOT CREATED |
| Release name | `Rho 0.4.0-dev.23` | workflow default only; Release/draft NOT CREATED |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | authoritative-candidate restriction unchanged |
| Local source commit | one reviewed feature-branch SHA | NOT COMMITTED |
| Authoritative source commit | one reviewed 40-character default-branch SHA | NOT SELECTED |
| macOS platform | `macos_aarch64` | exact local unsigned artifact NOT RUN |
| Minimum macOS | 14.0 | configuration unchanged |
| Release decision | `NO-GO` | implementation and acceptance open |

The version/tag is single-use. Rejection advances to another version; no
artifact, tag, draft, hash, or evidence file may be overwritten or relabelled.

## Corrective Scope

- The R bridge distinguishes a `parse()` failure from evaluation/runtime
  failures. Only that parse phase may inspect the bounded, anchored
  `<text>:line:column:` prefix emitted by R.
- A parse location is admitted only when positive bounded coordinates point to
  an actual Unicode scalar in the exact submitted code. It becomes a one-scalar
  exclusive range with `range_kind=r_parse_token`. EOF, zero, malformed,
  oversized, out-of-code, non-parse, virtual/Console, or partial input remains
  unlocated.
- The coordinator accepts only `r_expression` or `r_parse_token`, translates R
  character columns to editor UTF-16 coordinates through the already admitted
  source range, and rejects any result outside the real project source.
- Store schema v11 allows the two closed range kinds. The v10-to-v11 migration
  rebuilds `runs` in one transaction after a same-directory backup, preserves
  complete existing rows and indexes, performs no historical backfill, and
  reopens or rolls back truthfully after failure.
- Console and Problems treat a complete `r_parse_token` range as exact: the
  action says `Fix with Agent`, selects the token automatically, and binds the
  same failed run. A no-range fallback says explicitly that the failed run is
  ready but the source range is unavailable.
- No automatic Provider request, R execution, proposal acceptance, save, fuzzy
  source matching, or file mutation is added.

## Development Verification

Required evidence:

- R bridge: full-width punctuation, ASCII syntax token, Unicode/UTF-16
  coordinates, selection-relative translation input, EOF/no-token, malformed
  prefix, zero/overflow/out-of-line, non-parse failure, and bounded output;
- store: empty v11 bootstrap; v7/v8/v9/v10 migration; preservation of existing
  expression ranges; no historical parse backfill; v10 backup, injected
  rollback, reopen/recovery, constraint rejection, and two-project isolation;
- coordinator: both range kinds, exact Unicode translation, closed kind
  rejection, virtual/foreign/path and source-bound rejection, partial/malformed
  result rejection, and durable result persistence;
- frontend/mock: automatic parse-token selection and one typed repair turn from
  both Console and Problems; no Problems navigation from Console; truthful
  no-range fallback; duplicate, stale document, late refresh, project switch,
  route failure, and source-change rejection;
- JavaScript syntax, all frontend contracts, `rho.bridge`, affected Rust crates,
  complete Rust workspace/all-target verification, formatting, deterministic
  desktop/narrow browser review, and exact local app/DMG smoke.

Current evidence: PASS for the affected source matrix. All 45 fail-fast frontend
contract scripts and JavaScript syntax pass; `rho.bridge` passes 97 test blocks /
568 expectations; `rho.agent` passes 24 / 120; the complete Rust workspace/all-
target matrix passes 325 with zero failures and one existing opt-in Keychain
smoke ignored; formatting and `git diff --check` pass. Deterministic Chromium
review at exact `1440 x 900` and `800 x 900` passes with no page exceptions,
overlap, or horizontal overflow. Both Console and Problems select exactly `，`,
preserve `r_parse_token`, bind the exact failed run, create one Ask repair turn,
and leave source unchanged before Accept. Exact local app/DMG smoke remains
NOT RUN.

## Required Candidate Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.23_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.23_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.23-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.23_aarch64.dmg` | local macOS build / later finalizer | NOT RUN |
| `Rho_0.4.0-dev.23_aarch64.dmg.sha256` | local macOS build / later finalizer | NOT RUN |
| `rho-0.4.0-dev.23-macos-aarch64-evidence.json` | macOS finalizer | NOT RUN |
| `rho-0.4.0-dev.23-candidate-evidence.json` | draft assembly | NOT RUN |

No hosted candidate action may start without separate owner authorization, a
clean reviewed pushed default-branch commit in the authoritative repository, a
fresh tag/Release non-existence check, and complete exact-source validation.

## Installed Acceptance

The owner must install the exact immutable `dev.23` artifact and reproduce the
full-width-comma file parse failure. After the durable refresh, the Console
error site must show `Fix with Agent`; one click must select the exact invalid
token and start one real tool-capable Ask repair turn without opening Problems
or asking for a manual selection. The file must remain unchanged before Accept.

EOF/ambiguous no-range recovery, ordinary runtime-expression repair, route
setup, failed/missing refresh, rerun, restart, duplicate click, changed source,
stale acceptance, schema-v10 upgrade, and two-project switching must remain
truthful. Provider/Keychain use must expose no secret in UI, logs, evidence, or
process arguments. This gate is `NOT RUN`.

MAC5, candidate draft creation, update publication, Pages mutation, tag/Release
creation, and release GO remain separately gated and unauthorized.

## Current Decision

`NO-GO`. R5 implementation and affected automated/browser validation pass;
exact local artifact and owner-installed/live-Provider acceptance remain open.
No hosted or published candidate is authorized.

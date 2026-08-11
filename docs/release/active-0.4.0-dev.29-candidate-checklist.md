# Rho 0.4.0-dev.29 Cross-Platform Candidate Checklist

Status: active source-candidate contract; Issue #2 launcher, aisdk-readiness,
and fresh-readiness admission repairs are implemented on the current upstream
baseline and exact-source automated validation passes; pull-request update,
upstream integration, and every artifact, installed, MAC5, and publication gate
remain open

Date: 2026-08-10
Last updated: 2026-08-10

Change class: D1 narrow Agent runtime defect correction plus the required D4
single-use development identity

Risk: R2 for the desktop-to-Agent-R process boundary and startup readiness
admission; R4 for hosted candidate, signing/notarization, Release, update site,
or publication action

Owning documents: the active Windows Agent R Script Launch Repair
specification owns Issue #2 behavior and source acceptance. The active Windows
startup specification retains R/Ark discovery and cache ownership, and the
System Credential specification retains Provider, credential, routing, and
fresh Agent-readiness ownership. The active macOS arm64 specification owns
packaging and trust gates. This checklist alone owns the exact
`0.4.0-dev.29` identity and any future candidate, installed, MAC5, or
publication evidence.

Authorization: the project owner's 2026-08-10 instruction to fix PR #24
authorizes the reviewed Issue #2 repair slice, version synchronization, scoped
commit, and update of the existing pull-request branch. It does not authorize
upstream merge, candidate construction, installation, public publication, or
update-site mutation.

`0.4.0-dev.28` is an immutable source-only identity. It produced no artifact,
Draft, tag, acceptance, MAC5, publication, or update-site evidence and cannot
be relabelled, replaced, or composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.29` | metadata, workflow defaults, cache identity, release fixtures, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.13` | unchanged; no exported package contract changed |
| `rho.agent` version | `0.1.5` | unchanged; no exported package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.29` / `Rho 0.4.0-dev.29` | reserved defaults only; no tag or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Authoritative source commit | reviewed upstream default-branch SHA | pending PR #24 review and integration |
| Windows/macOS artifacts | exact `dev.29` candidate only | not built |
| Release decision | `NO-GO` | source validation passes; review/integration and every downstream release gate remain open |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Included Issue #2 Behavior

- desktop Agent R code is written to a flushed UTF-8 temporary `.R` file and
  passed to Rscript by path, avoiding Windows native-command-line failure from
  a large multi-line `-e` argument;
- complete Agent readiness requires `aisdk >= 1.5.0` and both Agent-only
  exports used by a turn, independently of a Provider connection test;
- the general R/Ark runtime cache no longer persists or reuses Agent readiness.
  Cache-hit and cache-miss startup both remain unavailable until a fresh probe
  completes, while legacy cache JSON remains readable for R/Ark facts.

No Provider request, credential, route, database schema, project state,
approval, Agent turn identity, frontend protocol, or R package contract
changes.

## Source Verification Gate

The exact `dev.29` source passes Rust formatting and complete workspace
check/tests: desktop 176 passed with one opt-in native Keychain smoke ignored,
server 59 passed, and store 108 passed. Both R package suites, JavaScript
syntax, all 52 frontend/release-contract scripts, version/release contract
checks, and `git diff --check` pass. Focused legacy-cache, pinned-aisdk, and
script-file transport regressions pass. Contract review found no broadened
credential, network, filesystem, execution, approval, project, schema, or
public-protocol authority.

The original Windows owner acceptance proved the script-file launcher and
pinned aisdk runtime could complete a real Agent turn. Exact installed
`dev.29` acceptance remains a separate open gate because the fresh-readiness
cache correction has not yet been exercised in an installed Windows build.

## Remaining Gates

Update and review [PR #24](https://github.com/YuLab-SMU/Rho/pull/24), then
integrate the reviewed source separately if authorized. Exact `dev.29`
candidate construction, Windows/macOS installed acceptance, MAC5, publication,
and update-site evidence remain independent facts.

Current decision: `NO-GO` for packaging or publication.

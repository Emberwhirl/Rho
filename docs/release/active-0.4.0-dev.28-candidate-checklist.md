# Rho 0.4.0-dev.28 Cross-Platform Candidate Checklist

Status: active source-candidate contract; Issue #25 CRED-UX4A-R3/R4
implementation, complete affected automated verification, deterministic
browser/CDP review, independent R3 review, and application identity
synchronization pass; upstream integration and every artifact, installed,
MAC5, and publication gate remain open

Date: 2026-08-10
Last updated: 2026-08-10

Change class: D3 credential/destructive-settings workflow plus the required D4
single-use development identity

Risk: R3 for revision-bound Provider/model/route/credential deletion and modal
admission; R4 for hosted candidate, signing/notarization, Release, update site,
or publication action

Owning documents: the active System Credential And Simple LLM Settings
specification owns Issue #25 behavior and source acceptance. The active macOS
arm64 specification owns packaging and trust gates. This checklist alone owns
the exact `0.4.0-dev.28` identity and any future candidate, installed, MAC5,
or publication evidence.

Authorization: the project owner's 2026-08-10 instruction to push, merge, and
reply authorizes the reviewed Issue #25 source slice, identity synchronization,
upstream pull request, merge, and final Issue evidence. It does not authorize
candidate construction, installation, public publication, or update-site
mutation.

`0.4.0-dev.27` and Draft `367934137` are immutable. Their artifacts,
acceptance asset, hashes, notarization receipt, and MAC5 result cannot be
relabelled, replaced, or composed into this identity.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.28` | metadata, workflow defaults, cache identity, release fixtures, and `NEWS.md` synchronized |
| `rho.bridge` version | `0.1.13` | unchanged; no exported package contract changed |
| `rho.agent` version | `0.1.5` | unchanged; no exported package contract changed |
| Store schema | `12` | unchanged; no persistence schema changed |
| Release tag/name | `v0.4.0-dev.28` / `Rho 0.4.0-dev.28` | reserved defaults only; no tag or Release exists |
| Source repository | `YuLab-SMU/Rho` | authoritative integration target |
| Authoritative source commit | reviewed upstream default-branch SHA | pending merge |
| Windows/macOS artifacts | exact `dev.28` candidate only | not built |
| Release decision | `NO-GO` | integration and every downstream release gate remain open |

The identity is single-use. Any artifact-producing failed run or later
user-visible source change consumes it and requires another version.

## Included Issue #25 Behavior

- one guarded revision-bound confirmation removes a Provider, its models,
  optional routes, and only its stored credential while preserving required
  Chat and unrelated Provider state;
- Connections projects Chat only when the route belongs to the selected
  Provider and never exposes another Provider's model in that detail;
- direct model deletion uses one visible topmost Model-settings confirmation,
  preserves the existing non-cascading backend rule, and restores focus on
  cancellation.

No route fallback, schema, package, network, execution, project, or credential
authority is added.

## Source Verification Gate

The active behavior specification records focused success, cancellation,
stale/rejection, failure-injection, credential recovery, two-Provider
isolation, mock/Tauri parity, modal/accessibility, wide/narrow browser, and CDP
interaction evidence. Complete affected Rust workspace, R package, and
frontend matrices passed at the reviewed source checkpoint.

The isolated pre-integration rerun also passed Rust format, complete workspace
check/tests (desktop 174 passed plus one opt-in Keychain smoke ignored, server
58, store 108), both R package suites, JavaScript syntax, all 52 frontend and
release-contract scripts, and `git diff --check`. A failing-first frontend run
caught stale escaped `dev.27` cache fixtures; synchronizing those fixtures to
`dev.28` restored the complete green matrix without changing behavior.

## Remaining Gates

Upstream pull request/merge, exact `dev.28` candidate construction,
installed-app acceptance, MAC5, publication, and update-site evidence remain
separate facts. Issue #25 may close after reviewed source integration and an
evidence comment; that closure does not satisfy or authorize any release gate.

Current decision: `NO-GO` for packaging or publication.

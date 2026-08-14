# Rho 0.4.0-dev.39 Conditional Prerelease Specification

Date: 2026-08-13

Status: implemented; CPREL1A-CPREL1D completed on 2026-08-13 for the exact
public `0.4.0-dev.39` conditional prerelease, with Windows human installation
and enabled-Gatekeeper macOS human launch preserved as `NOT RUN`

Change class: D4

Risk: R4 release/publication policy and public update-channel mutation

Candidate identity: `0.4.0-dev.39` / `v0.4.0-dev.39` /
`Rho 0.4.0-dev.39`

## Authorization And Problem

The exact `0.4.0-dev.38` candidate passed construction and independent artifact
audit, but its active contract and reviewed Release body require exact human
Windows and macOS acceptance before publication. Windows is unavailable in the
current desktop environment, and local macOS Gatekeeper assessments are
disabled. On 2026-08-13 the project owner explicitly authorized a public
`conditional prerelease` with those two observations left incomplete and
truthfully disclosed.

That authorization changes public release policy. It does not make either
missing observation pass and cannot be written as an ordinary MAC5 `GO`.
Because the `dev.38` Draft body, source identity, and admission contract are
already immutable, CPREL1 consumes a fresh `dev.39` identity. The `dev.38`
Draft remains unpublished and must not be mutated, relabelled, composed into,
or used to authorize `dev.39`.

## Goals

CPREL1 will:

- add a schema-version-2 acceptance decision named `CONDITIONAL_GO` whose
  status is `conditional`, never `passed`;
- bind the decision to the exact candidate evidence hash, source commit,
  version, tag, platform artifact records, publishing GitHub actor, timestamp,
  public-prerelease-only scope, and a bounded exact limitation set;
- permit that decision only for the explicitly allowlisted `0.4.0-dev.39`
  development prerelease;
- require exactly these limitations:
  `windows_human_install_not_run` with reason `no_windows_device`, and
  `macos_gatekeeper_human_launch_not_run` with reason
  `gatekeeper_assessments_disabled`;
- retain the existing schema-version-1 `passed` / `GO` path for already
  accepted historical candidates and future fully accepted candidates;
- publish a reviewed Release body that prominently says the two human checks
  were not run, that automated candidate evidence passed, and that the build is
  evaluation-only;
- project the same conditional status and limitation disclosure onto the
  download site while keeping the update manifest schema and artifact hashes
  unchanged; and
- build, sign, notarize, audit, conditionally accept, and publish one fresh
  immutable `dev.39` candidate without rebuilding between audit and release.

## Non-Goals And Safety Boundaries

CPREL1 will not:

- mark Windows human installation, Windows warning/publisher presentation,
  Windows uninstall, or enabled-Gatekeeper launch as passed;
- turn a conditional decision into a stable release, production-ready claim,
  ordinary `GO`, SignPath Foundation acceptance, public Windows trust, or
  SmartScreen reputation;
- make conditional publication generally available to arbitrary versions,
  arbitrary limitations, or missing artifact/security evidence;
- waive candidate construction, Windows Authenticode evidence, macOS Developer
  ID/notarization/stapling/Gatekeeper CI evidence, hashes, log privacy, source
  matrices, exact body checks, or protected publication workflow controls;
- mutate the `dev.38` Draft or reuse its binaries, request, hashes, evidence, or
  acceptance decision; or
- alter application runtime behavior, R package contracts, persistence,
  credentials, scientific execution, or project authority.

## Acceptance Evidence V2

The exact schema is:

```json
{
  "schema_version": 2,
  "type": "rho_candidate_acceptance",
  "status": "conditional",
  "decision": "CONDITIONAL_GO",
  "version": "0.4.0-dev.39",
  "release_tag": "v0.4.0-dev.39",
  "commit": "<40 lowercase hex>",
  "candidate_evidence_sha256": "<64 lowercase hex>",
  "platforms": "<exact candidate platform records>",
  "authorization": {
    "authorized_by": "<GitHub actor>",
    "authorized_at": "<RFC 3339 UTC timestamp>",
    "scope": "public_prerelease_only",
    "acknowledged_risks": [
      "macos_gatekeeper_human_launch_not_run",
      "windows_human_install_not_run"
    ]
  },
  "limitations": [
    {
      "id": "macos_gatekeeper_human_launch_not_run",
      "status": "not_run",
      "reason_code": "gatekeeper_assessments_disabled"
    },
    {
      "id": "windows_human_install_not_run",
      "status": "not_run",
      "reason_code": "no_windows_device"
    }
  ]
}
```

Keys and array order are exact. The workflow actor must equal
`authorization.authorized_by`. The timestamp must be a valid canonical UTC
timestamp. Strings and evidence remain within the existing 256 KiB budget.
Any missing, extra, reordered, stale, foreign-version, foreign-actor,
non-prerelease, ordinary-PASS, or differently limited conditional record fails
closed.

## Publication And Update Projection

The protected `rho-release` workflow remains the only publication lane. It
downloads the exact eight-asset Draft, computes the candidate-evidence digest,
binds the dispatch actor, validates either ordinary `GO` or allowlisted
`CONDITIONAL_GO`, and performs the existing single Draft-to-public transition.
It never uploads, deletes, replaces, or rebuilds candidate assets.

The update-site workflow downloads the acceptance asset as well as aggregate
and platform evidence. It validates the acceptance/candidate binding before a
release can enter the site or update manifest. The download page renders a
visible conditional-acceptance warning for `CONDITIONAL_GO`; ordinary releases
do not inherit that warning. The update manifest remains schema version 1 and
continues to expose the reviewed Release summary, release URLs, and exact
artifact hashes only.

## Work Packages And Stop Points

### CPREL1A — policy, schema, disclosure, and version

Authorized now. Add this contract, cross-review ownership, v2 validation,
negative tests, update-site validation/disclosure, reviewed `dev.39` notes, and
synchronized version metadata. Stop after focused and complete affected local
validation.

Completed. All 66 fail-fast JavaScript contracts, the complete locked Rust
workspace, Rust 1.88, both R package suites, syntax, YAML, release-note,
candidate, update-site, SignPath, and schema-v1 compatibility checks passed.

### CPREL1B — protected integration

Authorized after 1A passes. Open a reviewable PR, pass macOS/Windows stable and
Rust 1.88 matrices, merge through the protected branch process, restore every
branch rule, and pass the exact merged-main matrix. Stop before candidate
construction.

Completed through PR #73. PR run `31730361098` and exact merged-main run
`31731476659` passed all four macOS/Windows stable/MSRV jobs. The protected
source commit is `579d6dc0d64e770aea14b2282e75ccde2076b345`, and ruleset
`20728497` was restored to its one-approval, CODEOWNERS, last-push approval,
thread-resolution, deletion, and non-fast-forward protections.

### CPREL1C — exact candidate and independent audit

Authorized after 1B. Build one candidate from exact protected `main`, create
one seven-asset Draft, verify final hashes/signatures/notarization/stapling,
SignPath request binding, evidence, reviewed body, asset set, and log privacy.
Stop with the Draft unpublished.

Completed by candidate run `31732445952`. The exact seven-asset Draft was
downloaded independently and passed schema/file/sidecar binding, Windows PE
certificate-table and signer-thumbprint inspection, macOS DMG verification,
staple, Developer ID, arm64, entitlement, license, and mounted Workspace smoke
checks. The hosted-log privacy scan found no unmasked protected SignPath value.

### CPREL1D — conditional decision, publication, and live verification

Authorized by the owner's 2026-08-13 instruction after 1C passes. Create the
exact v2 acceptance asset, upload it once, invoke the protected publish workflow
as the same actor, verify the public eight-asset Release, tag/commit/body/hashes,
then verify the deployed download warning and development manifest. No rebuild
or asset replacement is permitted.

Generate that asset from the independently downloaded aggregate evidence rather
than transcribing hashes or platform records:

```sh
node scripts/candidate-release.mjs \
  --mode conditional-acceptance \
  --input <candidate-directory>/rho-0.4.0-dev.39-candidate-evidence.json \
  --authorizer xiayh17 \
  --authorized_at <canonical-past-UTC> \
  --output <candidate-directory>/rho-0.4.0-dev.39-acceptance.json
```

The generator validates the candidate schema and byte budget, requires the
canonical input/output names in one directory, binds the exact input bytes by
SHA-256, emits only the allowlisted risks and limitations, validates the result,
and creates rather than replaces the output file.

Completed. Acceptance SHA-256
`7812015d69dac1c88e27dae023260c8b913fad701c7d944dc128534c165d6ba5`
was uploaded once, publish run `31734766000` performed the only Draft-to-public
transition, and update-site run `31734975029` deployed and verified the live
conditional warning and exact development-manifest artifact hashes.

## Verification Matrix

Automated verification must include:

- ordinary schema-v1 `GO` compatibility;
- valid allowlisted v2 `CONDITIONAL_GO`;
- rejection of conditional `passed`, ordinary `GO` with limitations,
  non-allowlisted versions, stable versions, foreign actor, malformed/future
  timestamp, missing/extra/reordered limitations or risks, altered reason,
  stale commit/hash/platforms, extra keys, and evidence over budget;
- exact eight-asset Draft admission and single publication transition;
- release-body conditional disclosure and stale-body rejection;
- update-site acceptance download, hash/binding validation, warning projection,
  ordinary-GO warning absence, and malformed/missing acceptance rejection;
- candidate, SignPath, release-notes, update-site, version/MSRV, YAML, syntax,
  complete `scripts/test-*.mjs`, Rust, R package, and diff validation required by
  the existing candidate contract; and
- fresh candidate audit and live Release/update-site checks for exact `dev.39`.

## Version And Release Decision

Application version advances to `0.4.0-dev.39` because public acceptance
semantics and release presentation change. `rho.bridge` and `rho.agent` remain
unchanged because their package contracts do not change. `NEWS.md` records the
conditional-prerelease policy and explicit limitations.

Final decision: `CONDITIONAL_GO` for exact `0.4.0-dev.39`, scoped to a public
prerelease only. Release `370143482` was published on 2026-08-13. This decision
does not convert either human limitation into a pass and does not authorize a
stable or production-ready claim.

## Definition Of Done

CPREL1 is complete only when the implementation and negative tests are merged,
one fresh exact candidate is independently audited, its conditional acceptance
asset truthfully records both missing human observations, publication occurs
without rebuilding or replacing artifacts, the public Release and update site
show the conditional warning and exact hashes, branch protection is restored,
and related implementation branches are merged or removed.

Result: implementation, release, and live verification are satisfied. The
merged implementation branch was removed; the documentation-only evidence
reconciliation branch is removed after its protected merge. The immutable
`dev.38` Draft remains unpublished and unchanged.

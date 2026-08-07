# Rho 0.4.0-dev.16 Cross-Platform Candidate Checklist

Status: historical; retained as the immutable `0.4.0-dev.16` rehearsal and
NO-GO snapshot after the application baseline advanced to `0.4.0-dev.17` for
the Issue #4 Model settings completion; `0.4.0-dev.1` MAC4-R hosted automation passed on 2026-08-06 but
its installed DMG was rejected when hardened-runtime library validation
prevented Ark from loading official CRAN R; bounded `0.4.0-dev.2` replacement
repair and exact-commit fork rehearsal passed on 2026-08-06; upstream `main`
was integrated on 2026-08-07 and already had an independent development line
through `0.4.0-dev.15`, so the combined source advances to the single-use
`0.4.0-dev.16` identity; MAC4-R3 asynchronous notarization orchestration is
authorized, locally implemented, verified, and contract-reviewed; hosted
attempt 1 failed closed at the log-host allowlist; its exact-host repair passed
attempt 2's waiter, whose finalizer then failed closed on fresh-R `jsonlite`;
the bounded dependency repair and replacement exact-commit rehearsal passed;
upstream subsequently advanced through `b5800ae`; ordinary merge `9d3086e` and
the complete affected local matrix passed; replacement run `31165265090` at
exact post-merge commit `c4661bbe25dcc326737c51b385c65865a795edb9`
passed and reached the refreshed review-only stop; authoritative
candidate/draft, MAC5 acceptance, and release GO were NOT RUN; this document
is no longer an execution or candidate authority

Change class: D4 release candidate, signing/notarization, GitHub Release draft,
and update-publication inputs

Risk: R4

Historical ownership: the active macOS arm64 specification owns the MAC4/MAC5
sequence and macOS artifact. The accepted About/update design owns schema,
channel, endpoint, allowlist, and redirect semantics. This checklist owned the
exact integrated `0.4.0-dev.16` cross-platform rehearsal identity, evidence
binding, manual acceptance ledger, and NO-GO decision until the baseline
advanced. The
`0.2.0-dev.12` checklist does not apply to this candidate.

Authorization: the project owner requested "开始完成MAC4" on 2026-08-05.
This authorizes MAC4 implementation and draft-candidate construction only.
MAC5 installed acceptance, acceptance-evidence upload, publication, and live
Pages acceptance remain unauthorized. After identifying that upstream review
requires pre-merge hosted evidence, the project owner approved the bounded
artifact-only fork rehearsal with "行，那就这样做吧" on 2026-08-05. That
rehearsal has no candidate, Release, MAC5, or publication authority.
After installed-app evidence rejected the rehearsal DMG, the project owner
requested "修复这个问题，并push" on 2026-08-06. That authorization is limited
to the one-key library-validation entitlement, synchronized `0.4.0-dev.2`
identity, regression evidence, and a replacement fork rehearsal. On 2026-08-07
the project owner approved reducing idle macOS runner time with "我同意这个优化"
and requested "顺便同步一下上游仓库的最新更改". This authorizes the bounded
MAC4-R3 orchestration and non-history-rewriting upstream integration recorded
here; it does not authorize MAC5, a tag, Release, draft, Pages, or publication.

## Exact Identity

| Field | Required value | Current evidence |
| --- | --- | --- |
| Application version | `0.4.0-dev.16` | synchronized on merged source; full affected local verification passed 2026-08-07 |
| Release tag | `v0.4.0-dev.16` | workflow identity fixed; draft NOT RUN |
| Release name | `Rho 0.4.0-dev.16` | workflow identity fixed; draft NOT RUN |
| Release channel | development prerelease | fixed by SemVer |
| Source repository | `YuLab-SMU/Rho` | fixed |
| Source commit | one full 40-character SHA | fork rehearsal passed at `8de3dcc1dafc9e8562d239a6051a9113b778f1c3`; authoritative candidate pending |
| Windows platform | `windows_x86_64` | review-only rehearsal passed; authoritative candidate pending |
| macOS platform | `macos_aarch64` | signed/notarized review-only rehearsal passed; authoritative candidate pending |
| Minimum macOS | 14.0 | configured; exact candidate pending |
| Ark | 0.1.252 arm64 on macOS | pinned; exact candidate pending |
| Release decision | `NO-GO` | MAC5 not authorized or run |

The version/tag is single-use. If a draft or published release already exists
for the tag, candidate assembly fails without deleting, overwriting, or
replacing it. A withdrawn or rejected candidate advances to a new version.

## Required Draft Assets

| Asset | Evidence owner | State |
| --- | --- | --- |
| `Rho_0.4.0-dev.16_x64-setup.exe` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.16_x64-setup.exe.sha256` | Windows candidate job | NOT RUN |
| `rho-0.4.0-dev.16-windows-x86_64-evidence.json` | Windows candidate job | NOT RUN |
| `Rho_0.4.0-dev.16_aarch64.dmg` | macOS finalizer job | NOT RUN |
| `Rho_0.4.0-dev.16_aarch64.dmg.sha256` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.16-macos-aarch64-evidence.json` | macOS finalizer job | NOT RUN |
| `rho-0.4.0-dev.16-candidate-evidence.json` | draft assembly job | NOT RUN |

Each platform evidence file binds schema/type/status, version, tag, source
commit, platform, artifact name, byte size, lowercase SHA-256, and named checks.
The aggregate record requires both platform files to agree and binds the exact
asset set. Evidence JSON is capped at 256 KiB and checksum sidecars at 1 KiB.
Absolute runner paths, certificate/keychain paths, credentials, secret values,
and unbounded logs are forbidden.

## MAC4 Automated Candidate Gate

Before draft creation, the exact hosted checkout must pass:

- synchronized Cargo, Tauri, frontend package, lockfile, cache-busting, and tag
  identity checks;
- Rust format and complete workspace tests;
- complete `rho.bridge` and `rho.agent` tests;
- frontend JavaScript syntax and all deterministic `scripts/test-*.mjs` tests;
- deterministic candidate-evidence, update-manifest, workflow, and release
  contract fixtures including negative/failure cases;
- reproducible Ark bootstrap and architecture/checksum admission for the
  platform being built;
- Windows installer build and Workspace smoke on the supported GNU toolchain;
- macOS arm64 app/DMG build on `macos-26` with Xcode 26.6 and Workspace smoke;
- exact artifact filename, positive size, sidecar syntax, and recomputed hash
  agreement before any release API mutation.

A platform job failure prevents aggregate evidence and draft creation. A draft
job failure never publishes a partial release.

For the fork-only rehearsal, a hosted platform failure may activate only a
bounded repair of an already specified behavior or deterministic test. The
replacement must be a new full run of the exact updated fork `main` commit;
combining artifacts or results from different commits or runs is forbidden.
Windows checkout line endings, current-platform architecture, and lexical
local-source containment are explicit portability gates, not grounds to relax
the candidate contract. Every checked-out text input consumed by the MAC4
release-contract test must be normalized consistently before the unchanged
semantic assertions run; a one-off CRLF exception for only `Cargo.lock` does
not satisfy this gate.

The signed macOS build must prove the final DMG submission. Tauri's automatic
app-archive submission does not cover a DMG created afterward, so the Tauri
command retains signing variables but runs without notarization API variables.
The workflow submits the exact final DMG once with `notarytool --no-wait`, binds
the UUID and pre-submission artifact hash into a bounded pending record, waits
through the fixed Apple API from Ubuntu, and requires a bounded, identity-bound
Accepted log before a secret-free macOS finalizer may staple, Gatekeeper-assess,
smoke, or emit platform evidence. History-only inference and cross-run records
are forbidden.
Architecture checks must report the observed app and bundled-Ark architectures
on failure while continuing to require exact arm64 binaries.

## Historical MAC4 Local Implementation Evidence — 2026-08-05

Passed locally on Apple Silicon macOS 26.5.2 with Xcode 26.6, Node 22.22.3,
Rust 1.97.0, and arm64 R 4.5.2:

- synchronized Cargo workspace/lockfile, Tauri, frontend package/lockfile,
  browser mock, cache-busting, roadmap, and NEWS identity checks;
- candidate evidence and publish-admission fixtures, including malformed
  identity, missing/unknown platform, stale acceptance, NO-GO, evidence byte
  budget, and content hash/size rejection;
- legacy Windows-only and two-platform update generation, SemVer promotion,
  draft rejection, missing macOS, unknown platform, and bad asset/hash tests;
- 33 deterministic `scripts/test-*.mjs` suites, frontend syntax, workflow YAML,
  shell/bootstrap failure fixtures, both R package suites, Rust format, and the
  complete Rust workspace matrix;
- Tauri CLI 2.11.4 release `app,dmg` build with explicit `--no-sign`; the
  resulting `0.4.0-dev.1` app reports macOS 14.0 minimum, the app executable
  and bundled Ark are arm64, the DMG mounts with `Rho.app`, and the app-bundled
  Workspace smoke passed execution, Viewer, two-project, interrupt, restart,
  and crash-recovery checks.

The local DMG was deliberately unsigned and is development evidence only. Its
size/hash are not candidate identity and must not be copied into hosted
evidence. The Windows GNU target and PowerShell are absent locally; the hosted
Windows build is `NOT RUN`, not inferred from static configuration.

The repository does not contain signing/notarization credentials. At this local
checkpoint Developer ID import, hosted signing/notarization, stapling,
Gatekeeper, and platform/aggregate uploads were `NOT RUN`; the later bounded
fork rehearsal recorded below passed those automated gates. Authoritative
candidate draft creation remains `NOT RUN`.

## Rejected 0.4.0-dev.1 Fork Rehearsal — AUTOMATION PASSED / INSTALLED FAILED

The review-only rehearsal must run from the exact fork and cannot satisfy any
row in Required Draft Assets or MAC5 Installed Acceptance.

Run `31079170163` attempt 1 passed from fork `main` at exact commit
`f951db593cd1d48c7a862431b691a852a37e840f`. The final artifact is Actions ID
`8965129826`, retained through 2026-08-20. This evidence is review-only and does
not satisfy any Required Draft Asset or MAC5 row. Installed-app evidence later
rejected its DMG: signed Ark could not load the official CRAN `libR.dylib`
because hardened-runtime library validation required a matching Team ID.

| Gate | Required evidence | State |
| --- | --- | --- |
| Repository admission | `build_mode=rehearsal` and exact `YuLab-SMU/Rho_for_mac` identity | PASSED — run `31079170163` |
| Immutable source | one full fork commit shared by both platform jobs | PASSED — `f951db593cd1d48c7a862431b691a852a37e840f` |
| Windows rehearsal | installer, checksum, platform evidence and Workspace smoke | PASSED — 17,686,967 bytes; SHA-256 `9462d57f…72f0` |
| macOS rehearsal | signed/notarized/stapled DMG, checksum, Gatekeeper and Workspace smoke | PASSED — 20,391,851 bytes; SHA-256 `bb57b9f8…3866` |
| Aggregate rehearsal | bounded rehearsal record agrees with both platform files and hashes | PASSED — exact seven-file independent verification |
| Credential cleanup | temporary `.p12`, `.p8`, and Keychain removed on every outcome | PASSED — success, failure and cancellation paths observed |
| Mutation boundary | Actions artifact only; no tag, Release, Pages, environment, or repository mutation | PASSED — draft job skipped; no tag/Release; Pages 404 |

The final Actions artifact is retained for 14 days and contains only the two
platform artifact/checksum/evidence triplets plus
`rho-0.4.0-dev.1-rehearsal-evidence.json`. Candidate aggregate evidence is used
only transiently for validation and is not uploaded. Rehearsal evidence is not
accepted by candidate publication or update-site tooling. The main repository
must rebuild the exact candidate after merge.

## MAC4-R2 Replacement Rehearsal Gate — PASSED / HISTORICAL

The exact `0.4.0-dev.2` replacement must prove that the tracked entitlement
plist contains only `com.apple.security.cs.disable-library-validation = true`.
The hosted job must extract and validate that exact entitlement from the final
signed `rho-desktop` and Ark executables before notarization and smoke. A local
temporary signed-app smoke must also pass against official CRAN arm64 R with a
different Team ID. No evidence from `0.4.0-dev.1` may be reused.

Local evidence passed: the exact plist and bounded negative validator tests;
final-signature workflow ordering; full JavaScript/R/Rust affected matrices;
an isolated repaired installed-app smoke; and an actual Tauri 2.11.4
Developer-ID-signed `0.4.0-dev.2` app whose Rho and Ark signatures contain only
the required entitlement and whose complete Workspace smoke passed against
official arm64 R 4.5.2.

The exact-commit replacement rehearsal also passed on 2026-08-06 in run
`31097468979` attempt 1 at
`5b33a8f7e09a8e1466afd88cca117cf505cdd98f`. Actions artifact ID
`8972987578`, named
`rho-0.4.0-dev.2-rehearsal-5b33a8f7e09a8e1466afd88cca117cf505cdd98f-31097468979-1`,
contained exactly seven files and is retained through 2026-08-20. Independent
download verification recorded:

- Windows installer: 17,686,318 bytes, SHA-256
  `1615c8bd3383ef821e6289ee611c779707dbcec88469f0f4cdefe1b34ba0d343`;
- macOS DMG: 20,393,780 bytes, SHA-256
  `789919effd0fcddd61d7a12dcd2e0cf4cd5d51bf96ab8217566d0b255293f5de`;
- Windows evidence SHA-256
  `17165c8fec4eb7ecff6fc91518ef6becc864cd7271563a70a47a718e7bfa9890`;
- macOS evidence SHA-256
  `b8a32655e75642f455df36348e288f29fd50b3b74cbb0c9fe172920750b34d24`;
- aggregate rehearsal evidence SHA-256
  `213342874a00cc558f85636de69450aa2020f2f14790f3f87ffab2877f29e4c3`.

Both platform jobs, final-DMG notarization, staple, Gatekeeper, Workspace smoke,
evidence binding, and credential cleanup passed. Read-only audit found no tag,
Release, or Pages publication. This closes MAC4-R2 only. Because upstream used
the same prerelease numbers independently, this fork artifact is historical
review evidence and cannot satisfy the integrated `0.4.0-dev.16` candidate.

## MAC4-R3 Asynchronous Notarization Gate — PASSED / REVIEW-ONLY STOP REACHED

The two earlier passing macOS rehearsals spent more than 95% of their job time
waiting for Apple's service after local build/signing had completed. MAC4-R3
changes only CI orchestration; it does not change the app, entitlement set,
signing identity, notarization authority, candidate admission, or publication
policy.

The accepted workflow must satisfy all of these checks:

- a macOS submission job builds and signs the exact final DMG, validates both
  final executable signatures and entitlements, submits that DMG once with
  `notarytool --no-wait`, emits a bounded pending record, uploads the immutable
  submitted DMG, and removes all Apple credential files and the temporary
  Keychain before the job can succeed;
- the pending record binds schema/type, repository, mode, version, tag, full
  source commit, Run ID/Attempt, exact UUID submission ID, artifact name, byte
  size, and pre-submission lowercase SHA-256;
- an Ubuntu waiter downloads only that pending record, creates a fresh ES256
  JWT with `kid`, team-key `iss`, `iat`, `exp`, and
  `aud: appstoreconnect-v1`, and calls only
  `https://appstoreconnect.apple.com/notary/v2/submissions/{id}` plus the exact
  submission's `/logs` endpoint; the private key and bearer token are never
  printed or uploaded;
- `In Progress` is the only retryable 200 status. `Accepted` continues to log
  retrieval; `Invalid` and `Rejected` fail. Authentication/identity errors
  fail closed, while bounded transport failures, 429, and 5xx responses use
  bounded retries and the overall wait remains below the GitHub-hosted job
  limit;
- the waiter downloads and bounds Apple's terminal log JSON even on success,
  validates that it identifies the same submission, and emits an immutable
  accepted record. Unknown status, malformed/oversized JSON, wrong ID/name,
  non-HTTPS or non-allowlisted log URL, exhausted retry, and timeout all fail
  without fabricating acceptance. Allowed delivery hosts are Apple/itunes
  subdomains and the exact observed Notary bucket
  `notary-artifacts-prod.s3.amazonaws.com`; other AWS/S3 hosts remain denied;
- a fresh macOS finalizer downloads the exact pending record, accepted record,
  and submitted DMG; verifies their identity and original hash agreement;
  installs only `rho.bridge`'s declared non-base runtime import `jsonlite` in
  its temporary R library; staples the DMG; mounts it; repeats architecture,
  exact entitlement, codesign, Gatekeeper, and Workspace smoke against the app
  inside the DMG; then creates the final checksum and platform evidence;
- aggregate rehearsal/candidate jobs depend only on the finalizer, never on an
  unstapled intermediate. Intermediate artifact names cannot match final asset
  patterns and cannot enter aggregate or publication inputs;
- rerunning only failed waiter/finalizer jobs reuses the immutable submission
  ID and DMG instead of submitting a second copy. A new workflow run creates a
  new notarization request and may not reuse evidence from another run.

MAC4-R3 local implementation satisfies deterministic success, rejection,
stale/binding, malformed/oversized, 401/403/404, bounded transport/429/5xx
recovery, terminal rejection, timeout, log, and rerun-reuse coverage plus the
complete affected validation matrix. At that local checkpoint, final
acceptance still required one new exact-commit fork rehearsal. Its mandatory
stop remains review-only Actions evidence with zero tag, Release, draft,
Pages, or MAC5 mutation.

Local verification on 2026-08-07 passed all 39 deterministic JavaScript
contract suites, candidate/update self-tests, JavaScript syntax, workflow YAML,
`actionlint` 1.7.7 apart from its stale `macos-26` runner-label catalog warning,
Rust format and the complete 284-test workspace matrix with one opt-in native
Keychain smoke ignored, both complete R package suites, and diff checks. Review
confirmed that this is CI-only orchestration: application behavior, entitlement
set, package contracts, and public protocols are unchanged, so version remains
`0.4.0-dev.16` and no new `NEWS.md` entry is required. Hosted evidence is NOT
RUN at this local checkpoint and the decision remains NO-GO.

Hosted attempt 1, run `31160557569` at exact commit
`d40abeec0e3688e668a8fcf8d68a4e8bdf15e5f9`, proved `macos-submit` completed
and released its runner in 7 minutes 57 seconds. The Ubuntu waiter received
`Accepted` but failed closed because Apple's authenticated `/logs` response now
delivered the presigned JSON from the exact host
`notary-artifacts-prod.s3.amazonaws.com`. Finalization and aggregate evidence
were skipped, and no candidate, draft, tag, Release, or Pages mutation occurred.
The active repair may add only this exact hostname with positive and arbitrary-
S3 negative coverage, then must run a new exact-commit full rehearsal.
That repair passed the complete 39-suite deterministic matrix and a read-only
replay of attempt 1's immutable pending/DMG: the real Accepted log satisfied
UUID, status, filename, and SHA-256 binding without printing or retaining the
token, private key, or presigned URL. Replacement hosted evidence remains open.

Hosted attempt 2, run `31161705717` at exact commit
`de63af75f0cc6e3aa3142725c1b4b8712c7221b3`, passed the exact-host repair:
`macos-submit` completed in 7 minutes 39 seconds and the Ubuntu waiter completed
Accepted/log binding in 2 minutes 13 seconds. The finalizer passed immutable
binding, staple, both Gatekeeper gates, mount, app/Ark codesign, arm64, and exact
entitlements, then failed Workspace smoke because fresh R did not contain the
declared `rho.bridge` import `jsonlite`. No final platform/aggregate artifact or
publication mutation was created. The active repair may install and verify only
`jsonlite` before final smoke; Suggests, Agent dependencies, smoke weakening,
and clean-installed-app acceptance remain out of scope.
The repair passed all 39 deterministic suites, candidate/update self-tests, the
exact R dependency command, YAML/actionlint, and diff checks. Contract review
found no app, package, entitlement, public-protocol, version, or NEWS change;
at that checkpoint, replacement hosted evidence was still required.

Replacement run `31163017077` attempt 1 passed at exact fork commit
`8de3dcc1dafc9e8562d239a6051a9113b778f1c3`. `macos-submit` completed the
full validation/build/sign/smoke/submit/cleanup lane in 12 minutes 23 seconds;
the Ubuntu Accepted/log waiter completed in 8 seconds; and the secret-free
staple/Gatekeeper/Workspace finalizer completed in 1 minute 28 seconds. Total
macOS-runner use was 13 minutes 51 seconds, while Windows completed in
18 minutes 43 seconds and the entire workflow in about 19 minutes.

Final review-only artifact ID `8988354217` is named
`rho-0.4.0-dev.16-rehearsal-8de3dcc1dafc9e8562d239a6051a9113b778f1c3-31163017077-1`,
is 38,699,030 compressed bytes, has GitHub digest
`sha256:36f27de38736b09051ddf41302073c55783c66f3450012f98976ee234b0985c6`,
and expires at `2026-08-21T09:04:33Z`. Independent download and validation
proved the exact seven-file set, exact platform/rehearsal schemas, exact
repository/version/tag/commit/run binding, byte-for-byte checksum sidecars,
and all aggregate sizes and hashes. Key records are:

| Record | Bytes | SHA-256 |
| --- | ---: | --- |
| macOS arm64 DMG | 20,786,895 | `d897e62566ff0ad1469c24c343bc2e955065f236d7d5ed4582321c35c04377ce` |
| macOS platform evidence | 1,358 | `55d06e517c83d151b5e15a532cbd4434a01cc804bfe786f196e72a256e0f5709` |
| Windows x64 installer | 17,999,268 | `038b6aa0ce61f2d255d977b302616ae063621601e51f124a376fb3c52089018a` |
| Windows platform evidence | 904 | `387cb518195d7b3bae23ca1a88011616ba46108683a3aa67a0caa528dc226738` |
| Rehearsal evidence | 1,582 | `be937442fa855e3fc718052797ede62c89c9a2dae4fd9977f6b15c3e53cf1d19` |

The macOS evidence includes log-bound notarization, `notary_binding`, staple,
both Gatekeeper checks, exact arm64/entitlements, and DMG-internal Workspace
smoke. Repository audit found zero tags, zero Releases/drafts, no Pages site,
and a skipped draft-assembly job. GitHub's Node.js 20 action-runtime warnings
are a bounded follow-up; they did not affect this passing immutable evidence.
For that source, MAC4-R3 was closed at the mandated review-only stop and could
not satisfy any Required Draft Asset or MAC5 row.

The final pre-handoff upstream refresh added commits `801e38e` and `b5800ae`
after that successful run. Ordinary merge `9d3086e` contains upstream `main`,
preserves the new R-source-only Check Project behavior and its owning active
specification, and records the user-visible change under the combined
`0.4.0-dev.16` NEWS section. The complete local affected matrix passed with
285 Rust tests, one opt-in native-Keychain test ignored, all 92 `rho-store`
tests, all 39 JavaScript contracts, both complete R package suites, and format,
syntax, UI-contract, release-contract, and diff checks.

Run `31163017077` cannot validate code added after its exact commit. Because
there was still no authoritative candidate/draft/tag/Release, `0.4.0-dev.16`
remained available for a new full exact-commit fork rehearsal. Identity-only
dispatch `31165206877` rejected a nonexistent input ref before every platform
job and created zero artifacts.

Corrected run `31165265090` passed at exact post-merge commit
`c4661bbe25dcc326737c51b385c65865a795edb9`: macOS submit took 10 minutes
44 seconds, Ubuntu Accepted/log wait 12 seconds, macOS finalization 1 minute
26 seconds, Windows 17 minutes 27 seconds, and aggregation 9 seconds. Total
macOS-runner use was 12 minutes 10 seconds. Artifact ID `8989186831`, named
`rho-0.4.0-dev.16-rehearsal-c4661bbe25dcc326737c51b385c65865a795edb9-31165265090-1`,
is 38,699,930 compressed bytes with GitHub digest
`sha256:ac346d98b9a93af78ddce3fb7b14a143114babe2a619e6dcd0afdbd088cf6e13`.
Independent download validated the exact seven-file set and every schema,
sidecar, size, hash, platform check, and aggregate binding. Key records are:

| Record | Bytes | SHA-256 |
| --- | ---: | --- |
| macOS arm64 DMG | 20,786,925 | `1e8b2623852af68bb7bf5ffffa66d8f58a0f097be00d3c09bc02d3b67ee0a66c` |
| macOS platform evidence | 1,358 | `e03a2205a3203f156b04a1464cf9d8830fe91ae9e144531636770387e65d19d5` |
| Windows x64 installer | 18,000,150 | `8336f2c513a35708ec5dede230b9d67c27a2ddc9e4b212baee514a13f0316cd3` |
| Windows platform evidence | 904 | `db2235adff7077318251d7d037b78b367e6d83582296d8fe5f5e05cbce3111d3` |
| Rehearsal evidence | 1,582 | `4902575f84d3ef4c3c5bb9ed666ccbbe4d9618d9a71d73ce40daa10789a2a88c` |

The draft job skipped, repository audit found zero tags and Releases/drafts,
and Pages remains absent. This closes the refreshed MAC4-R3 review-only gate
without changing any Required Draft Asset or MAC5 row.

## macOS Signing And Notarization Gate

The hosted macOS submission, waiter, and finalizer jobs together must record all
of these as separate passed checks:

- Developer ID certificate imported into a newly created temporary keychain;
- key partition access limited to Apple/codesign tools;
- exact configured signing identity present;
- Xcode 26.6 selected from `/Applications/Xcode_26.6.app`;
- arm64 app and bundled Ark architecture verified;
- hardened runtime and project entitlements used by Tauri;
- final `rho-desktop` and Ark signatures each contain exactly
  `com.apple.security.cs.disable-library-validation = true`, recorded as the
  separate `entitlements` evidence check;
- `codesign --verify --deep --strict --verbose=4` passes for the app;
- Tauri signs the app and DMG without performing a separate app submission;
- the fresh finalizer installs and verifies only the declared `rho.bridge`
  runtime import `jsonlite`; bridge Suggests and Agent packages remain absent;
- the exact final DMG is submitted once with App Store Connect API credentials,
  the Ubuntu waiter receives `Accepted` for that exact UUID, and its bounded
  terminal log is retrieved and identity-checked;
- the DMG is stapled and `xcrun stapler validate` passes;
- Gatekeeper assessment passes for the app and DMG;
- temporary certificate, `.p8`, and keychain are removed in an unconditional
  cleanup step.

The required repository secrets are `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `KEYCHAIN_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_TEAM_ID`, `APPLE_API_ISSUER`,
`APPLE_API_KEY`, and `APPLE_API_PRIVATE_KEY`. The submission job writes
certificate and API-key files only under `RUNNER_TEMP`; it sets
`APPLE_API_KEY_PATH` to the temporary `.p8` path. The waiter receives only the
three API-key secrets as step-scoped environment and installs no third-party
dependencies. Secrets, JWTs, and secret paths never enter artifacts or release
evidence.

## Draft Assembly Gate

The assembly job has `contents: write`; platform build jobs have only
`contents: read`. It may create exactly one draft prerelease after both platform
artifacts and the aggregate record validate. It must:

- resolve the requested ref to the same commit recorded by both jobs;
- reject an existing release/tag before mutation;
- create the release with `draft: true` and `prerelease: true`;
- upload the required files once without deleting or replacing assets;
- re-read release metadata and prove names/sizes agree with aggregate evidence;
- leave Pages/update-site publication untouched while the release is a draft.

## MAC5 Installed Acceptance — NOT AUTHORIZED / NOT RUN

All rows remain open until MAC5 is separately activated and the checks are run
against downloaded assets from the exact draft.

| Gate | Required evidence | State |
| --- | --- | --- |
| Asset identity | tag, commit, names, sizes and hashes match aggregate record | NOT RUN |
| macOS 14 clean install | quarantine-preserving download, mount/install/launch | NOT RUN |
| Current macOS clean install | quarantine-preserving download, mount/install/launch | NOT RUN |
| R 4.4 | discovery, Workspace/Agent workflow and recovery | NOT RUN |
| Current stable R | discovery, Workspace/Agent workflow and recovery | NOT RUN |
| Signature/notarization | codesign, notary result, staple and Gatekeeper | NOT RUN |
| Upgrade/reinstall | prior state compatibility and truthful recovery | NOT RUN |
| Uninstall | documented app/credential/data retention behavior | NOT RUN |
| Core workflow | Unicode/spaces/symlink project, Git, Quarto, Plot, Viewer, Agent | NOT RUN |
| Offline/update | failure recovery, channel policy and user-initiated redirect | NOT RUN |
| Windows retained | exact Windows installer acceptance for same tag/commit | NOT RUN |
| Release decision | explicit D4 GO for this immutable candidate | NO-GO |

## Publish Admission Contract

The separate publish workflow is inert until MAC5 adds
`rho-0.4.0-dev.16-acceptance.json` to the draft. That record must be bounded JSON
with schema/type, `status: "passed"`, `decision: "GO"`, exact version/tag/commit,
the aggregate evidence SHA-256, and the complete candidate asset mapping. The
publish workflow downloads and validates the draft plus this record, then may
only change `draft` from true to false. It may not rebuild, upload, delete,
rename, or replace candidate assets.

After publication, the separate update-site workflow may regenerate Pages from
the published release. Draft build, signed artifact existence, and release
publication do not by themselves prove live Pages acceptance.

## Rollback And Withdrawal

- Before publication: leave a failed draft unpublished and advance the
  version; never repair an accepted candidate in place.
- After publication but before Pages: the GitHub Release remains authoritative;
  Pages failure is a separate publication failure and must not fabricate a
  successful update manifest.
- After a later withdrawal: mark the prerelease withdrawn and remove it from
  update discovery through a reviewed new Pages state. Preserve release and
  evidence records; do not replace same-version assets.

## Current Decision

`NO-GO`. The review-only `0.4.0-dev.1` artifact was rejected by installed-app
evidence. The `0.4.0-dev.2` repair and replacement rehearsal passed, but remain
fork-only historical evidence after the upstream version-line integration.
The integrated `0.4.0-dev.16` source identity is selected and MAC4-R3 is
implemented, locally verified, and passed exact-commit fork rehearsal
`31163017077` for its pre-refresh source. Latest upstream `b5800ae` is now
integrated, locally verified, and passed exact-commit fork rehearsal
`31165265090`; the refreshed review-only mandatory stop is reached. No
authoritative main-repository candidate, immutable draft, MAC5 installed
acceptance, or explicit GO exists.

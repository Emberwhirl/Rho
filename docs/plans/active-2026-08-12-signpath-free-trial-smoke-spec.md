# SignPath Free Trial Windows Smoke Contract

Status: active durable smoke contract; FT-SIGN1 source implementation,
dedicated least-privilege CI identity, protected deployment configuration,
official PowerShell/REST transport, clean hosted request, downloaded evidence
reconciliation, and privacy cleanup complete; returned bytes remain test-only
and grant no candidate, production-signing, or publication authority

Date: 2026-08-12 EDT

Authorization: after the existing SignPath organization, project, test
certificate, signing policy, artifact configuration, API token, and repository
secret were verified, the project owner instructed `继续，使用Free trial
subscription`. This authorizes FT-SIGN1: one isolated manual workflow, its
contract tests and documentation, protected integration, and one test signing
request against the existing Free Trial configuration. The owner's later
instruction to finish without repeated maintainer approval authorizes the
bounded credential correction needed to complete that request: replace the
interactive-user token with one dedicated CI user that has only the existing
test policy's Submitter role, and use the Free Trial console's documented
PowerShell/REST integration when the GitHub connector rejects an otherwise
valid token. It does not authorize a candidate, tag, GitHub Release,
update-site mutation, Foundation/public-trust claim, production certificate,
approval bypass inside SignPath, or any broader account role.

Owning issue: GitHub Issue #26

Amends: `active-2026-08-11-signpath-application-readiness-spec.md` only for the
bounded Free Trial smoke lane

Change class: D4 release-supply-chain integration

Risk: R4 overall; R3 credential, remote-signing, and returned-byte handling

Work package: FT-SIGN1

## Current External Evidence

The SignPath organization uses a Free Trial subscription. Project `rho`, test
policy `test-signing`, artifact configuration
`github-actions-nsis-installer`, and the `Rho Test Signing` certificate are
valid. A dedicated regular CI user named `Rho GitHub Actions` has only the
existing `rho` / `test-signing` Submitter role. Its API token exists and the
upstream repository exposes it only through the protected
`SIGNPATH_API_TOKEN` Actions secret. The certificate is a SignPath self-signed
X.509 test certificate and is not publicly trusted by Windows or Microsoft
SmartScreen.

The organization identifier, configured slugs, and expected certificate
thumbprint are external deployment configuration. The workflow receives them
only through one protected `SIGNPATH_DEPLOYMENT_CONFIG` Actions secret whose
JSON object has exactly these keys:

- `SIGNPATH_ORGANIZATION_ID`;
- `SIGNPATH_PROJECT_SLUG`;
- `SIGNPATH_SIGNING_POLICY_SLUG`;
- `SIGNPATH_ARTIFACT_CONFIGURATION_SLUG`; and
- `SIGNPATH_CERTIFICATE_THUMBPRINT`.

The five values were first configured as repository variables on 2026-08-12
after the current certificate page independently confirmed a
self-signed RSA-4096 Code Signing certificate whose subject and issuer are both
`CN=Rho Test Signing`. Deleted predecessor run `31674347116` proved that a
step-level repository-variable environment is rendered before the step can
issue an `add-mask` command. Therefore the variable interface was rejected, all
five values were migrated atomically to the protected JSON secret, and the
obsolete repository variables were removed after clean replacement run
`31675464182`. Repository source records only the secret name and the expected
JSON keys, never configured values.

The organization identifier must not be copied into repository source, Issues,
pull-request discussion, or public evidence. The configured slugs are not
credentials, but the workflow must not render them as configuration inputs in
logs. The certificate thumbprint may appear only in bounded returned-signature
evidence because it identifies the certificate already embedded in the signed
file. The API token, organization identifier, and complete deployment JSON must
never appear in source, logs, artifacts, documentation, or Actions variables.

The protected JSON secret may be referenced only by the first bounded
configuration step. GitHub masks the complete secret before Runner environment
rendering. That step must parse a JSON object, require the exact five-key set,
require non-empty single-line string values, validate the organization UUID,
slug characters, and 40-hex-digit thumbprint, register each individual value
with `add-mask`, and append only those validated values to `GITHUB_ENV`. No
later step may reference the configuration secret or repository variables.

## Scope And Immutable Input

FT-SIGN1 signs one already accepted, unsigned, internal-review installer rather
than rebuilding or altering a release lane:

| Field | Required value |
| --- | --- |
| Source workflow run | `31644429787` |
| Source artifact ID | `9160516935` |
| Source artifact name | `rho-0.4.0-dev.37-issue33-windows-installed-7ab861b01a36313150988b1e2fa8fdc2056325d9-31644429787` |
| Source commit | `7ab861b01a36313150988b1e2fa8fdc2056325d9` |
| Installer | `Rho_0.4.0-dev.37_x64-setup.exe` |
| Unsigned SHA-256 | `a8fa9ad2628590c9c12e176f22930d971fd8d2572dc606b52b55e38abb41bda6` |

That installer contains the Issue #33 internal acceptance overlay and remains
test-only. Signing it does not convert it into a candidate or distributable
release asset.

## Workflow Contract

The workflow is manual-only and has no inputs. It must:

1. run only from `YuLab-SMU/Rho` on the protected default branch and fail,
   rather than silently skip, when dispatched elsewhere;
2. grant only `actions: read` and `contents: read` to `GITHUB_TOKEN`;
3. verify the immutable source run completed successfully at the expected
   commit and that the exact source artifact is present and unexpired;
4. download only that artifact, locate exactly one expected installer, verify
   its SHA-256, and require `Get-AuthenticodeSignature` to report `NotSigned`;
5. wrap only the verified installer in one local ZIP, because the configured
   artifact configuration expects the same ZIP shape that GitHub artifact
   transport provided, and never re-upload that unsigned intermediary;
6. install exactly official PowerShell Gallery module `SignPath` `4.4.6`,
   verify `SignPath.psm1` SHA-256
   `4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae`,
   then call `Submit-SigningRequest` with the protected CI-user token,
   validated secret-backed deployment configuration, explicit artifact-
   configuration slug, local ZIP,
   bounded completion wait, and a separate signed ZIP path;
7. accept exactly one returned installer with the expected basename, reject
   `NotSigned`, `HashMismatch`, `NotSupported`, `Incompatible`, a missing signer,
   or a thumbprint mismatch, and record the actual signature status without
   relabeling it `Valid`;
8. require returned bytes to differ from the unsigned input, compute the final
   SHA-256, and write bounded JSON evidence with `public_release_authorized`
   fixed to `false`; and
9. upload only the returned installer and bounded evidence as a seven-day
   Actions artifact named as a Free Trial smoke result.

The workflow must not check out or execute code from the source artifact, write
repository contents, create/update a tag or Release, call candidate publication,
mutate Pages/update metadata, install the returned package, expose the token,
upload the unsigned ZIP, or invoke the rejected GitHub connector action. The
local unsigned and signed ZIP wrappers remain runner-ephemeral; only the
verified returned installer and bounded evidence may leave the job.

## Failure And Recovery

Missing or malformed deployment configuration or token, an unavailable or
expired source artifact, source identity/hash/signature mismatch, zero or
multiple installers, SignPath rejection/timeout, an unexpected returned filename, signer/thumbprint failure,
or unsupported/corrupt signature status fails before the final artifact upload.
Reruns create a new signing request and new run-scoped artifacts; their evidence
must never be composed. A failed request changes no repository, Release, or
update-site state and needs no rollback beyond retaining bounded logs and
revoking/rotating the API token if compromise is suspected.

Hosted run `31651681715` passed immutable input admission and unsigned
artifact isolation, then failed at SignPath authorization before a signing
request was created. The third-party action rendered repository-variable
inputs while reporting that failure. The run and its run-scoped intermediary
artifact were deleted, the invalid token was regenerated and written directly
to the protected repository secret, and the local/browser clipboard was
cleared. The regression invariant is that every deployment-variable value is
masked in the validation step before any third-party component starts. A retry
was forbidden until that correction integrated on the default branch.

The masking correction integrated as protected-main commit `3239e2d`. Hosted
runs `31672479047`, `31672718680`, `31672967663`, and `31673115826` then
reproduced connector authorization failure without leaking the masked values.
Debug run `31673210709` proved the pinned action received non-empty masked
inputs and the connector returned HTTP 400 only after the real GitHub artifact
handoff. The temporary Actions debug secret was deleted immediately afterward.

The interactive user's token was independently accepted by the SignPath REST
API but is ineligible for a trusted-build connector. A dedicated regular CI
user was therefore created, granted only the existing test policy's Submitter
role, and its predecessor/one-time-display tokens were rotated. The final CI
token returned HTTP 200 from `Cryptoki/MySigningPolicies`; a deliberately
invalid local connector probe authenticated and reached GitHub validation, but
the hosted connector still failed when it progressed to the SignPath signing
API. No signing request exists for these failures. The Free Trial signing
policy's own CI Integration tab documents direct `Submit-SigningRequest`, so
FT-SIGN1 now uses that official REST-backed module path instead of retrying the
failed connector. This is a transport correction only; immutable input,
certificate, output, retention, and no-publication invariants are unchanged.

Hosted run `31674347116` then completed one real signing request and passed its
in-job signature, signer, thumbprint, self-signed-certificate, and changed-byte
checks. Post-run log inspection found the organization identifier in the
Runner-rendered environment block of the first validation step, before that
step's masking command executed. The artifact therefore does not close hosted
acceptance even though its signed bytes are technically valid. The recovery is
to replace all five repository-variable inputs with the single protected JSON
secret above, remove the obsolete variables after a clean replacement run, and
retain this run only as failure evidence. No API-token rotation is required
because GitHub masked that separate secret throughout the run.

Protected-config repair commit `6714e73` completed the recovery. Hosted run
`31675464182` at that exact commit completed the SignPath request in 29 seconds;
the configured project's request list independently showed the request as
`Completed` under the dedicated `Rho GitHub Actions` CI identity. Its downloaded
artifact contains only the expected installer and bounded evidence. The
installer is 18,323,344 bytes with SHA-256
`a317b8aeba77a716b60e0018c9fc3c98fb1905cd0b5e6d62a892069c52d5672a`,
which differs from the immutable unsigned input. Windows reported the truthful
`UnknownError` status for the untrusted self-signed Free Trial chain; the
workflow separately proved the signer exists, subject equals issuer, the
embedded signer thumbprint matches the protected configuration, and none of
`NotSigned`, `HashMismatch`, `NotSupported`, or `Incompatible` occurred. It
does not relabel the test certificate as publicly valid.

## Cross-Review And Non-Goals

SP-READY1 retains privacy, manual update admission, public policy, Foundation
application, MFA, trusted-build/GitHub App, and production-signing ownership.
The `0.4.0-dev.37` checklist retains candidate identity, installed-candidate
acceptance, MAC5, publication, and updater authority. The Issue #33 artifact is
immutable input evidence only.

FT-SIGN1 creates no application/R-package behavior, schema, product network
lane, product credential format, `.signpath/policies` source/build policy, Webhook,
trusted-build link, Foundation application, or public trust. The dedicated CI
user is regular, is not an approver or administrator, and owns no signing role
outside the existing test policy. FT-SIGN1 does not modify the candidate or
Windows manual-publish workflows. The prior PR #51 design,
which coupled Free Trial signing to those publication lanes, is superseded by
this isolated contract and must not merge.

## Verification And Acceptance

Deterministic verification must prove:

- manual-only admission, exact repository/default-branch failure, and
  read-only permissions;
- immutable run/artifact/commit/name/hash binding;
- one exact-schema secret-backed deployment configuration, no repository-
  variable references, secret-only dedicated CI token, explicit artifact
  configuration, exact module version and module-file hash, local-only ZIP
  wrappers, and direct REST-backed upload;
- rejection of missing, extra, non-string, blank, multiline, malformed UUID,
  malformed slug, and malformed thumbprint configuration before module install;
- unsigned-input, returned-cardinality/name, forbidden signature-status,
  signer, thumbprint, and changed-byte checks;
- absence of Release/tag/update-site/candidate publication operations;
- bounded test-only output name, retention, and false publication authority;
- negative self-tests for removal or weakening of every gate above; and
- Node syntax, affected readiness contracts, workflow parsing by GitHub, and
  `git diff --check`.

Hosted acceptance is recorded separately from source verification. Run
`31675464182` finished successfully, its request is visible as `Completed` in
the configured project, and independently downloaded bytes reproduce the
workflow evidence for installer name, signer subject/issuer/thumbprint/status,
unsigned and signed SHA-256, and false candidate/public-release authority. No
installation is required because this package already passed Issue #33
installation before signing and the smoke gate owns only transport/signature
integrity.

## Implementation And Local Evidence

The source implementation adds only
`.github/workflows/signpath-free-trial-smoke.yml` and its deterministic contract
surface. It performs an admission-only metadata check, downloads but never
executes the immutable Issue #33 artifact, wraps only the verified unsigned
installer locally, verifies and invokes the fixed official SignPath PowerShell
module, validates the returned self-signed certificate and bytes, and retains
the result for seven days. The candidate, candidate-publish, and Windows
manual-publish workflows are unchanged from upstream `main`.

Local evidence on 2026-08-12:

- all 63 `scripts/test-*.mjs` contracts passed once without rerun, including
  both the positive FT-SIGN1 contract and its negative self-test;
- both SignPath readiness modes passed, preserving the manual-update/public-
  policy contract while recognizing the bounded Free Trial amendment;
- Ruby parsed every checked-in workflow YAML file, Node syntax checks passed,
  update-site self-tests passed, and `git diff --check` passed;
- a fresh authenticated download of source artifact `9160516935` reproduced
  the one expected installer at 18,315,177 bytes and the required unsigned
  SHA-256; and
- the initial repository settings exposed the five required variable names and
  the existing `SIGNPATH_API_TOKEN` secret name without reading or logging its
  value; the accepted state now exposes only the API-token and protected-
  configuration secret names, and the obsolete variables have been deleted.

Transport-correction evidence on 2026-08-13:

- the official PowerShell Gallery reported `SignPath` `4.4.6`; the downloaded
  package SHA-256 was
  `2487357a9a02c7d985baaf9ebd9158b4ce877316a2d9de3a6e9af1b263c0a32d`
  and its raw `SignPath.psm1` SHA-256 was the workflow-pinned value;
- all 63 repository `scripts/test-*.mjs` contracts passed once after the
  transport correction, both SignPath negative self-tests passed, the workflow
  parsed as YAML, and `git diff --check` passed; and
- no local PowerShell runtime was available, so embedded PowerShell execution
  and the returned archive/signature path remain intentionally owned by the
  protected hosted smoke rather than being claimed from source inspection.

Hosted acceptance and cleanup evidence on 2026-08-13:

- PR #68 exact head `c023c63` passed macOS and Windows on stable and Rust
  `1.88.0` in run `31674768700`, then merged as `6714e73` with the original
  protected-main rules restored and verified;
- run `31675464182` passed immutable admission, protected-config parsing,
  official-module integrity, real signing, returned-archive cardinality,
  Authenticode/signer/thumbprint/self-signed checks, changed-byte verification,
  and seven-day bounded upload;
- a complete hosted-log scan found neither the organization identifier nor the
  unique policy/configuration/thumbprint values, and confirmed both protected
  secrets were rendered only as `***`;
- independent artifact download reproduced the signed installer size/hash and
  all false authority fields; and
- the five obsolete repository variables and predecessor run containing the
  pre-mask environment log were deleted after the clean replacement passed.

A separate post-test supply-chain review found no checkout/execution of
downloaded source, write-scoped token permission, Release/tag/update-site call,
candidate/manual-publish modification, committed organization identifier or
certificate thumbprint, token reference outside the bounded module step, or
path that uploads the unsigned installer as the final result. The exact certificate
page independently confirmed self-signed subject/issuer equality and the
thumbprint stored in the protected deployment configuration. No blocking
finding remains.

Rust/R/application suites were not rerun locally because FT-SIGN1 changes no
Rust, R, frontend, package, schema, or installer-construction source. The
affected protected PR matrix remains mandatory and runs the complete locked
workspace on macOS/Windows stable and MSRV before integration.

## Version And Release Decision

FT-SIGN1 changes only internal CI and external test-signing evidence. It changes
no distributable application behavior, so application/R-package versions and
`NEWS.md` remain unchanged. The current release decision remains `NO-GO` for
SignPath production signing, candidate construction, human installed-candidate
acceptance, MAC5, publication, and updater mutation.

## Stop Point

FT-SIGN1 stops complete after run `31675464182` and evidence reconciliation.
Any use of returned bytes in a candidate or Release, any production certificate
or trusted-build integration, or any public wording change requires a separate
active D4/R4 contract and explicit authorization.

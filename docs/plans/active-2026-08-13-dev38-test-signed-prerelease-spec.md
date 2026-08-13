# Rho 0.4.0-dev.38 Test-Signed Prerelease Specification

Date: 2026-08-13

Status: active immutable NO-GO snapshot; source integration, exact-candidate
construction, and independent audit passed, but required human acceptance did
not. The owner authorized a new conditional policy only for fresh `dev.39`, so
this Draft/body/evidence remain unpublished and must not be rewritten

Authorization: after the accepted FT-SIGN1 smoke, the project owner instructed
the agent to use the Free Trial subscription, finish the remaining work without
repeated maintainer approval, publish a new version, and merge or clean related
branches. The owner then explicitly confirmed regeneration and storage of the
protected deployment configuration. This authorizes the bounded DEV38-SIGN1
work packages below. It does not waive exact-candidate evidence, human installed
acceptance, MAC5, or truthful public trust wording.

Change class: D4 release candidate, signing, publication, and update projection

Risk: R4; the protected configuration and signing-request lane are R3
supply-chain and credential boundaries

Candidate identity: `0.4.0-dev.38` / `v0.4.0-dev.38` /
`Rho 0.4.0-dev.38`

## 1. Problem And Evidence

FT-SIGN1 proved that the upstream repository can submit one immutable Windows
installer to the real SignPath Free Trial project through the pinned official
PowerShell module. Clean run `31675464182` returned changed bytes with the
expected signer thumbprint, self-signed subject/issuer equality, and
`UnknownError` trust status because the Free Trial certificate is not publicly
trusted. Its protected logs did not expose the deployment configuration or API
token.

FT-SIGN1 deliberately prohibited using those returned `dev.37` bytes in a
candidate or Release. The normal candidate workflow still hashes and publishes
an unsigned Windows installer, and the public download page still says every
Windows download is unsigned. A new exact identity and a candidate-owned
signing/evidence path are therefore required. Reusing, relabelling, or composing
the FT-SIGN1 artifact would be false evidence.

## 2. Goals And Non-Goals

DEV38-SIGN1 will:

- create one fresh `0.4.0-dev.38` cross-platform candidate from one exact clean
  upstream `main` commit;
- keep rehearsal Windows artifacts unsigned and review-only;
- for `build_mode=candidate`, sign the final Windows NSIS installer after all
  source/build/smoke checks and before final platform hashing;
- bind the returned bytes to the exact SignPath request, expected protected
  certificate thumbprint, pinned module, pre-sign hash, post-sign hash, source
  commit, version, tag, workflow run, and final platform evidence;
- expose only bounded non-secret signing facts in the existing Windows platform
  evidence asset;
- publish reviewed per-tag release notes and public/update-page wording that
  describes the Windows package as Authenticode-signed with a SignPath Free
  Trial self-signed test certificate, not a SignPath Foundation or publicly
  trusted production signature; and
- retain the exact candidate Draft until installed acceptance and explicit
  MAC5 GO bind to those final signed bytes.

DEV38-SIGN1 will not:

- reuse the `dev.37` FT-SIGN1 artifact, request, hash, evidence, or version;
- claim SignPath Foundation acceptance, a production certificate, Microsoft
  SmartScreen reputation, or a trusted publisher chain;
- install a Free Trial certificate into a runner or user trust store to turn
  `UnknownError` into a synthetic `Valid` result;
- sign or re-sign Ark, Jet, WebView2Loader, R, packages, operating-system files,
  or other upstream binaries;
- implement the future production two-stage executable-plus-installer signing
  procedure or bypass its manual approval/MFA/trusted-build requirements;
- change application behavior, R package contracts, SQLite schema, Provider
  credentials, project ownership, or scientific execution authority; or
- let automation substitute for human installed-candidate acceptance.

## 3. Ownership And Cross-Review

- This document owns only the `dev.38` candidate identity, Free Trial
  test-signing step, signing evidence, public trust wording, exact installed
  acceptance ledger, and release decision.
- `active-2026-08-11-signpath-application-readiness-spec.md` retains Foundation
  eligibility, public policy, MFA, GitHub App/trusted-build, production
  certificate, two-stage production signing, and incident-response ownership.
- `active-2026-08-12-signpath-free-trial-smoke-spec.md` remains a historical
  test-only proof for exact `dev.37` bytes. Its completed request does not
  become candidate evidence.
- `active-2026-08-10-versioned-release-notes-spec.md` owns release-body source,
  validation, exact-body stale protection, and the narrow `dev.27` bridge.
- `candidate-release.mjs`, the candidate Draft/publish workflows, and the
  active candidate checklist retain artifact-set, evidence, MAC5, and
  publication authority.
- About/Update V1 retains manifest schema, channel selection, allowlisted URLs,
  update-site projection, and Pages deployment. This package changes only the
  evidence-derived Windows trust wording for the new release.
- Apple Developer ID/notarization remains independent. AGPL licensing and
  bundled third-party notices remain unchanged.

No two documents claim the same signing result: FT-SIGN1 owns its isolated
`dev.37` smoke; this contract owns only a fresh `dev.38` candidate request;
SP-READY1 owns future production/Foundation admission.

## 4. Protected Configuration And Credential Boundary

The upstream repository exposes only these SignPath secret names:

- `SIGNPATH_DEPLOYMENT_CONFIG`, an exact-key JSON object containing the
  organization identifier, project slug, test policy slug, installer artifact
  configuration slug, and expected certificate thumbprint; and
- `SIGNPATH_API_TOKEN`, available only to the bounded submission step.

The workflow must validate the configuration's exact key set, types, UUID,
slug characters, thumbprint shape, non-empty values, and absence of newlines
before writing masked values to `GITHUB_ENV`. It must not print the JSON, token,
organization identifier, slugs, or raw thumbprint. The token is never a job-
level environment value and is not available to build, test, evidence, upload,
Draft, or publication steps.

The pinned official `SignPath` module version is `4.4.6`; its checked
`SignPath.psm1` SHA-256 is
`4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae`.
Any missing or changed configuration, token, module, hash, policy result, or
returned archive fails before candidate evidence or Release mutation.

## 5. Exact Windows Candidate Sequence

For `build_mode=rehearsal`, the existing fork-only path remains unsigned and
cannot create a Release. It carries no signing record or signing checks.

For `build_mode=candidate` in `YuLab-SMU/Rho`:

1. resolve and check out the exact current protected `main` commit;
2. run the complete Windows source, Rust, R, frontend, deterministic contract,
   installer-build, and Workspace smoke checks;
3. require exactly one correctly named unsigned NSIS installer and prove
   `Get-AuthenticodeSignature` reports `NotSigned` with no signer certificate;
4. hash the unsigned installer, copy it into an isolated one-file ZIP, and
   verify root-level archive cardinality/name;
5. install and hash-check the pinned official SignPath module;
6. submit one request with the protected Free Trial project/test policy and
   artifact configuration, wait at most 900 seconds, and require a UUID request
   identifier plus one returned one-file ZIP;
7. extract to a separate output path and verify the final installer name,
   changed SHA-256, expected certificate thumbprint, signer presence,
   subject/issuer equality, and exact `UnknownError` self-signed trust status;
8. only after all checks pass, promote the signed installer over the candidate
   path and write bounded signing facts with no secret/configuration values;
9. create Windows platform evidence over the final signed bytes, embedding and
   validating the signing facts; and
10. aggregate and upload the existing candidate asset set only after a strict
    candidate-mode signing gate passes.

The released installer hash is always the post-sign hash. The unsigned hash is
evidence only and cannot appear as the download checksum.

## 6. Signing Evidence Contract

Candidate-mode Windows platform evidence remains schema version 1 for
compatibility but has one Windows-only `signing` object with the exact keys:

- `provider`: `signpath`;
- `profile`: `free_trial_self_signed`;
- `request_id`: lowercase UUID returned by SignPath;
- `module_version` and `module_sha256`: the pinned values above;
- `signer_thumbprint`: normalized lowercase 40-hex expected certificate
  thumbprint;
- `self_signed`: `true`;
- `signature_status`: `UnknownError`;
- `unsigned_sha256`: the original installer hash; and
- `signed_sha256`: the returned final installer hash.

The signed hash must differ from the unsigned hash and equal the enclosing
artifact hash. The check list additionally requires passed
`authenticode`, `signpath_request_binding`, and `free_trial_self_signed`
records. Those check names are rejected without a valid signing object.

Unsigned rehearsal evidence retains the old exact key set and cannot pass the
candidate signing gate. Exact historical compatibility is limited to already
accepted `dev.27` Draft publication and already published `dev.24`; neither is
rewritten or newly described as signed.

## 7. Public Trust And Release-Notes Contract

`.github/release-notes/v0.4.0-dev.38.md`, `CODE_SIGNING_POLICY.md`, and the
generated download page must consistently state:

- the Windows installer carries an Authenticode signature made with the
  SignPath Free Trial self-signed test certificate;
- the signature proves that the returned bytes match this recorded test
  request but is not publicly trusted and does not establish SignPath
  Foundation acceptance or production publisher identity;
- Windows/SmartScreen may still warn, and users should compare the published
  SHA-256; and
- macOS remains Developer ID signed, notarized, and stapled independently.

The update manifest remains schema version 1 and contains only existing
allowlisted artifact URL/hash/size fields. Trust wording is rendered from
validated platform evidence and must not be inferred from a filename or generic
policy text.

## 8. Failure, Retry, And Recovery

- Any validation/signing failure leaves the job failed and creates no Windows
  platform evidence, aggregate evidence, tag, Draft, update row, or public
  claim.
- A returned archive with zero, multiple, nested, renamed, empty, or unchanged
  files is rejected.
- Missing signer, wrong thumbprint, non-self-signed subject/issuer, `NotSigned`,
  `HashMismatch`, `NotSupported`, `Incompatible`, `Valid`, or another unexpected
  status is rejected for this Free Trial profile.
- A rerun creates a new request and run identity; it cannot reuse output from a
  prior run. If a Draft/tag already exists, the single-use candidate admission
  still fails and the version must advance.
- The unsigned input remains runner-local for diagnosis until job cleanup and
  is never uploaded as a candidate or Release asset.
- Credential/configuration values are masked before use. A privacy scan of the
  exact hosted run is required before release GO.
- Candidate publication continues to be a single state transition after exact
  body, asset, evidence, acceptance, and MAC5 stale guards pass. Existing assets
  are never overwritten in place.

## 9. Work Packages And Stop Points

### DEV38-SIGN1A — contract and source implementation

Authorized now. Implement version synchronization, candidate-only signing,
evidence validation, public wording, deterministic positive/negative tests,
release notes, and candidate checklist. Stop after protected-main integration
and merged-main matrix evidence.

### DEV38-SIGN1B — exact candidate construction

Authorized after 1A integrates. Dispatch the exact current `main` as
`0.4.0-dev.38`, create one immutable Draft, download and independently inspect
all assets/evidence, confirm the SignPath request completed, and scan logs for
secret/configuration disclosure. Stop with Draft still unpublished.

### DEV38-SIGN1C — installed acceptance and MAC5

Authorized only against 1B's exact signed Windows installer and exact signed,
notarized, stapled macOS DMG. Record clean-install, launch/runtime, representative
core workflow, project switching/recovery, update/manual-network behavior,
uninstall, platform trust, final hashes, and human observations. Automation may
support but cannot replace the human record. A failed or unavailable mandatory
platform is `NO-GO`.

### DEV38-SIGN1D — publication and update projection

Authorized only after 1C records explicit `GO`. Upload the acceptance asset,
run the existing publish workflow once, verify the immutable public asset set,
release body, checksums, tag/commit, update page/manifests, and then reconcile
the checklist/docs. No build or signing occurs during publication.

## 10. Verification Matrix

Focused deterministic verification must cover:

- candidate/rehearsal admission and signing-required separation;
- exact protected-config key/type/shape validation and masking order;
- token visibility only in the submission step;
- build -> unsigned proof -> pinned module -> submit -> returned ZIP -> signer
  proof -> promote -> evidence -> upload ordering;
- valid signing evidence and mismatched request ID, module/hash, thumbprint,
  status, self-signed flag, unchanged hashes, artifact-hash mismatch, duplicate
  checks, and signing-checks-without-record rejection;
- `dev.27` and published `dev.24` compatibility only, with unknown unsigned new
  candidates rejected from Draft/publication/update projection;
- release-notes exact body and honest Free Trial/SmartScreen wording;
- update-page signed-test wording and absence of both the old blanket unsigned
  claim and a Foundation/production trust claim;
- synchronized version metadata, candidate/publish defaults, Cargo lock,
  frontend cache/mock identity, `NEWS.md` decision, and candidate checklist;
- Node syntax, YAML parsing, every `scripts/test-*.mjs` contract, PowerShell
  release metadata on Windows, Rust stable/MSRV on macOS/Windows, and
  `git diff --check`.

Hosted candidate evidence must additionally prove final hashes, signature
facts, request completion, exact artifact set, Apple signing/notarization/staple,
log privacy, and no Release/update mutation before MAC5.

## 11. Version, NEWS, And Release Decision

`0.4.0-dev.37` is consumed and immutable. DEV38-SIGN1A synchronizes every
application version authority to `0.4.0-dev.38`. R package versions remain
unchanged because their exported/runtime contracts do not change.

The Free Trial signature is a distribution/trust property rather than installed
application behavior. `NEWS.md` must record the new candidate identity and
truthful packaging limitation without claiming production signing. The reviewed
per-tag release-notes file owns the public presentation.

Current decision: DEV38-SIGN1A and DEV38-SIGN1B pass. PR #71 integrated the
reviewed source at `6f840796cbc04e6bb600474305148a8fe1043e74`; exact merged-main
matrix run `31678959111` passed macOS/Windows stable and Rust `1.88.0`.
Candidate run `31679767609` produced one seven-asset Draft bound to that commit.
Independent download, hash/evidence/body/state review, SignPath request and
certificate review, complete hosted-log privacy scanning, and no-publication /
no-update-site checks passed. Automated installation of the exact macOS DMG
also passed launch, runtime, project switch, Environment refresh, error/recovery,
model-settings/routing, and manual-update-check probes; this machine has
Gatekeeper assessment disabled, and automation does not satisfy either human
platform row. DEV38-SIGN1C, MAC5, publication, and update projection therefore
remain `NO-GO`.

On 2026-08-13 the owner authorized a public conditional evaluation prerelease,
but that changes the reviewed release contract and does not retroactively
convert either missing human row into PASS. CPREL1 therefore advances to fresh
`dev.39`. The exact `dev.38` Draft, seven assets, body, request, and hashes stay
immutable and unpublished.

## 12. Definition Of Done

DEV38-SIGN1 is complete only when:

- source implementation and all negative/compatibility tests pass and merge;
- one exact upstream-main Draft contains only the required final signed Windows,
  signed/notarized macOS, checksum, platform, and aggregate evidence assets;
- bounded Windows platform evidence proves the exact Free Trial request and
  final artifact hash without secrets;
- exact installed Windows and macOS acceptance is human-reviewed and bound to
  the same hashes;
- MAC5 records an explicit GO and publication succeeds without rebuilding or
  rewriting assets/body;
- the public Release and update site retain honest self-signed-test wording and
  exact checksums; and
- related implementation branches are merged or deleted without touching
  unrelated active work.

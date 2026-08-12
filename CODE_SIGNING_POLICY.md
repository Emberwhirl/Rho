# Rho Code Signing Policy

Last updated: 2026-08-11

Free code signing provided by SignPath.io, certificate by SignPath Foundation.

Rho publishes its source at <https://github.com/YuLab-SMU/Rho> under
`AGPL-3.0-only`. This policy defines which Rho artifacts may be signed, who may
request and approve signing, how signed bytes are verified, and how a signing
incident is handled. It does not claim that SignPath Foundation has accepted
the project before that external approval is recorded.

## Current platform status

- Apple Silicon macOS candidate packages use Apple's Developer ID Application
  signing and notarization path. That Apple trust chain is independent of
  SignPath.
- Windows downloads are currently not Authenticode-signed. Local and historical
  unsigned Windows packages are development/review artifacts and must not be
  represented as SignPath-signed or public-release-ready.
- If the SignPath Foundation application and production pipeline are approved,
  Windows will show the approved SignPath Foundation certificate identity as
  the publisher. A valid signature protects integrity and publisher identity;
  it does not guarantee immediate Microsoft SmartScreen reputation.

The exact status of a release is established by that release's evidence and
checksums, not by this policy alone.

## Signing scope

Only binaries built and owned by the Rho project are in the planned Windows
signing scope:

1. the Rho application executable, `rho-desktop.exe`; and
2. the final Rho NSIS installer wrapper that contains the already signed Rho
   executable.

Rho does not use its SignPath certificate to re-sign third-party upstream
binaries. This exclusion includes Ark, Jet, WebView2Loader, operating-system
components, R, R packages, and other dependency payloads. Those components
retain their upstream licenses, publishers, signatures, and notices.

## Trusted build and approval

Authoritative production signing requests must originate from the upstream
`YuLab-SMU/Rho` default branch on GitHub-hosted runners. A request binds the
exact source commit, workflow run and attempt, unsigned artifact identity,
SignPath policy/configuration, signed result, and final SHA-256 evidence.

Pull request, fork, and rehearsal paths fail closed and cannot use the
production signing policy. A workflow rerun, expired request, or artifact from
another run cannot substitute for the current candidate. Missing token,
organization, project, policy, or artifact-configuration data stops the
workflow before publication. Legacy/manual publication cannot bypass the same
signed-candidate gate.

SignPath requires manual approval for every signing request. Rho's intended
roles are:

- **Authors and Reviewers:**
  [YuLab-SMU organization members](https://github.com/orgs/YuLab-SMU/people);
- **Approvers:**
  [YuLab-SMU organization owners](https://github.com/orgs/YuLab-SMU/people?query=role%3Aowner).

Every person granted a signing-team role must use multi-factor authentication
(MFA). Authors do not approve their own request. Signing credentials and API
tokens belong only in protected encrypted secret storage; the certificate
private key remains in SignPath's protected signing infrastructure and is not
exported to the repository or runner.

Sensitive workflow, policy, and ownership files are assigned through
`.github/CODEOWNERS` and must be enforced by the default-branch repository
rules. The repository file alone is not evidence that those rules are active.

## Two-stage Windows procedure

NSIS cannot be treated as though signing only its outer wrapper also signs the
installed program. The production sequence is therefore:

1. build `rho-desktop.exe` without bundling an installer;
2. submit that exact executable to SignPath, obtain manual approval, download
   the signed result, and verify it;
3. create the NSIS installer from that verified signed executable;
4. submit the exact installer to SignPath, obtain manual approval, download the
   signed result, and verify it; and
5. install to an isolated location and verify that the installed
   `rho-desktop.exe` is the expected signed payload before computing and
   publishing final artifact hashes.

Verification is fail-closed and includes Windows Authenticode validity, the
approved SignPath Foundation publisher identity, an RFC 3161 timestamp, the
installed payload signature, artifact names and sizes, and SHA-256 values over
the final signed bytes. Signing changes bytes, so a pre-signing hash can never
serve as the released artifact hash.

The production workflow is implemented only after real SignPath organization,
project, signing-policy, and binary/installer artifact-configuration identifiers
exist. Placeholder or guessed identifiers are not accepted configuration.

## Release and incident response

A signed artifact is still only a candidate. Public publication requires the
repository's exact-candidate checks, clean-install and core-workflow acceptance,
installed-payload verification, uninstall acceptance, macOS trust evidence,
and explicit release GO for the same immutable bytes.

If a key, token, policy, trusted build, approval, artifact, or published
signature may be compromised or incorrect, maintainers must stop new signing
and publication, preserve bounded audit evidence, remove affected releases and
update entries, rotate/revoke credentials or certificates when appropriate,
contact SignPath support, and publish corrected incident information. Existing
release assets are never silently overwritten or relabelled.

Report signing or supply-chain vulnerabilities through
[GitHub private vulnerability reporting](https://github.com/YuLab-SMU/Rho/security/advisories/new),
without including secrets in a public Issue.

References:

- [SignPath Foundation Terms](https://signpath.org/terms.html)
- [SignPath trusted build systems for GitHub](https://docs.signpath.io/trusted-build-systems/github)
- [Rho license and third-party notices](LICENSES.md)
- [Rho privacy policy](PRIVACY.md)

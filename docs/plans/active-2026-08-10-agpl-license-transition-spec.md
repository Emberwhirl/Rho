# AGPL License Transition Contract

Status: active; LIC-1 and LIC-2 implementation, validation, review, exact-head
hosted validation, and protected integration are complete; exact candidate and
installed-app distribution acceptance remain open

Date: 2026-08-10
Authorization: project owner directed that Rho use AGPL instead of MIT to
prevent proprietary closed-source derivatives on 2026-08-10
Change class: D3 public legal, contribution, source-distribution, and release
contract
Risk: R3 repository-wide licensing and downstream distribution compatibility
Work packages: LIC-1 complete; LIC-2 active
Owning issue: GitHub Issue #26

## Decision And Intent

Rho-original source is to be licensed prospectively under the GNU Affero
General Public License version 3 only, SPDX identifier `AGPL-3.0-only`.
`-only` is intentional: this contract does not grant an automatic option to
use a later AGPL version.

AGPL permits commercial use. The reason for choosing it is reciprocal source
availability: recipients of distributed modified versions receive source
rights, and users interacting remotely with a modified network version must be
offered its corresponding source. This is not a non-commercial license and
must never be described as banning commercial activity.

The transition is prospective. It does not revoke, narrow, or relabel any MIT
permission already received for historical Rho versions or copies. No
proprietary/commercial dual-license program is introduced by this work
package.

## Scope And License Boundary

LIC-1 owns only the repository source-license transition and deterministic
metadata enforcement:

- add the unmodified AGPL version 3 text at the repository root;
- identify Rho-original code, documentation, tests, and scripts as
  `AGPL-3.0-only`, except where a file or directory carries another notice;
- synchronize Cargo, frontend package, R package, README, and contribution
  metadata;
- preserve every third-party component under its own license and document
  the known vendored/runtime boundaries;
- add a deterministic repository contract test; and
- amend Issue #26 so its approved-license prerequisite no longer says MIT.

LIC-1 does not relicense `vendor/jet`, Ark, frontend vendor assets, package
manager dependencies, operating-system components, or any other third-party
work. Their upstream licenses, notices, and attribution remain controlling.

LIC-1 does not implement SignPath, Authenticode, privacy policy, code-signing
policy, signing credentials, release workflow mutation, or a new distributable
candidate. Those remain under the D4/R4 phases of Issue #26.

### LIC-2 Installed Distribution Surface

After asking to merge and publish the next version, the project owner directed
the agent to complete all remaining required work on 2026-08-12. LIC-2 is the
bounded prerequisite already identified by this contract: make the Rho license
available inside each supported desktop distribution and expose a truthful,
accessible legal notice in About before constructing that candidate.

LIC-2 is D4/R4 because it changes installer resources, candidate verification,
a public legal surface, and one desktop command. It is limited to:

- declaring `AGPL-3.0-only` in Tauri bundle metadata while deliberately
  leaving `bundle.licenseFile` unset so AGPL is not rendered as an installer
  click-through EULA;
- bundling the exact root `LICENSE` plus `LICENSES.md` under a stable
  Rho-owned resource path on macOS and Windows;
- showing `GNU AGPL v3.0 only`, the existing source-repository link, and a
  short corresponding-source statement in About;
- adding one no-input Tauri command that resolves only the fixed bundled Rho
  license resource and asks the operating system to reveal it; and
- keeping browser/mock behavior aligned and adding deterministic configuration,
  command-boundary, user-interface, and packaging-workflow checks.

The command accepts no caller path, URL, project identity, or content. It must
resolve the constant bundled path through Tauri's resource directory, reject a
missing or non-file resource truthfully, and reuse the existing platform reveal
adapter. LIC-2 adds no arbitrary filesystem read, write, execution, network,
credential, persistence, project, approval, update, or signing authority.

The Tauri resource copies are distribution convenience copies, not new license
grants. `LICENSES.md` remains the authoritative third-party boundary index;
third-party payloads retain their own licenses and notices. Windows signing,
SignPath eligibility, candidate identity, installed acceptance, publication,
and updater mutation remain separately owned release gates.

## Contribution And Relicensing Gate

The current repository history includes contributions outside the project
owner's own commits. Before this transition may merge, one of these evidence
paths must be recorded in the pull request:

1. every contributor whose copyright is required grants permission to license
   their identified contribution under `AGPL-3.0-only`, while retaining all
   earlier grants; or
2. an authorized project legal/ownership determination records why the
   existing inbound permission is sufficient for the prospective repository
   transition.

At minimum, the commits attributed to `Emberwhirl` and `xuzhougeng` must be
covered by that review. An engineering instruction is authorization to prepare
the change; it is not evidence that another contributor has granted copyright
permission. Both named contributors have now supplied the required additional
grant in PR #30, satisfying this external merge gate without revoking any
earlier permission or transferring copyright.

New contributions accepted after the transition use the same
inbound-as-outbound `AGPL-3.0-only` terms. Contributors must have the right to
submit their work, and imported third-party content must preserve provenance
and compatible licensing.

## Distribution And Release Gate

- Existing releases, tags, artifacts, and copies retain the license grant
  applicable when they were distributed. Their bytes and labels are immutable.
- In particular, the existing `v0.4.0-dev.27` candidate must not be relabelled,
  rebuilt, or treated as an AGPL artifact.
- A future candidate may be described as AGPL only when it is built from a
  commit after this transition merges, includes the license and required
  third-party notices in its source/distribution boundary, and passes its own
  exact-candidate review.
- Before a future interactive desktop candidate is distributed, its About or
  equivalent legal-notice surface and bundled license path must be reviewed
  against AGPL notice/source-offer obligations. LIC-1 does not claim that
  installed-app acceptance.
- SignPath Foundation eligibility remains SignPath's decision. AGPL is
  OSI-approved, but LIC-1 does not claim application or approval success.

## Cross-Review

- Issue #26 remains the owner of SignPath application, code-signing policy,
  privacy policy, Authenticode architecture, credentials, approvals, signed
  bytes, evidence, and release admission. LIC-1 satisfies only its source
  license prerequisite.
- Release checklists remain the sole authority for exact candidate identity,
  artifact immutability, installed acceptance, and publication. License
  metadata cannot mutate a historical candidate.
- Cargo workspace metadata owns Rust package license projection; individual
  workspace members continue to inherit that value.
- The R package `DESCRIPTION` files use R's standard `AGPL-3` identifier.
  Repository policy fixes the project choice to version 3 only; no package
  local file adds or removes terms.
- Third-party manifests and license files remain upstream-owned. A Rho contract
  test may inventory their boundaries but may not replace or reinterpret them.
- No schema, persistence, project, approval, credential, network, execution,
  or application behavior changes. No unresolved ownership or contributor-
  permission conflict remains inside LIC-1.

## Acceptance And Verification

Automated acceptance must prove:

- root `LICENSE` contains the canonical GNU AGPL version 3 text, including the
  remote-network-interaction section;
- every Rho Cargo workspace package reports `AGPL-3.0-only` through
  `cargo metadata`;
- frontend metadata reports `AGPL-3.0-only`;
- both R packages report `AGPL-3`, name YuLab-SMU as copyright holder, and no
  longer reference package-local MIT license files;
- README, contribution guidance, and third-party boundary documentation agree
  on commercial-use, historical-grant, and third-party-license semantics;
- the contract rejects stale MIT metadata and missing boundary notices; and
- the affected Cargo/R/Node metadata remains parseable and buildable.

Run the focused contract test, its negative self-tests, Cargo metadata/check,
R package build or check validation, JavaScript syntax, and `git diff --check`.
Do not report SignPath acceptance, installed-app acceptance, or contributor
consent unless the corresponding external fact is recorded.

LIC-2 automated acceptance must additionally prove:

- base Tauri metadata declares `AGPL-3.0-only`, leaves `licenseFile` absent,
  and therefore does not create a separate installer-acceptance gate;
- both platform configurations map the exact root `LICENSE` and `LICENSES.md`
  into the stable `licenses/rho/` resource boundary without dropping Ark or
  Windows runtime resources;
- About presents the license identity, source availability, keyboard/focus-
  reachable source and bundled-license actions, and no raw resource path;
- the real command has no input parameter, resolves the constant path through
  `BaseDirectory::Resource`, rejects missing/non-file state, and is registered;
- browser/mock mode handles the same command without host filesystem access;
- candidate automation verifies the exact signed macOS application-bundle
  copies before notarization submission and again from the mounted final DMG;
- the update-site validator keeps the immutable published `0.4.0-dev.24`
  evidence readable even though that historical candidate predates
  `license_boundary`, while every new `0.4.0-dev.33` candidate remains
  fail-closed when the check is absent; the compatibility exception is an
  exact version allowlist and is never available to candidate construction or
  publication admission;
- changes to the candidate-evidence validator, update-site generator, and
  relevant publication workflows trigger source CI, whose stable jobs execute
  the generator self-test rather than only inspecting its source text;
- JavaScript syntax, focused contracts, affected Rust tests, the complete
  deterministic script matrix, and `git diff --check` pass.

Candidate-build success is not installed acceptance. The exact candidate must
still prove the bundled file opens offline from About on both supported
platforms and that its bytes match the release source `LICENSE`. A missing,
mismatched, or unreachable installed license is release `NO-GO`.

## Version, NEWS, And Stop Point

LIC-1 changes repository legal metadata, not application or R package runtime
behavior. It creates no application candidate and therefore does not change
the application version, R package versions, schema, or `NEWS.md`.

LIC-2 is user-visible desktop and installer behavior. It joins the already
reserved, not-yet-built `0.4.0-dev.33` candidate, amends `NEWS.md`, and leaves
the synchronized application version unchanged. It changes no R package
contract or store schema.

LIC-1 stopped after protected integration. LIC-2 stops after the bounded
distribution surface, complete affected validation and review, scoped commit,
exact-head hosted CI, and protected merge. It must not construct or publish a
candidate, claim installed acceptance, or expand into SignPath implementation.

## Implementation And Review Evidence

LIC-1 added the canonical GNU AGPL version 3 text (SHA-256
`8486a10c4393cee1c25392769ddd3b2d6c242d6ec7928e1414efff7dfb2f07ef`) and
synchronized Cargo, frontend, lockfile, R package, README, contribution, and
third-party boundary metadata. The two former R package-local MIT placeholder
files were removed. Issue #26 now records `AGPL-3.0-only`, commercial-use and
historical-grant truth, third-party exclusions, and the contributor merge gate.

The third-party review found that checked-in Monaco and KaTeX payloads lacked
their upstream license files. Their deterministic sync scripts now copy those
licenses. Both scripts preflight every required source/license before replacing
the checked-in payload, and a temporary-repository test proves success,
missing-license rejection without data loss, and recovery for each path. This
is an in-scope correction to the accepted third-party notice boundary, not a
new dependency or runtime behavior.

Affected automated evidence on macOS arm64:

- `node scripts/test-license-contract.mjs --self-test` passed ten negative
  contract cases;
- `node scripts/test-license-contract.mjs` passed the real repository contract;
- `node scripts/test-vendor-license-sync.mjs` passed both mutation rejection
  and recovery matrices;
- JavaScript syntax checks, real Monaco/Viewer resynchronization, local Markdown
  link validation, the canonical-license API comparison, and
  `git diff --check` passed;
- Cargo dependency license metadata had no unexplained missing value; the sole
  local `jet_core` `NOASSERTION` is mapped to `vendor/jet/LICENSE`; all nine
  Node dependency records include license metadata;
- `cargo check --workspace --all-targets --locked` passed;
- `cargo fmt --all -- --check` and `cargo test --workspace --locked` passed
  355 tests with one opt-in Keychain smoke ignored;
- both R package source builds passed; `rho.agent` `R CMD check` was OK;
  `rho.bridge` tests passed while its existing dependency/documentation state
  reported three warnings and one note unrelated to the license metadata; and
- focused `testthat::test_local()` runs for both R packages passed.

A deliberately separate R3 review compared the accepted contract to the
complete diff, public Issue text, dependency-license inventory, contributor
history, historical candidate boundary, and version/release scope. It removed
an unnecessary CLA/DCO policy assertion and changed Viewer synchronization to
fail before mutation when a notice is missing. No blocking engineering finding
remains. Installed-app legal-notice claims, SignPath acceptance, and public
release remain separate and unrun.

On 2026-08-11, `Emberwhirl` explicitly consented in PR #30 to license the
identified contribution under `AGPL-3.0-only` in addition to existing grants.
On 2026-08-12, `xuzhougeng` supplied the same explicit additional grant in PR
#30. These contributor-authored records satisfy LIC-1's relicensing gate; they
do not revoke historical MIT grants or transfer either contributor's
copyright.

The LIC-1 branch was synchronized through upstream `main`
`3a3546bd76cc11761263a5af8e060ba73a4a0580`, preserving the current
`0.4.0-dev.33` product/release metadata, the integrated editor-envelope and
deterministic discovery/file-lane test repairs, Resolver 3, the Rust 1.88 MSRV
contract, and locked candidate validation. Textual conflicts were resolved
compositionally:
the frontend lockfile root retains both version `0.4.0-dev.33` and license
`AGPL-3.0-only`; `rho.bridge` retains version `0.1.14` and gains the agreed
AGPL/copyright projection; the workspace manifest retains both
`rust-version = "1.88"` and license `AGPL-3.0-only`.

The exact synchronized tree passes the canonical/negative license contract,
vendor-notice failure/recovery tests, all 56 JavaScript contracts, JavaScript
syntax, Rust formatting, locked all-target workspace check, complete locked
workspace tests (desktop 176 passed with one opt-in Keychain smoke ignored;
server 59; store 108; all other suites passed), both focused R package suites,
and `git diff --check`. Exact head `c831354255fbcd225129b217e72af8e6a68a6332`
then passed macOS/Windows stable and Rust 1.88.0 in run `31558086732`; PR #30
merged without bypass as `f37276940499d80b4898f630d3c683e13a554a3f` on
2026-08-12. LIC-1 is therefore protected-integrated.

LIC-2 adds explicit Rho license/notice resource mappings to both platform
bundles, static About license/source copy, and the no-input
`show_rho_license` command. The command resolves only
`licenses/rho/LICENSE.txt` through `BaseDirectory::Resource`, rejects missing,
directory, and symbolic-link states, and returns fixed user-facing failures.
Browser/mock mode handles the same command without host filesystem access.
Tauri's `licenseFile` remains deliberately absent after review found it is the
consolidated installer/DMG rendered-license input; the AGPL notice is not an
extra click-through EULA.

LIC-2 local evidence on macOS arm64 passes JavaScript syntax, all 59
deterministic Node contracts, Rust formatting, locked all-target workspace
check, and complete locked workspace tests (desktop 177 passed with one opt-in
Keychain smoke ignored; server 59; store 108; all other suites passed). A local
Tauri debug `.app` contained the exact root `LICENSE` SHA-256
`8486a10c4393cee1c25392769ddd3b2d6c242d6ec7928e1414efff7dfb2f07ef` and
exact `LICENSES.md` SHA-256
`9d492d86d330662b7a6f78e73fb3266269d88c654cdaa9ce124037203306249b`
under the fixed Rho resource path; its Workspace smoke passed. Computer Use
confirmed the About notice, accessibility projection, action layout, and that
Show License File revealed the exact bundled file. This is local bundle/UI
review, not exact candidate or installed-app acceptance. Windows bundle,
exact-head hosted CI, protected merge, exact candidate, and installed
acceptance remain open.

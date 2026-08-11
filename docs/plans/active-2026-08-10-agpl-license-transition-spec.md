# AGPL License Transition Contract

Status: active; LIC-1 implementation, affected automated verification, and
independent contract review complete 2026-08-10; `Emberwhirl` relicensing
consent recorded; `xuzhougeng` consent or an authorized legal determination
and future distribution acceptance remain open

Date: 2026-08-10
Authorization: project owner directed that Rho use AGPL instead of MIT to
prevent proprietary closed-source derivatives on 2026-08-10
Change class: D3 public legal, contribution, source-distribution, and release
contract
Risk: R3 repository-wide licensing and downstream distribution compatibility
Work package: LIC-1
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
permission. Merge remains blocked until the gate is satisfied; the
implementation remains a Draft pull request and must not merge.

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
  or application behavior changes. No unresolved ownership conflict remains
  inside the engineering scope; contributor relicensing remains an explicit
  merge gate.

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

## Version, NEWS, And Stop Point

LIC-1 changes repository legal metadata, not application or R package runtime
behavior. It creates no application candidate and therefore does not change
the application version, R package versions, schema, or `NEWS.md`.

Stop after the source-license files, metadata, contract test, verification,
contract review, scoped commit, pushed branch, and Draft pull request. Do not
merge before the contributor relicensing gate, and do not expand LIC-1 into
SignPath or release implementation.

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
remains. Contributor permission or an authorized legal/ownership determination
is still external and unresolved, so merge, installed-app claims, SignPath
acceptance, and public release remain blocked and unrun.

On 2026-08-11, `Emberwhirl` explicitly consented in PR #30 to license the
identified contribution under `AGPL-3.0-only` in addition to existing grants.
No equivalent consent from `xuzhougeng`, and no substitute authorized
legal/ownership determination, has been recorded; the merge gate therefore
remains closed.

The Draft branch was synchronized through upstream `main`
`9e0b36b0d96c5389e7b36a30fa310751bffd0b47`, preserving the current
`0.4.0-dev.29` product metadata and source fixes while inheriting Resolver 3,
the Rust 1.88 MSRV contract, and locked candidate validation. The two textual
conflicts across the refreshes were resolved compositionally: the frontend
lockfile root retains both version `0.4.0-dev.29` and license
`AGPL-3.0-only`, while the workspace manifest retains both
`rust-version = "1.88"` and license `AGPL-3.0-only`. The exact synchronized
tree passed all 55 JavaScript contracts, license negative tests and the real
repository contract, both vendor-notice failure/recovery matrices, Rust
formatting/check and 364 workspace tests (zero failed, one opt-in Keychain
smoke ignored), both focused R package suites, and `git diff --check`. This
engineering refresh does not satisfy or weaken the remaining contributor gate.

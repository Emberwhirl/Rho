# Versioned Release Notes Publication Specification

Date: 2026-08-10

Status: active; RELEASE-NOTES-1 source implementation, automated verification,
and implementation-to-contract review complete on 2026-08-10; first
new-candidate hosted Draft/publication acceptance remains open

Change class: D4 release and publication tooling

Risk: R4 because the change controls public GitHub Release metadata and the
summary projected by the Rho update site

## 1. Problem And Evidence

The authoritative cross-platform candidate workflow currently constructs one
generic GitHub Release body inside
`.github/workflows/candidate-build-draft.yml`. The legacy Windows workflow
constructs a different body at runtime from build metadata. Neither public
body is a reviewed, version-controlled release-history document.

This makes release prose harder to review before a tag is created, obscures
historical wording changes, and permits the Draft body to diverge from the
source commit between candidate construction and publication.

GitHub's Releases API already accepts `tag_name`, `target_commitish`, `body`,
`draft`, and `prerelease`. No new release service or third-party release action
is required.

## 2. Authorized Work Package

RELEASE-NOTES-1 is the only authorized package in this stream. It may:

- define `.github/release-notes/v<version>.md` as the sole body source for every
  newly constructed Rho Release;
- add one repository-owned validator and deterministic tests;
- make candidate admission fail before expensive builds when the reviewed file
  is absent or invalid;
- bind Draft creation and later publication to the canonical bytes derived
  from the exact candidate commit;
- make the legacy Windows workflow consume the same source while it remains a
  publication entry point;
- document one exact compatibility bridge for the already accepted,
  unpublished `v0.4.0-dev.27` Draft.

It may not:

- rewrite, relabel, delete, publish, or otherwise mutate Draft Release
  `367934137` or any of its eight assets;
- invent a release-notes file in the historical `dev.27` candidate commit;
- alter candidate artifact bytes, hashes, acceptance evidence, tag ownership,
  signing, notarization, SignPath, update channels, or GitHub Pages behavior;
- generate notes from commit messages, Provider output, `NEWS.md`, or GitHub's
  automatic release-note generator;
- enable Tauri updater, `latest.json`, or updater signing keys;
- create or publish a new candidate.

The mandatory stop is a source-only, commit-ready handoff after the affected
release validation matrix and contract review. Hosted Draft or publication
actions require a later exact-candidate decision.

## 3. Authority And Ownership

The reviewed Markdown file owns only the public GitHub Release body. It does
not own:

- release identity or GO/NO-GO, which remain with the exact-candidate
  checklist and candidate evidence;
- installed behavior or application version metadata, which remain with the
  owning product contracts and `NEWS.md`;
- update channel selection, manifest schema, URL allowlists, or artifact
  projection, which remain with About/Update V1;
- installer authenticity, which remains with Apple Developer ID/notarization
  and the separately planned Windows SignPath lane.

`NEWS.md` remains the application change ledger. A release-notes file is a
curated public presentation of changes already included in its exact version;
it cannot claim unimplemented or unaccepted behavior.

## 4. File And Content Contract

For application version `X`, the only accepted path is:

```text
.github/release-notes/vX.md
```

The path is derived from the validated version and tag; workflow input cannot
select another file. `.github`, `.github/release-notes`, and the file itself
must be ordinary in-repository paths, not symbolic links.

The canonical body is UTF-8 text after CRLF/lone-CR normalization to LF. It
must:

- be between 1 byte and 64 KiB before decoding;
- decode as strict UTF-8;
- contain no forbidden control characters;
- end in exactly one newline and contain no trailing horizontal whitespace;
- start with one bounded, non-heading summary line of at most 500 Unicode
  scalar values;
- contain at least one `## ` section after the summary;
- contain no line longer than 1,000 Unicode scalar values.

The first line is intentionally plain summary text because the existing
Update Site projection uses the first non-empty Release-body line as its
bounded summary. The GitHub Release title already contains the product and
version, so the body does not need an H1 heading.

The validator returns an exact record containing:

- schema/type;
- version and release tag;
- repository-relative source path;
- canonical byte length and SHA-256;
- first-line summary;
- canonical body.

No secret, build path, credential, or environment-derived prose enters that
record.

## 5. Candidate Construction Sequence

For `build_mode=candidate`:

1. resolve the exact default-branch commit and synchronized version/tag/name;
2. validate the versioned release-notes file before starting platform builds;
3. build and validate both immutable platform candidates as before;
4. check out the exact candidate commit in the Draft assembly job;
5. re-read and validate that commit's release-notes file;
6. create the single-use Draft with the canonical body;
7. upload the existing seven candidate assets exactly once;
8. re-read the Draft and verify identity, asset set, and exact body.

Rehearsal mode does not create a Release and therefore does not require a
version-specific notes file. It still runs the validator's deterministic
self-tests so the contract cannot silently rot.

## 6. Publication Sequence And Stale Guard

Before publishing an accepted Draft:

1. resolve the unique Draft release ID, tag, and exact target commit;
2. check out that exact commit;
3. validate its derived release-notes path and canonical body;
4. require the Draft body to match exactly;
5. include the body SHA-256 in the immutable pre-publication snapshot;
6. after MAC5 admission and immediately before the single state transition,
   re-fetch the Draft and compare release ID, tag, commit, asset set, and body
   digest;
7. change only `draft`/`prerelease` state;
8. verify the published Release retained the same body and assets.

A body edit after candidate construction is stale input. Publication must fail;
the workflow must never silently overwrite the Draft from a newer branch or a
different file.

## 7. Exact `dev.27` Compatibility Boundary

Draft `367934137` targets
`aff83f01d2db8c241fe794fe5e5e4c80d2baf2a0`, which predates this contract and
cannot truthfully contain a versioned notes file. It remains eligible for its
existing publication gate only when all of these values match exactly:

- release ID `367934137`;
- tag `v0.4.0-dev.27`;
- target commit `aff83f01d2db8c241fe794fe5e5e4c80d2baf2a0`;
- body
  `Immutable cross-platform candidate built from \`aff83f01d2db8c241fe794fe5e5e4c80d2baf2a0\`. Publication requires separate MAC5 acceptance evidence and GO.`

This is an explicit one-record bridge, not a general "missing file means
legacy" rule. Every other candidate must contain and match its versioned file.
The bridge does not authorize publication and does not change `dev.27` evidence
or acceptance state.

## 8. Legacy Windows Workflow

While `.github/workflows/windows-manual-publish.yml` remains callable, it must:

- validate the file from its exact checked-out `ref` before building;
- use only the canonical file body for create/update Release calls;
- verify the returned Release retained the exact body;
- reject a missing, malformed, mismatched-version, or mismatched-tag file.

It may continue recording installer/hash details in release evidence and
assets, but must not append generated build metadata to the reviewed public
body. The Windows SignPath stream may later retire or further restrict this
legacy publication path.

## 9. Failure And Recovery Contract

- Missing file, symlink, wrong filename, invalid UTF-8, oversize content,
  malformed summary, trailing whitespace, forbidden controls, or missing
  section rejects candidate admission.
- A tag/version mismatch rejects before build or Release mutation.
- A changed Draft body rejects publication without modifying Release state or
  assets.
- A release-notes file from a foreign commit, current `main`, another tag, or a
  workflow artifact cannot substitute for the exact candidate commit.
- API/build/upload failures retain existing Draft and candidate recovery
  semantics; this package adds no deletion or overwrite path.
- Rerunning Draft assembly after any Release/tag was created continues to fail
  single-use admission.

## 10. Verification Matrix

Automated success coverage:

- prerelease and stable SemVer filenames;
- LF and CRLF checkout normalization producing identical canonical body/hash;
- Unicode summary and Markdown sections;
- candidate workflow validation before platform jobs;
- Draft create body and post-create comparison;
- publish snapshot body digest and before/after comparison;
- legacy Windows workflow file-body use.

Automated rejection/recovery coverage:

- missing/empty/oversize file;
- invalid UTF-8 and forbidden controls;
- symlinked root/directory/file;
- wrong tag/version/path;
- heading/empty/overlong summary;
- missing section, overlong line, missing final newline, extra trailing blank
  newline, and trailing spaces;
- Draft body mutation between assembly and publication;
- file absent for every identity except the exact `dev.27` bridge;
- mismatched release ID/tag/commit/body within the bridge;
- no Release asset-set expansion and no second publication state transition.

Required affected checks:

```text
node scripts/release-notes.mjs --test true
node scripts/test-release-notes-workflow.mjs
node scripts/test-mac4-release-contract.mjs
node scripts/candidate-release.mjs --test true
node scripts/generate-update-site.mjs --test true
node --check scripts/release-notes.mjs
git diff --check
```

PowerShell release-metadata validation remains required on Windows; if it
cannot run locally, it is recorded as unrun rather than passed.

## 11. Version, Documentation, And Release Impact

RELEASE-NOTES-1 changes repository release tooling and public-metadata
governance, not installed application behavior or an R package contract. It
does not by itself advance application or R package versions and does not add a
`NEWS.md` application entry.

The next unused application candidate must add its own reviewed notes file in
the same commit that synchronizes the new version. The already consumed
`dev.27` identity is not rebuilt or repurposed for this implementation.

## 12. Definition Of Done

- one canonical validator owns release-note path/content semantics;
- every newly created Draft body comes only from its exact commit's reviewed
  file;
- publication rejects body drift and preserves the single state transition;
- the legacy Windows publisher cannot synthesize an independent body;
- the exact `dev.27` compatibility bridge is narrow and regression-covered;
- release asset/evidence schemas remain unchanged;
- affected deterministic tests pass and implementation is reviewed back
  against this contract;
- no hosted Release, tag, Pages, or candidate mutation is performed in this
  work package.

## 13. Implementation And Verification Evidence

Implemented on 2026-08-10:

- `scripts/release-notes.mjs` owns strict identity, path, UTF-8, size, Markdown
  shape, canonical LF, record, SHA-256, and exact-body validation;
- `.github/release-notes/README.md` documents the first-line summary and
  per-tag authoring workflow without backfilling `dev.27`;
- candidate admission validates notes before platform builds, Draft assembly
  uses only the prepared exact-commit body, and the post-create read verifies
  tag/name/commit/body plus the unchanged seven assets;
- candidate publication loads the exact candidate file, snapshots the body
  digest, rejects drift before the sole Release state transition, and verifies
  identity/body/assets afterward;
- the legacy Windows publisher validates the exact-ref file before building
  and no longer synthesizes a second body;
- the one-record `dev.27` compatibility tuple is explicit in workflow code,
  tests, this specification, the cross-review, and the exact-candidate
  checklist.

Passing automated evidence:

- `node scripts/release-notes.mjs --test true`;
- `node scripts/test-release-notes-workflow.mjs`;
- all 53 `scripts/test-*.mjs` contracts;
- `node scripts/candidate-release.mjs --test true`;
- `node scripts/generate-update-site.mjs --test true`;
- Node syntax checks for both new scripts;
- Ruby YAML parsing for the three affected workflows;
- `git diff --check`.

The deliberate negative probe for current source version `0.4.0-dev.27`
rejects with `Release notes file is missing`, proving no historical file was
fabricated. A read-only GitHub audit confirmed Draft `367934137` remains
`draft=true`, retains its exact commit/body, and still has exactly eight
assets.

PowerShell release-metadata validation was not run locally because this Mac
does not have `pwsh`; it is not reported as passing. No application/R package
version or `NEWS.md` change is required because installed behavior and package
contracts are unchanged.

Implementation review found no deviation from RELEASE-NOTES-1. Residual risk
is limited to the first live GitHub API round trip for a newly versioned
candidate; that candidate must supply its own reviewed file and record hosted
Draft/body/publication evidence before this stream can be accepted.

## 14. DEV38-SIGN1 Consumer Cross-Review

The separately authorized
`active-2026-08-13-dev38-test-signed-prerelease-spec.md` is the first planned
new-candidate consumer. It must add
`.github/release-notes/v0.4.0-dev.38.md` in the exact synchronized source commit
and exercise this contract's canonical body and stale guards. DEV38-SIGN1 owns
the Free Trial signing facts and trust wording; RELEASE-NOTES-1 owns only how
the reviewed body is selected and preserved. Neither document may use release
prose as artifact/signature/MAC5 evidence or modify the exact `dev.27` bridge.

## 15. CPREL1 Consumer Cross-Review

The owner-authorized
`active-2026-08-13-conditional-prerelease-policy-spec.md` changes public
acceptance semantics after the `dev.38` Draft body was reviewed and locked.
RELEASE-NOTES-1 therefore prohibits rewriting that Draft. CPREL1 advances to
fresh `dev.39` and supplies `.github/release-notes/v0.4.0-dev.39.md` in the
exact candidate commit. The body must disclose the canonical two unrun human
checks, public-prerelease-only scope, evaluation-only status, and unchanged
Free Trial trust boundary. RELEASE-NOTES-1 continues to own exact body
selection, digest, stale protection, and the single publication transition;
CPREL1 alone owns schema-v2 `CONDITIONAL_GO` and its limitations.

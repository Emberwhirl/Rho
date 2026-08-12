import assert from "node:assert/strict";
import fs from "node:fs";

const normalizeLineEndings = (text) => text.replace(/\r\n?/g, "\n");
const read = (file) => normalizeLineEndings(fs.readFileSync(file, "utf8"));
const count = (text, pattern) => [...text.matchAll(pattern)].length;

const build = read(".github/workflows/candidate-build-draft.yml");
const publish = read(".github/workflows/candidate-publish.yml");
const windows = read(".github/workflows/windows-manual-publish.yml");
const updateSite = read(".github/workflows/update-site-publish.yml");
const metadata = read("scripts/test-release-metadata.ps1");
const readme = read(".github/release-notes/README.md");

assert.match(readme, /\.github\/release-notes\/v<version>\.md/);
assert.match(readme, /first line is a short plain-text summary/i);
assert.match(readme, /Do not invent or backfill a historical file/);
assert.equal(
  fs.existsSync(".github/release-notes/v0.4.0-dev.27.md"),
  false,
  "The historical dev.27 candidate commit must not be backfilled with a fictional notes file",
);

const identity = build.match(/- name: Validate candidate identity and contract tools[\s\S]*?(?=\n  windows-candidate:)/)?.[0];
assert.ok(identity, "Missing candidate identity job");
assert.match(identity, /node scripts\/release-notes\.mjs --test true/);
assert.match(identity, /if \[\[ "\$BUILD_MODE" == "candidate" \]\]/);
assert.match(identity, /release-notes\.mjs --mode validate --version "\$version" --tag "\$INPUT_RELEASE_TAG"/);

const draft = build.match(/\n  draft-candidate:[\s\S]*$/)?.[0];
assert.ok(draft, "Missing candidate Draft job");
const prepareIndex = draft.indexOf("Prepare reviewed release notes from the exact candidate commit");
const createIndex = draft.indexOf("Create single-use draft and upload assets once");
assert.ok(prepareIndex >= 0 && prepareIndex < createIndex, "Release notes must be prepared before Draft creation");
assert.match(draft, /release-notes\.mjs --mode prepare/);
assert.match(draft, /validateReleaseNotesRecord/);
assert.match(draft, /body: releaseNotes\.body/);
assert.match(draft, /checked\.data\.tag_name !== process\.env\.CANDIDATE_TAG/);
assert.match(draft, /checked\.data\.name !== process\.env\.CANDIDATE_NAME/);
assert.match(draft, /checked\.data\.body !== releaseNotes\.body/);
assert.doesNotMatch(draft, /body: `Immutable cross-platform candidate/);
assert.equal(count(draft, /uploadReleaseAsset/g), 1, "Release notes must not expand the candidate asset upload loop");

const publishDownload = publish.match(/- name: Download draft assets and assemble publish record[\s\S]*?- name: Enforce immutable candidate and explicit MAC5 GO/)?.[0];
assert.ok(publishDownload, "Missing candidate publish admission step");
assert.match(publishDownload, /\.github", "release-notes", `\$\{process\.env\.RELEASE_TAG\}\.md`/);
assert.match(publishDownload, /loadReleaseNotes/);
assert.match(publishDownload, /requireExactReleaseBody/);
assert.match(publishDownload, /release_id: 367934137/);
assert.match(publishDownload, /tag_name: "v0\.4\.0-dev\.27"/);
assert.match(publishDownload, /target_commitish: "aff83f01d2db8c241fe794fe5e5e4c80d2baf2a0"/);
assert.match(publishDownload, /release\.data\.id !== legacy\.release_id/);
assert.match(publishDownload, /release\.data\.tag_name !== legacy\.tag_name/);
assert.match(publishDownload, /release\.data\.target_commitish !== legacy\.target_commitish/);
assert.match(publishDownload, /release\.data\.body !== legacy\.body/);
assert.match(publishDownload, /does not contain its reviewed versioned release notes file/);
assert.match(publishDownload, /body_sha256: releaseBodySha256/);

const publishTransition = publish.match(/- name: Publish without rebuilding or changing assets[\s\S]*$/)?.[0];
assert.ok(publishTransition, "Missing candidate publication transition");
assert.match(publishTransition, /snapshot\.body_sha256 !== beforeBodySha256/);
assert.match(publishTransition, /afterBodySha256 !== snapshot\.body_sha256/);
assert.match(publishTransition, /after\.data\.tag_name !== snapshot\.tag_name/);
assert.match(publishTransition, /after\.data\.target_commitish !== snapshot\.target_commitish/);
assert.match(publishTransition, /reviewed body/);
assert.equal(count(publishTransition, /updateRelease/g), 1, "Publication must retain one state transition");
assert.doesNotMatch(publishTransition, /body:/, "Publication must not rewrite the reviewed body");

const windowsPrepareIndex = windows.indexOf("Validate reviewed versioned release notes");
const windowsBuildIndex = windows.indexOf("Verify source, build installer and run release smoke tests");
assert.ok(windowsPrepareIndex >= 0 && windowsPrepareIndex < windowsBuildIndex, "Windows notes validation must precede its build");
assert.match(windows, /release-notes\.mjs --mode prepare/);
assert.match(windows, /body: releaseNotes\.body/g);
assert.match(windows, /release\.data\.body !== releaseNotes\.body/);
assert.doesNotMatch(windows, /GitHub-hosted windows-latest release build/);
assert.doesNotMatch(windows, /const body = \[/);

assert.match(
  updateSite,
  /summary: String\(release\.body \|\| ""\)\.split\("\\n"\)\.find\(\(line\) => line\.trim\(\)\)/,
  "Update Site must continue projecting the reviewed first non-empty body line as its summary",
);

assert.match(metadata, /\.github\\release-notes\\README\.md/);
assert.match(metadata, /scripts\\release-notes\.mjs/);
assert.match(metadata, /\.github\\release-notes\\\$ReleaseTag\.md/);

process.stdout.write("Versioned release notes workflow tests passed.\n");

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { TextDecoder } from "node:util";
import { pathToFileURL } from "node:url";

export const MAX_RELEASE_NOTES_BYTES = 64 * 1024;
export const RELEASE_NOTES_DIRECTORY = ".github/release-notes";

const PRERELEASE_IDENTIFIER = "(?:0|[1-9]\\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)";
const VERSION_PATTERN = new RegExp(`^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-(${PRERELEASE_IDENTIFIER}(?:\\.${PRERELEASE_IDENTIFIER})*))?$`);
const FORBIDDEN_CONTROL_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const STRUCTURAL_SUMMARY_PATTERN = /^(?:#{1,6}\s|[-+*]\s|>\s|```|~~~|\d+[.)]\s)/u;
const RECORD_KEYS = [
  "schema_version",
  "type",
  "version",
  "release_tag",
  "source_path",
  "size_bytes",
  "sha256",
  "summary",
  "body",
];

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    if (!key?.startsWith("--") || argv[index + 1] == null) {
      fail(`Invalid argument at ${key || "end of input"}`);
    }
    result[key.slice(2)] = argv[index + 1];
  }
  return result;
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(`${label} keys are invalid: expected ${wanted.join(", ")}; received ${actual.join(", ")}`);
  }
}

export function validateReleaseNotesIdentity(version, releaseTag) {
  if (!VERSION_PATTERN.test(String(version || ""))) fail(`Release version is not SemVer: ${version || "<empty>"}`);
  if (releaseTag !== `v${version}`) fail(`Release tag ${releaseTag || "<empty>"} does not match version ${version}`);
  return { version, release_tag: releaseTag };
}

export function expectedReleaseNotesPath(version, releaseTag) {
  validateReleaseNotesIdentity(version, releaseTag);
  return `${RELEASE_NOTES_DIRECTORY}/${releaseTag}.md`;
}

function ordinaryReleaseNotesFile(repositoryRoot, relativePath) {
  const root = path.resolve(repositoryRoot);
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) fail("Release notes path escaped the repository root");
  const components = [".github", "release-notes", path.basename(relativePath)];
  let current = root;
  for (let index = 0; index < components.length; index += 1) {
    current = path.join(current, components[index]);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error?.code === "ENOENT") fail(`Release notes file is missing: ${relativePath}`);
      throw error;
    }
    if (stat.isSymbolicLink()) fail(`Release notes path must not contain a symbolic link: ${components.slice(0, index + 1).join("/")}`);
    const final = index === components.length - 1;
    if ((!final && !stat.isDirectory()) || (final && !stat.isFile())) {
      fail(`Release notes path component has the wrong type: ${components.slice(0, index + 1).join("/")}`);
    }
  }
  return resolved;
}

function decodeCanonicalBody(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length <= 0) fail("Release notes file is empty");
  if (bytes.length > MAX_RELEASE_NOTES_BYTES) fail("Release notes file exceeds the 64 KiB byte budget");
  let decoded;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail("Release notes file is not valid UTF-8");
  }
  return decoded.replace(/\r\n?/g, "\n");
}

export function validateReleaseNotesBody(body) {
  if (typeof body !== "string" || !body.length) fail("Release notes body is empty");
  if (FORBIDDEN_CONTROL_PATTERN.test(body)) fail("Release notes body contains a forbidden control character");
  if (!body.endsWith("\n")) fail("Release notes body must end with one newline");
  if (body.endsWith("\n\n")) fail("Release notes body must end with exactly one newline");
  const lines = body.split("\n");
  for (const line of lines.slice(0, -1)) {
    if (/[ \t]+$/u.test(line)) fail("Release notes lines must not contain trailing horizontal whitespace");
    if ([...line].length > 1000) fail("Release notes line exceeds 1,000 Unicode scalar values");
  }
  const summary = lines[0];
  if (!summary || summary !== summary.trim()) fail("Release notes must start with a trimmed summary line");
  if ([...summary].length > 500) fail("Release notes summary exceeds 500 Unicode scalar values");
  if (STRUCTURAL_SUMMARY_PATTERN.test(summary)) fail("Release notes summary must be plain text, not a Markdown block");
  if (lines[1] !== "") fail("Release notes summary must be followed by one blank line");
  const sectionIndex = lines.findIndex((line, index) => index >= 2 && /^## [^#\s].*/u.test(line));
  if (sectionIndex < 0) fail("Release notes must contain at least one level-two section");
  if (!lines.slice(sectionIndex + 1, -1).some((line) => line.trim() && !/^## /u.test(line))) {
    fail("Release notes must contain content beneath a level-two section");
  }
  return { body, summary };
}

function recordForCanonicalBody(version, releaseTag, sourcePath, body) {
  const identity = validateReleaseNotesIdentity(version, releaseTag);
  const validated = validateReleaseNotesBody(body);
  const canonicalBytes = Buffer.from(validated.body, "utf8");
  if (canonicalBytes.length > MAX_RELEASE_NOTES_BYTES) fail("Canonical release notes exceed the 64 KiB byte budget");
  return {
    schema_version: 1,
    type: "rho_release_notes",
    version: identity.version,
    release_tag: identity.release_tag,
    source_path: sourcePath,
    size_bytes: canonicalBytes.length,
    sha256: crypto.createHash("sha256").update(canonicalBytes).digest("hex"),
    summary: validated.summary,
    body: validated.body,
  };
}

export function loadReleaseNotes({ repositoryRoot = process.cwd(), version, releaseTag }) {
  const relativePath = expectedReleaseNotesPath(version, releaseTag);
  const filePath = ordinaryReleaseNotesFile(repositoryRoot, relativePath);
  const body = decodeCanonicalBody(fs.readFileSync(filePath));
  return recordForCanonicalBody(version, releaseTag, relativePath, body);
}

export function validateReleaseNotesRecord(record, expected = {}) {
  assertExactKeys(record, RECORD_KEYS, "release notes record");
  const wantedPath = expectedReleaseNotesPath(record.version, record.release_tag);
  if (record.schema_version !== 1 || record.type !== "rho_release_notes" || record.source_path !== wantedPath) {
    fail("Release notes record header is invalid");
  }
  if (expected.version != null && record.version !== expected.version) fail("Release notes record version mismatch");
  if (expected.release_tag != null && record.release_tag !== expected.release_tag) fail("Release notes record tag mismatch");
  const canonical = recordForCanonicalBody(record.version, record.release_tag, record.source_path, record.body);
  if (
    record.size_bytes !== canonical.size_bytes
    || record.sha256 !== canonical.sha256
    || record.summary !== canonical.summary
  ) fail("Release notes record content binding is invalid");
  return record;
}

export function requireExactReleaseBody(record, actualBody) {
  validateReleaseNotesRecord(record);
  if (actualBody !== record.body) fail("Draft release body does not match the reviewed release notes file");
  return record.sha256;
}

function writeRecord(outputPath, record) {
  const resolved = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
}

function expectFailure(callback, pattern) {
  assert.throws(callback, pattern);
}

export function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rho-release-notes-"));
  const notesDirectory = path.join(root, RELEASE_NOTES_DIRECTORY);
  const version = "1.2.3-dev.4";
  const releaseTag = `v${version}`;
  const notesPath = path.join(notesDirectory, `${releaseTag}.md`);
  const goodBody = "Rho improves reviewed release publication.\n\n## Fixed\n\n- Draft bodies now match their exact source file.\n";
  const write = (value) => fs.writeFileSync(notesPath, value);
  try {
    fs.mkdirSync(notesDirectory, { recursive: true });
    write(goodBody.replace(/\n/g, "\r\n"));
    const crlf = loadReleaseNotes({ repositoryRoot: root, version, releaseTag });
    assert.equal(crlf.body, goodBody);
    assert.equal(crlf.summary, "Rho improves reviewed release publication.");
    assert.equal(requireExactReleaseBody(crlf, goodBody), crlf.sha256);
    write(goodBody);
    const lf = loadReleaseNotes({ repositoryRoot: root, version, releaseTag });
    assert.equal(lf.sha256, crlf.sha256, "LF and CRLF checkouts must produce the same canonical body");
    assert.equal(lf.source_path, `.github/release-notes/${releaseTag}.md`);
    validateReleaseNotesRecord(JSON.parse(JSON.stringify(lf)), { version, release_tag: releaseTag });
    const preparedPath = path.join(root, "target", "release-notes.json");
    writeRecord(preparedPath, lf);
    validateReleaseNotesRecord(JSON.parse(fs.readFileSync(preparedPath, "utf8")), { version, release_tag: releaseTag });
    expectFailure(() => writeRecord(preparedPath, lf), /EEXIST/);

    const stableVersion = "1.2.3";
    const stableTag = `v${stableVersion}`;
    fs.writeFileSync(path.join(notesDirectory, `${stableTag}.md`), "Rho is ready for stable release.\n\n## Changes\n\n- Stable notes use the same contract.\n");
    assert.equal(loadReleaseNotes({ repositoryRoot: root, version: stableVersion, releaseTag: stableTag }).release_tag, stableTag);

    expectFailure(() => validateReleaseNotesIdentity(version, "v1.2.3-dev.5"), /does not match/);
    expectFailure(() => validateReleaseNotesIdentity("01.2.3", "v01.2.3"), /not SemVer/);
    expectFailure(() => requireExactReleaseBody(lf, `${goodBody}changed`), /does not match/);
    expectFailure(() => validateReleaseNotesRecord({ ...lf, sha256: "0".repeat(64) }), /content binding/);
    expectFailure(() => validateReleaseNotesRecord({ ...lf, extra: true }), /keys are invalid/);

    fs.rmSync(notesPath);
    expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /missing/);
    write("");
    expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /empty/);
    write(Buffer.from([0xc3, 0x28]));
    expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /valid UTF-8/);
    write(`${"x".repeat(MAX_RELEASE_NOTES_BYTES)}\n`);
    expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /64 KiB/);

    for (const [body, pattern] of [
      ["# Rho release\n\n## Fixed\n\n- Item.\n", /plain text/],
      [`${"s".repeat(501)}\n\n## Fixed\n\n- Item.\n`, /500/],
      ["Summary without blank line.\n## Fixed\n\n- Item.\n", /blank line/],
      ["Summary only.\n", /level-two section/],
      ["Summary.\n\n## Empty\n", /content beneath/],
      ["Summary.\n\n## Fixed\n\n- Item.\n\n", /exactly one newline/],
      ["Summary.\n\n## Fixed\n\n- Item." + " \n", /trailing horizontal whitespace/],
      ["Summary.\n\n## Fixed\n\n- Item.\u0000\n", /control/],
      ["Summary.\n\n## Fixed\n\n- Item.", /end with one newline/],
      [`Summary.\n\n## Fixed\n\n${"x".repeat(1001)}\n`, /1,000/],
    ]) {
      write(body);
      expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), pattern);
    }

    write(goodBody);
    const githubSymlinkRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rho-release-notes-github-link-"));
    try {
      const realGithub = path.join(githubSymlinkRoot, "github-real");
      const linkedNotes = path.join(realGithub, "release-notes");
      fs.mkdirSync(linkedNotes, { recursive: true });
      fs.writeFileSync(path.join(linkedNotes, `${releaseTag}.md`), goodBody);
      fs.symlinkSync(realGithub, path.join(githubSymlinkRoot, ".github"), process.platform === "win32" ? "junction" : "dir");
      expectFailure(() => loadReleaseNotes({ repositoryRoot: githubSymlinkRoot, version, releaseTag }), /symbolic link/);
    } finally {
      fs.rmSync(githubSymlinkRoot, { recursive: true, force: true });
    }
    const realNotesDirectory = path.join(root, ".github", "release-notes-real");
    fs.renameSync(notesDirectory, realNotesDirectory);
    fs.symlinkSync(realNotesDirectory, notesDirectory, process.platform === "win32" ? "junction" : "dir");
    expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /symbolic link/);
    fs.rmSync(notesDirectory, { force: true });
    fs.renameSync(realNotesDirectory, notesDirectory);
    if (process.platform !== "win32") {
      const realFile = `${notesPath}.real`;
      fs.renameSync(notesPath, realFile);
      fs.symlinkSync(realFile, notesPath);
      expectFailure(() => loadReleaseNotes({ repositoryRoot: root, version, releaseTag }), /symbolic link/);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  process.stdout.write("Versioned release notes contract tests passed.\n");
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));
  if (args.test === "true") return selfTest();
  if (args.mode === "validate") {
    const record = loadReleaseNotes({ version: args.version, releaseTag: args.tag });
    const { body: _body, ...metadata } = record;
    process.stdout.write(`${JSON.stringify(metadata)}\n`);
    return;
  }
  if (args.mode === "prepare") {
    if (!args.output) fail("Release notes prepare mode requires --output");
    writeRecord(args.output, loadReleaseNotes({ version: args.version, releaseTag: args.tag }));
    return;
  }
  fail("Use --test true or --mode validate|prepare with --version and --tag");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli();

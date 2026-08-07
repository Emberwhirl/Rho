import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

export const CANDIDATE_PLATFORMS = ["windows_x86_64", "macos_aarch64"];
export const MAX_EVIDENCE_BYTES = 256 * 1024;
export const REHEARSAL_REPOSITORY = "YuLab-SMU/Rho_for_mac";
export const CANDIDATE_REPOSITORY = "YuLab-SMU/Rho";

const MAX_CHECKSUM_BYTES = 1024;
const PRERELEASE_IDENTIFIER = "(?:0|[1-9]\\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)";
const CANDIDATE_VERSION_PATTERN = new RegExp(`^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)-(${PRERELEASE_IDENTIFIER})(?:\\.${PRERELEASE_IDENTIFIER})*$`);

const REQUIRED_CHECKS = {
  windows_x86_64: [
    "release_metadata",
    "rust_workspace",
    "rho_bridge",
    "rho_agent",
    "frontend",
    "workspace_smoke",
  ],
  macos_aarch64: [
    "release_metadata",
    "rust_workspace",
    "rho_bridge",
    "rho_agent",
    "frontend",
    "workspace_smoke",
    "arm64",
    "codesign",
    "entitlements",
    "notarization",
    "notary_binding",
    "staple",
    "gatekeeper",
  ],
};

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    if (!key?.startsWith("--") || argv[index + 1] == null) fail(`Invalid argument at ${key || "end of input"}`);
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

export function validateCandidateIdentity(version, releaseTag, commit) {
  if (!CANDIDATE_VERSION_PATTERN.test(version)) {
    fail(`Candidate version is not prerelease SemVer: ${version}`);
  }
  if (releaseTag !== `v${version}`) fail(`Release tag ${releaseTag} does not match version ${version}`);
  if (!/^[0-9a-f]{40}$/.test(commit)) fail("Candidate commit must be a full lowercase Git SHA");
  return { version, release_tag: releaseTag, commit };
}

export function validateBuildAdmission(buildMode, repository, workflowRef, defaultBranch) {
  if (defaultBranch !== "main" || workflowRef !== `refs/heads/${defaultBranch}`) {
    fail(`Candidate workflow must run from the default main branch, received ${workflowRef || "<empty>"}`);
  }
  if (buildMode === "rehearsal" && repository === REHEARSAL_REPOSITORY) {
    return { build_mode: buildMode, repository, workflow_ref: workflowRef, default_branch: defaultBranch };
  }
  if (buildMode === "candidate" && repository === CANDIDATE_REPOSITORY) {
    return { build_mode: buildMode, repository, workflow_ref: workflowRef, default_branch: defaultBranch };
  }
  fail(`Build mode ${buildMode || "<empty>"} is not authorized for repository ${repository || "<empty>"}`);
}

export function expectedPlatformNames(version, platform) {
  if (!CANDIDATE_PLATFORMS.includes(platform)) fail(`Unsupported candidate platform: ${platform}`);
  const artifactName = platform === "windows_x86_64"
    ? `Rho_${version}_x64-setup.exe`
    : `Rho_${version}_aarch64.dmg`;
  const evidenceName = platform === "windows_x86_64"
    ? `rho-${version}-windows-x86_64-evidence.json`
    : `rho-${version}-macos-aarch64-evidence.json`;
  return { artifactName, hashName: `${artifactName}.sha256`, evidenceName };
}

export function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
}

function fileRecord(filePath) {
  const stat = fs.lstatSync(filePath);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size <= 0) {
    fail(`Candidate file is missing, empty, or a symlink: ${path.basename(filePath)}`);
  }
  return { name: path.basename(filePath), size_bytes: stat.size, sha256: sha256File(filePath) };
}

function validateChecks(platform, checks) {
  if (!Array.isArray(checks) || !checks.length || checks.length > 32) fail(`${platform} checks are missing or unbounded`);
  const names = new Set();
  for (const check of checks) {
    assertExactKeys(check, ["name", "status"], `${platform} check`);
    if (!/^[a-z0-9_]+$/.test(check.name) || check.status !== "passed" || names.has(check.name)) {
      fail(`${platform} check is invalid or duplicated: ${check.name}`);
    }
    names.add(check.name);
  }
  for (const required of REQUIRED_CHECKS[platform]) {
    if (!names.has(required)) fail(`${platform} evidence is missing required check ${required}`);
  }
}

export function validatePlatformEvidence(value, expected = {}) {
  assertExactKeys(
    value,
    ["schema_version", "type", "status", "version", "release_tag", "commit", "platform", "artifact", "checks"],
    "platform evidence",
  );
  if (value.schema_version !== 1 || value.type !== "rho_platform_candidate_evidence" || value.status !== "passed") {
    fail("Platform evidence header is invalid");
  }
  validateCandidateIdentity(value.version, value.release_tag, value.commit);
  if (expected.version && value.version !== expected.version) fail("Platform evidence version mismatch");
  if (expected.release_tag && value.release_tag !== expected.release_tag) fail("Platform evidence tag mismatch");
  if (expected.commit && value.commit !== expected.commit) fail("Platform evidence commit mismatch");
  if (expected.platform && value.platform !== expected.platform) fail("Platform evidence platform mismatch");
  const names = expectedPlatformNames(value.version, value.platform);
  assertExactKeys(value.artifact, ["name", "hash_name", "size_bytes", "sha256"], `${value.platform} artifact`);
  if (value.artifact.name !== names.artifactName || value.artifact.hash_name !== names.hashName) {
    fail(`${value.platform} artifact filename is invalid`);
  }
  if (!Number.isSafeInteger(value.artifact.size_bytes) || value.artifact.size_bytes <= 0) {
    fail(`${value.platform} artifact size is invalid`);
  }
  if (!/^[0-9a-f]{64}$/.test(value.artifact.sha256)) fail(`${value.platform} artifact SHA-256 is invalid`);
  validateChecks(value.platform, value.checks);
  return value;
}

export function createPlatformEvidence({ version, releaseTag, commit, platform, artifactPath, outputPath, checks }) {
  validateCandidateIdentity(version, releaseTag, commit);
  const names = expectedPlatformNames(version, platform);
  if (path.basename(artifactPath) !== names.artifactName) fail(`Expected artifact ${names.artifactName}`);
  if (path.basename(outputPath) !== names.evidenceName) fail(`Expected evidence ${names.evidenceName}`);
  if (path.resolve(path.dirname(outputPath)) !== path.resolve(path.dirname(artifactPath))) {
    fail("Platform evidence output is outside the artifact directory");
  }
  const artifact = fileRecord(artifactPath);
  const hashPath = path.join(path.dirname(artifactPath), names.hashName);
  fs.writeFileSync(hashPath, `${artifact.sha256} *${artifact.name}\n`, { flag: "wx" });
  const evidence = {
    schema_version: 1,
    type: "rho_platform_candidate_evidence",
    status: "passed",
    version,
    release_tag: releaseTag,
    commit,
    platform,
    artifact: {
      name: artifact.name,
      hash_name: names.hashName,
      size_bytes: artifact.size_bytes,
      sha256: artifact.sha256,
    },
    checks: checks.map((name) => ({ name, status: "passed" })),
  };
  validatePlatformEvidence(evidence);
  writeJson(outputPath, evidence);
  return evidence;
}

function verifyPlatformFiles(evidence, directory, evidencePath) {
  const artifactPath = path.join(directory, evidence.artifact.name);
  const hashPath = path.join(directory, evidence.artifact.hash_name);
  const artifact = fileRecord(artifactPath);
  if (artifact.size_bytes !== evidence.artifact.size_bytes || artifact.sha256 !== evidence.artifact.sha256) {
    fail(`${evidence.platform} artifact does not match evidence`);
  }
  const expectedSidecar = `${artifact.sha256} *${artifact.name}\n`;
  if (fs.readFileSync(hashPath, "utf8") !== expectedSidecar) fail(`${evidence.platform} checksum sidecar mismatch`);
  return {
    artifact,
    checksum: fileRecord(hashPath),
    evidence: fileRecord(evidencePath),
  };
}

export function validateAggregateEvidence(value) {
  assertExactKeys(
    value,
    ["schema_version", "type", "status", "version", "release_tag", "commit", "platforms"],
    "candidate evidence",
  );
  if (value.schema_version !== 1 || value.type !== "rho_candidate_evidence" || value.status !== "passed") {
    fail("Candidate evidence header is invalid");
  }
  validateCandidateIdentity(value.version, value.release_tag, value.commit);
  assertExactKeys(value.platforms, CANDIDATE_PLATFORMS, "candidate platforms");
  for (const platform of CANDIDATE_PLATFORMS) {
    assertExactKeys(value.platforms[platform], ["artifact", "checksum", "evidence"], `${platform} aggregate record`);
    const names = expectedPlatformNames(value.version, platform);
    for (const [kind, record] of Object.entries(value.platforms[platform])) {
      assertExactKeys(record, ["name", "size_bytes", "sha256"], `${platform} ${kind}`);
      if (!Number.isSafeInteger(record.size_bytes) || record.size_bytes <= 0 || !/^[0-9a-f]{64}$/.test(record.sha256)) {
        fail(`${platform} ${kind} record is invalid`);
      }
    }
    if (
      value.platforms[platform].checksum.size_bytes > MAX_CHECKSUM_BYTES
      || value.platforms[platform].evidence.size_bytes > MAX_EVIDENCE_BYTES
    ) fail(`${platform} evidence sidecars exceed their byte budget`);
    if (
      value.platforms[platform].artifact.name !== names.artifactName
      || value.platforms[platform].checksum.name !== names.hashName
      || value.platforms[platform].evidence.name !== names.evidenceName
    ) fail(`${platform} aggregate filenames are invalid`);
  }
  const names = Object.values(value.platforms).flatMap((entry) => Object.values(entry).map((record) => record.name));
  if (new Set(names).size !== names.length) fail("Candidate aggregate contains duplicate asset names");
  return value;
}

export function createAggregateEvidence({ version, releaseTag, commit, directory, windowsEvidencePath, macosEvidencePath, outputPath }) {
  validateCandidateIdentity(version, releaseTag, commit);
  const resolvedDirectory = fs.realpathSync(directory);
  const inputs = {
    windows_x86_64: windowsEvidencePath,
    macos_aarch64: macosEvidencePath,
  };
  const platforms = {};
  for (const platform of CANDIDATE_PLATFORMS) {
    const resolvedEvidencePath = fs.realpathSync(inputs[platform]);
    if (path.dirname(resolvedEvidencePath) !== resolvedDirectory) {
      fail(`${platform} evidence is outside the candidate directory`);
    }
    const evidence = validatePlatformEvidence(JSON.parse(fs.readFileSync(inputs[platform], "utf8")), {
      version,
      release_tag: releaseTag,
      commit,
      platform,
    });
    platforms[platform] = verifyPlatformFiles(evidence, directory, inputs[platform]);
  }
  const aggregate = {
    schema_version: 1,
    type: "rho_candidate_evidence",
    status: "passed",
    version,
    release_tag: releaseTag,
    commit,
    platforms,
  };
  validateAggregateEvidence(aggregate);
  const expectedName = `rho-${version}-candidate-evidence.json`;
  if (path.basename(outputPath) !== expectedName) fail(`Expected aggregate evidence ${expectedName}`);
  if (path.resolve(path.dirname(outputPath)) !== path.resolve(directory)) fail("Aggregate evidence output is outside the candidate directory");
  writeJson(outputPath, aggregate);
  return aggregate;
}

export function validateRehearsalEvidence(value, expected = {}) {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > MAX_EVIDENCE_BYTES) {
    fail("Rehearsal evidence exceeds its byte budget");
  }
  assertExactKeys(
    value,
    [
      "schema_version",
      "type",
      "status",
      "source_repository",
      "version",
      "release_tag",
      "commit",
      "run_id",
      "run_attempt",
      "platforms",
    ],
    "rehearsal evidence",
  );
  if (
    value.schema_version !== 1
    || value.type !== "rho_candidate_rehearsal_evidence"
    || value.status !== "passed"
  ) fail("Rehearsal evidence header is invalid");
  if (value.source_repository !== REHEARSAL_REPOSITORY) fail("Rehearsal source repository is not authorized");
  if (!/^[1-9]\d{0,19}$/.test(value.run_id)) fail("Rehearsal run ID is invalid");
  if (!Number.isSafeInteger(value.run_attempt) || value.run_attempt <= 0 || value.run_attempt > 1000) {
    fail("Rehearsal run attempt is invalid");
  }
  const candidate = validateAggregateEvidence({
    schema_version: value.schema_version,
    type: "rho_candidate_evidence",
    status: value.status,
    version: value.version,
    release_tag: value.release_tag,
    commit: value.commit,
    platforms: value.platforms,
  });
  if (expected.source_repository && value.source_repository !== expected.source_repository) {
    fail("Rehearsal source repository mismatch");
  }
  if (expected.version && value.version !== expected.version) fail("Rehearsal version mismatch");
  if (expected.release_tag && value.release_tag !== expected.release_tag) fail("Rehearsal tag mismatch");
  if (expected.commit && value.commit !== expected.commit) fail("Rehearsal commit mismatch");
  if (expected.run_id && value.run_id !== String(expected.run_id)) fail("Rehearsal run ID mismatch");
  if (expected.run_attempt && value.run_attempt !== Number(expected.run_attempt)) fail("Rehearsal run attempt mismatch");
  return { ...value, platforms: candidate.platforms };
}

export function createRehearsalEvidence({ candidateEvidencePath, sourceRepository, runId, runAttempt, outputPath }) {
  const candidateRecord = fileRecord(candidateEvidencePath);
  if (candidateRecord.size_bytes > MAX_EVIDENCE_BYTES) fail("Candidate evidence exceeds its byte budget");
  const candidate = validateAggregateEvidence(JSON.parse(fs.readFileSync(candidateEvidencePath, "utf8")));
  const expectedName = `rho-${candidate.version}-rehearsal-evidence.json`;
  if (path.basename(outputPath) !== expectedName) fail(`Expected rehearsal evidence ${expectedName}`);
  if (path.resolve(path.dirname(outputPath)) !== path.resolve(path.dirname(candidateEvidencePath))) {
    fail("Rehearsal evidence output is outside the candidate directory");
  }
  const rehearsal = {
    schema_version: 1,
    type: "rho_candidate_rehearsal_evidence",
    status: "passed",
    source_repository: sourceRepository,
    version: candidate.version,
    release_tag: candidate.release_tag,
    commit: candidate.commit,
    run_id: String(runId),
    run_attempt: Number(runAttempt),
    platforms: candidate.platforms,
  };
  validateRehearsalEvidence(rehearsal, {
    source_repository: REHEARSAL_REPOSITORY,
    version: candidate.version,
    release_tag: candidate.release_tag,
    commit: candidate.commit,
    run_id: runId,
    run_attempt: runAttempt,
  });
  writeJson(outputPath, rehearsal);
  return rehearsal;
}

function requiredCandidateAssetRecords(candidateEvidence) {
  return Object.values(candidateEvidence.platforms).flatMap((entry) => [entry.artifact, entry.checksum, entry.evidence]);
}

export function validatePublishRecord(record) {
  assertExactKeys(
    record,
    ["tag_name", "draft", "prerelease", "target_commitish", "assets", "platform_evidence", "candidate_evidence", "candidate_evidence_asset", "acceptance_evidence"],
    "publish record",
  );
  const candidate = validateAggregateEvidence(record.candidate_evidence);
  if (!record.draft || !record.prerelease) fail("Only a draft prerelease may be published");
  if (record.tag_name !== candidate.release_tag || record.target_commitish !== candidate.commit) {
    fail("Draft release identity does not match candidate evidence");
  }
  assertExactKeys(record.platform_evidence, CANDIDATE_PLATFORMS, "publish platform evidence");
  for (const platform of CANDIDATE_PLATFORMS) {
    validatePlatformEvidence(record.platform_evidence[platform], {
      version: candidate.version,
      release_tag: candidate.release_tag,
      commit: candidate.commit,
      platform,
    });
  }
  assertExactKeys(record.candidate_evidence_asset, ["name", "size_bytes", "sha256"], "candidate evidence asset");
  if (
    record.candidate_evidence_asset.name !== `rho-${candidate.version}-candidate-evidence.json`
    || !/^[0-9a-f]{64}$/.test(record.candidate_evidence_asset.sha256)
    || !Number.isSafeInteger(record.candidate_evidence_asset.size_bytes)
    || record.candidate_evidence_asset.size_bytes <= 0
    || record.candidate_evidence_asset.size_bytes > MAX_EVIDENCE_BYTES
  ) fail("Candidate evidence asset record is invalid");
  const acceptance = record.acceptance_evidence;
  assertExactKeys(
    acceptance,
    ["schema_version", "type", "status", "decision", "version", "release_tag", "commit", "candidate_evidence_sha256", "platforms"],
    "acceptance evidence",
  );
  if (
    acceptance.schema_version !== 1
    || acceptance.type !== "rho_candidate_acceptance"
    || acceptance.status !== "passed"
    || acceptance.decision !== "GO"
  ) fail("MAC5 acceptance does not contain an explicit passed GO");
  if (
    acceptance.version !== candidate.version
    || acceptance.release_tag !== candidate.release_tag
    || acceptance.commit !== candidate.commit
    || acceptance.candidate_evidence_sha256 !== record.candidate_evidence_asset.sha256
    || !isDeepStrictEqual(acceptance.platforms, candidate.platforms)
  ) fail("MAC5 acceptance is stale or does not match the candidate");
  if (!Array.isArray(record.assets)) fail("Draft release assets are missing");
  const expectedNames = new Set([
    ...requiredCandidateAssetRecords(candidate).map((entry) => entry.name),
    record.candidate_evidence_asset.name,
    `rho-${candidate.version}-acceptance.json`,
  ]);
  const actualNames = record.assets.map((entry) => entry.name);
  if (actualNames.length !== expectedNames.size || new Set(actualNames).size !== actualNames.length) {
    fail("Draft release asset set is incomplete or duplicated");
  }
  for (const asset of record.assets) {
    assertExactKeys(asset, ["name", "size", "sha256"], "draft release asset");
    if (
      !expectedNames.has(asset.name)
      || !Number.isSafeInteger(asset.size)
      || asset.size <= 0
      || !/^[0-9a-f]{64}$/.test(asset.sha256)
    ) {
      fail(`Unexpected or invalid draft release asset: ${asset.name}`);
    }
  }
  for (const expected of requiredCandidateAssetRecords(candidate)) {
    const asset = record.assets.find((entry) => entry.name === expected.name);
    if (!asset || asset.size !== expected.size_bytes || asset.sha256 !== expected.sha256) {
      fail(`Draft asset content mismatch for ${expected.name}`);
    }
  }
  const candidateAsset = record.assets.find((entry) => entry.name === record.candidate_evidence_asset.name);
  if (
    !candidateAsset
    || candidateAsset.size !== record.candidate_evidence_asset.size_bytes
    || candidateAsset.sha256 !== record.candidate_evidence_asset.sha256
  ) {
    fail("Aggregate candidate evidence content mismatch");
  }
  return { version: candidate.version, release_tag: candidate.release_tag, commit: candidate.commit };
}

function expectFailure(action, pattern) {
  let error = null;
  try { action(); } catch (caught) { error = caught; }
  if (!error || !pattern.test(String(error.message))) fail(`Expected failure matching ${pattern}`);
}

export function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rho-candidate-contract-"));
  try {
    const version = "0.4.0-dev.1";
    const releaseTag = `v${version}`;
    const commit = "a".repeat(40);
    validateBuildAdmission("rehearsal", REHEARSAL_REPOSITORY, "refs/heads/main", "main");
    validateBuildAdmission("candidate", CANDIDATE_REPOSITORY, "refs/heads/main", "main");
    expectFailure(
      () => validateBuildAdmission("candidate", REHEARSAL_REPOSITORY, "refs/heads/main", "main"),
      /not authorized/,
    );
    expectFailure(
      () => validateBuildAdmission("rehearsal", CANDIDATE_REPOSITORY, "refs/heads/main", "main"),
      /not authorized/,
    );
    expectFailure(
      () => validateBuildAdmission("unknown", REHEARSAL_REPOSITORY, "refs/heads/main", "main"),
      /not authorized/,
    );
    expectFailure(
      () => validateBuildAdmission("rehearsal", REHEARSAL_REPOSITORY, "refs/heads/feature", "main"),
      /default main branch/,
    );
    expectFailure(
      () => validateBuildAdmission("rehearsal", REHEARSAL_REPOSITORY, "refs/heads/main", "trunk"),
      /default main branch/,
    );
    const evidencePaths = {};
    for (const platform of CANDIDATE_PLATFORMS) {
      const names = expectedPlatformNames(version, platform);
      const artifactPath = path.join(root, names.artifactName);
      fs.writeFileSync(artifactPath, `${platform} candidate bytes`);
      evidencePaths[platform] = path.join(root, names.evidenceName);
      createPlatformEvidence({
        version,
        releaseTag,
        commit,
        platform,
        artifactPath,
        outputPath: evidencePaths[platform],
        checks: REQUIRED_CHECKS[platform],
      });
    }
    const macosEvidence = JSON.parse(fs.readFileSync(evidencePaths.macos_aarch64, "utf8"));
    expectFailure(
      () => validatePlatformEvidence({
        ...macosEvidence,
        checks: macosEvidence.checks.filter((check) => check.name !== "entitlements"),
      }),
      /missing required check entitlements/,
    );
    const aggregatePath = path.join(root, `rho-${version}-candidate-evidence.json`);
    const candidate = createAggregateEvidence({
      version,
      releaseTag,
      commit,
      directory: root,
      windowsEvidencePath: evidencePaths.windows_x86_64,
      macosEvidencePath: evidencePaths.macos_aarch64,
      outputPath: aggregatePath,
    });
    const rehearsalPath = path.join(root, `rho-${version}-rehearsal-evidence.json`);
    const rehearsal = createRehearsalEvidence({
      candidateEvidencePath: aggregatePath,
      sourceRepository: REHEARSAL_REPOSITORY,
      runId: "123456789",
      runAttempt: 1,
      outputPath: rehearsalPath,
    });
    validateRehearsalEvidence(rehearsal, {
      source_repository: REHEARSAL_REPOSITORY,
      version,
      release_tag: releaseTag,
      commit,
      run_id: "123456789",
      run_attempt: 1,
    });
    const candidateAsset = fileRecord(aggregatePath);
    const acceptance = {
      schema_version: 1,
      type: "rho_candidate_acceptance",
      status: "passed",
      decision: "GO",
      version,
      release_tag: releaseTag,
      commit,
      candidate_evidence_sha256: candidateAsset.sha256,
      platforms: candidate.platforms,
    };
    const assets = [
      ...requiredCandidateAssetRecords(candidate).map((entry) => ({ name: entry.name, size: entry.size_bytes, sha256: entry.sha256 })),
      { name: candidateAsset.name, size: candidateAsset.size_bytes, sha256: candidateAsset.sha256 },
      { name: `rho-${version}-acceptance.json`, size: 100, sha256: "e".repeat(64) },
    ];
    const record = {
      tag_name: releaseTag,
      draft: true,
      prerelease: true,
      target_commitish: commit,
      assets,
      platform_evidence: Object.fromEntries(CANDIDATE_PLATFORMS.map((platform) => [
        platform,
        JSON.parse(fs.readFileSync(evidencePaths[platform], "utf8")),
      ])),
      candidate_evidence: candidate,
      candidate_evidence_asset: candidateAsset,
      acceptance_evidence: acceptance,
    };
    validatePublishRecord(record);
    expectFailure(
      () => validateRehearsalEvidence({ ...rehearsal, source_repository: "YuLab-SMU/Rho" }),
      /not authorized/,
    );
    expectFailure(
      () => validateRehearsalEvidence(rehearsal, { commit: "b".repeat(40) }),
      /commit mismatch/,
    );
    expectFailure(
      () => validateRehearsalEvidence({ ...rehearsal, run_id: "0" }),
      /run ID is invalid/,
    );
    expectFailure(
      () => validateRehearsalEvidence({ ...rehearsal, run_attempt: 0 }),
      /run attempt is invalid/,
    );
    expectFailure(
      () => validateRehearsalEvidence({ ...rehearsal, padding: "x".repeat(MAX_EVIDENCE_BYTES) }),
      /byte budget/,
    );
    expectFailure(
      () => createRehearsalEvidence({
        candidateEvidencePath: aggregatePath,
        sourceRepository: "YuLab-SMU/Rho",
        runId: "123456789",
        runAttempt: 1,
        outputPath: path.join(root, `rho-${version}-rehearsal-evidence-foreign.json`),
      }),
      /Expected rehearsal evidence/,
    );
    const foreignRehearsalDirectory = path.join(root, "foreign-rehearsal");
    fs.mkdirSync(foreignRehearsalDirectory);
    expectFailure(
      () => createRehearsalEvidence({
        candidateEvidencePath: aggregatePath,
        sourceRepository: REHEARSAL_REPOSITORY,
        runId: "123456789",
        runAttempt: 1,
        outputPath: path.join(foreignRehearsalDirectory, `rho-${version}-rehearsal-evidence.json`),
      }),
      /outside the candidate directory/,
    );
    expectFailure(() => validateAggregateEvidence(rehearsal), /candidate evidence keys are invalid/);
    expectFailure(
      () => validatePublishRecord({ ...record, candidate_evidence: rehearsal }),
      /candidate evidence keys are invalid/,
    );
    expectFailure(() => validateCandidateIdentity("0.4.0-dev..1", "v0.4.0-dev..1", commit), /not prerelease SemVer/);
    expectFailure(() => validateCandidateIdentity("0.4.0-dev.01", "v0.4.0-dev.01", commit), /not prerelease SemVer/);
    expectFailure(() => validatePublishRecord({ ...record, draft: false }), /draft prerelease/);
    expectFailure(
      () => validatePublishRecord({ ...record, acceptance_evidence: { ...acceptance, decision: "NO-GO" } }),
      /passed GO/,
    );
    const mismatchedAsset = JSON.parse(JSON.stringify(record));
    mismatchedAsset.assets[0].sha256 = "f".repeat(64);
    expectFailure(() => validatePublishRecord(mismatchedAsset), /content mismatch/);
    expectFailure(
      () => validatePublishRecord({
        ...record,
        candidate_evidence_asset: { ...candidateAsset, size_bytes: MAX_EVIDENCE_BYTES + 1 },
      }),
      /invalid/,
    );
    expectFailure(() => validateAggregateEvidence({ ...candidate, platforms: { windows_x86_64: candidate.platforms.windows_x86_64 } }), /candidate platforms keys/);
    const tampered = JSON.parse(JSON.stringify(record));
    tampered.acceptance_evidence.commit = "b".repeat(40);
    expectFailure(() => validatePublishRecord(tampered), /stale/);
    const foreignDirectory = path.join(root, "foreign");
    fs.mkdirSync(foreignDirectory);
    const foreignEvidence = path.join(foreignDirectory, path.basename(evidencePaths.windows_x86_64));
    fs.copyFileSync(evidencePaths.windows_x86_64, foreignEvidence);
    expectFailure(
      () => createAggregateEvidence({
        version,
        releaseTag,
        commit,
        directory: root,
        windowsEvidencePath: foreignEvidence,
        macosEvidencePath: evidencePaths.macos_aarch64,
        outputPath: aggregatePath,
      }),
      /outside the candidate directory/,
    );
    fs.appendFileSync(path.join(root, expectedPlatformNames(version, "macos_aarch64").artifactName), "tampered");
    expectFailure(
      () => createAggregateEvidence({
        version,
        releaseTag,
        commit,
        directory: root,
        windowsEvidencePath: evidencePaths.windows_x86_64,
        macosEvidencePath: evidencePaths.macos_aarch64,
        outputPath: aggregatePath,
      }),
      /does not match evidence/,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  process.stdout.write("Rho candidate release contract tests passed.\n");
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));
  if (args.test === "true") return selfTest();
  if (args.mode === "admission") {
    process.stdout.write(`${JSON.stringify(validateBuildAdmission(
      args.build_mode,
      args.repository,
      args.workflow_ref,
      args.default_branch,
    ))}\n`);
    return;
  }
  if (args.mode === "identity") {
    process.stdout.write(`${JSON.stringify(validateCandidateIdentity(args.version, args.tag, args.commit))}\n`);
    return;
  }
  if (args.mode === "platform") {
    createPlatformEvidence({
      version: args.version,
      releaseTag: args.tag,
      commit: args.commit,
      platform: args.platform,
      artifactPath: args.artifact,
      outputPath: args.output,
      checks: String(args.checks || "").split(",").filter(Boolean),
    });
    return;
  }
  if (args.mode === "aggregate") {
    createAggregateEvidence({
      version: args.version,
      releaseTag: args.tag,
      commit: args.commit,
      directory: args.directory,
      windowsEvidencePath: args.windows_evidence,
      macosEvidencePath: args.macos_evidence,
      outputPath: args.output,
    });
    return;
  }
  if (args.mode === "rehearsal") {
    createRehearsalEvidence({
      candidateEvidencePath: args.input,
      sourceRepository: args.repository,
      runId: args.run_id,
      runAttempt: args.run_attempt,
      outputPath: args.output,
    });
    return;
  }
  if (args.mode === "publish") {
    const result = validatePublishRecord(JSON.parse(fs.readFileSync(args.input, "utf8")));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  fail("Use --test true or --mode admission|identity|platform|aggregate|rehearsal|publish with the required arguments");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli();

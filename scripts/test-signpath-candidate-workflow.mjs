import assert from "node:assert/strict";
import fs from "node:fs";

const normalize = (value) => value.replace(/\r\n?/g, "\n");
const read = (file) => normalize(fs.readFileSync(file, "utf8"));
const occurrences = (value, pattern) => [...value.matchAll(pattern)].length;

function snapshot() {
  return {
    workflow: read(".github/workflows/candidate-build-draft.yml"),
    candidate: read("scripts/candidate-release.mjs"),
    generator: read("scripts/generate-update-site.mjs"),
    policy: read("CODE_SIGNING_POLICY.md"),
    spec: read("docs/plans/active-2026-08-13-dev38-test-signed-prerelease-spec.md"),
    checklist: read("docs/release/active-0.4.0-dev.38-candidate-checklist.md"),
    compatibility: read(".github/workflows/rust-compatibility.yml"),
  };
}

function validate(value) {
  const windows = value.workflow.match(/\n  windows-candidate:[\s\S]*?(?=\n  macos-submit:)/)?.[0];
  const rehearsal = value.workflow.match(/\n  rehearsal-evidence:[\s\S]*?(?=\n  draft-candidate:)/)?.[0];
  const draft = value.workflow.match(/\n  draft-candidate:[\s\S]*$/)?.[0];
  assert.ok(windows, "Windows candidate job is missing");
  assert.ok(rehearsal, "Rehearsal aggregation job is missing");
  assert.ok(draft, "Candidate Draft job is missing");

  const orderedSteps = [
    "Run complete Windows candidate validation",
    "Build and smoke-test Windows installer",
    "Load protected SignPath deployment configuration",
    "Verify and isolate exact unsigned candidate",
    "Prepare fixed official SignPath module",
    "Submit exact candidate through official SignPath REST module",
    "Verify and promote returned test-signed installer",
    "Clear SignPath deployment values before evidence handoff",
    "Create Windows platform evidence",
    "Upload immutable Windows candidate inputs",
  ];
  let previous = -1;
  for (const label of orderedSteps) {
    const index = windows.indexOf(label);
    assert.ok(index > previous, `${label} must occur in the fail-closed candidate order`);
    previous = index;
  }

  for (const label of orderedSteps.slice(2, 8)) {
    const step = windows.match(new RegExp(`- name: ${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?(?=\\n      - name:|$)`))?.[0];
    assert.ok(step, `Missing candidate-only step ${label}`);
    assert.match(step, /if: \$\{\{ (?:always\(\) && )?needs\.identity\.outputs\.build_mode == 'candidate' \}\}/);
  }

  const config = windows.match(/- name: Load protected SignPath deployment configuration[\s\S]*?(?=\n      - name: Verify and isolate exact unsigned candidate)/)?.[0];
  assert.ok(config);
  for (const key of [
    "SIGNPATH_ORGANIZATION_ID",
    "SIGNPATH_PROJECT_SLUG",
    "SIGNPATH_SIGNING_POLICY_SLUG",
    "SIGNPATH_ARTIFACT_CONFIGURATION_SLUG",
    "SIGNPATH_CERTIFICATE_THUMBPRINT",
  ]) assert.match(config, new RegExp(key));
  assert.match(config, /Compare-Object[^\n]*\$required/);
  assert.match(config, /::add-mask::\$value[\s\S]*GITHUB_ENV/);
  assert.match(config, /unexpected key set/);
  assert.match(config, /blank or multiline value/);

  assert.equal(occurrences(windows, /SIGNPATH_API_TOKEN: \$\{\{ secrets\.SIGNPATH_API_TOKEN \}\}/g), 1, "API token must be scoped to one step");
  assert.doesNotMatch(windows.match(/\n    env:[\s\S]*?\n    steps:/)?.[0] || "", /SIGNPATH_API_TOKEN/);
  const submission = windows.match(/- name: Submit exact candidate through official SignPath REST module[\s\S]*?(?=\n      - name: Verify and promote returned test-signed installer)/)?.[0];
  assert.ok(submission);
  assert.match(submission, /Install-Module|Get-Module/);
  assert.match(submission, /Submit-SigningRequest/);
  for (const argument of [
    "-InputArtifactPath",
    "-ProjectSlug",
    "-SigningPolicySlug",
    "-ArtifactConfigurationSlug",
    "-WaitForCompletion",
    "-OutputArtifactPath",
    "-OrganizationId",
    "-ApiToken",
  ]) assert.match(submission, new RegExp(argument.replace(/-/g, "\\-")));
  assert.match(submission, /WaitForCompletionTimeoutInSeconds 900/);
  assert.match(submission, /UploadAndDownloadRequestTimeoutInSeconds 300/);

  assert.equal(occurrences(windows, /4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae/g), 1);
  assert.match(windows, /Get-AuthenticodeSignature[\s\S]*Status -ne "NotSigned"/);
  assert.match(windows, /Status -ne "UnknownError"/);
  assert.match(windows, /SignerCertificate\.Thumbprint/);
  assert.match(windows, /SignerCertificate\.Subject -ne \$signature\.SignerCertificate\.Issuer/);
  assert.match(windows, /signedHash -eq \$env:RHO_UNSIGNED_INSTALLER_SHA256/);
  assert.match(windows, /promotedHash -ne \$signedHash/);
  assert.match(windows, /profile = "free_trial_self_signed"/);
  assert.match(windows, /request_id = \$env:SIGNING_REQUEST_ID/);

  const platform = windows.match(/- name: Create Windows platform evidence[\s\S]*?(?=\n      - name: Upload immutable Windows candidate inputs)/)?.[0];
  assert.ok(platform);
  assert.match(platform, /CANDIDATE_MODE/);
  assert.match(platform, /authenticode,signpath_request_binding,free_trial_self_signed/);
  assert.match(platform, /--signing/);
  assert.match(rehearsal, /--mode aggregate/);
  assert.doesNotMatch(rehearsal, /--require_windows_signing true/);
  assert.match(draft, /--require_windows_signing true/);

  assert.match(value.candidate, /WINDOWS_SIGNING_CHECKS/);
  assert.match(value.candidate, /free_trial_self_signed/);
  assert.match(value.candidate, /Windows signed hash does not match the candidate artifact/);
  assert.match(value.candidate, /Windows signing hashes are invalid or unchanged/);
  assert.match(value.candidate, /signing check \$\{required\} without signing evidence/);
  assert.match(value.candidate, /UNSIGNED_CANDIDATE_COMPATIBILITY = new Set\(\["0\.4\.0-dev\.27"\]\)/);
  assert.match(value.candidate, /UNSIGNED_PUBLISHED_COMPATIBILITY = new Set\(\["0\.4\.0-dev\.24"\]\)/);

  assert.match(value.generator, /Windows trust: Authenticode-signed with a SignPath Free Trial self-signed test certificate/);
  assert.match(value.generator, /It is not publicly trusted; Windows or SmartScreen may still warn/);
  assert.match(value.generator, /does not establish Foundation acceptance/);
  assert.match(value.policy, /Free Trial test-signed prerelease boundary/);
  assert.match(value.policy, /not\s+publicly trusted/);
  assert.match(value.spec, /Status: active; DEV38-SIGN1 contract authorized/);
  assert.match(value.checklist, /Human Installed Acceptance/);
  assert.match(value.checklist, /Automation and screenshots may support[\s\S]*cannot mark them passed/);

  assert.equal(occurrences(value.compatibility, /node scripts\/test-signpath-candidate-workflow\.mjs --self-test/g), 1);
  assert.equal(occurrences(value.compatibility, /node scripts\/test-signpath-candidate-workflow\.mjs(?:\s|$)/g), 2);
  for (const trigger of [
    "scripts/test-signpath-candidate-workflow.mjs",
    "docs/plans/active-2026-08-13-dev38-test-signed-prerelease-spec.md",
    "docs/release/active-0.4.0-dev.38-candidate-checklist.md",
  ]) {
    assert.equal(occurrences(value.compatibility, new RegExp(`- "${trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")), 2, `${trigger} must trigger push and PR checks`);
  }
}

function expectRejected(base, name, mutate, pattern) {
  const changed = structuredClone(base);
  mutate(changed);
  assert.throws(() => validate(changed), pattern, `${name} must fail closed`);
}

const current = snapshot();
validate(current);

if (process.argv.includes("--self-test")) {
  expectRejected(current, "build/sign order drift", (value) => {
    value.workflow = value.workflow.replace("Build and smoke-test Windows installer", "Build Windows installer later");
  }, /Build and smoke-test/);
  expectRejected(current, "token scope expansion", (value) => {
    value.workflow = value.workflow.replace(
      "    permissions:\n      contents: read\n    steps:\n      - name: Check out immutable candidate commit",
      "    permissions:\n      contents: read\n    env:\n      SIGNPATH_API_TOKEN: expanded\n    steps:\n      - name: Check out immutable candidate commit",
    );
  }, /SIGNPATH_API_TOKEN/);
  expectRejected(current, "trusted Free Trial status", (value) => {
    value.workflow = value.workflow.replace('Status -ne "UnknownError"', 'Status -ne "Valid"');
  }, /UnknownError/);
  expectRejected(current, "missing candidate signing gate", (value) => {
    value.workflow = value.workflow.replace(" --require_windows_signing true", "");
  }, /require_windows_signing/);
  expectRejected(current, "false public trust", (value) => {
    value.generator = value.generator.replace("It is not publicly trusted; Windows or SmartScreen may still warn.", "It is publicly trusted.");
  }, /not publicly trusted/);
}

process.stdout.write(`SignPath candidate workflow contract is valid${process.argv.includes("--self-test") ? " (negative self-tests passed)" : ""}.\n`);

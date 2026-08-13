import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const normalize = (value) => value.replace(/\r\n/g, "\n");
const read = (relativePath) => normalize(fs.readFileSync(path.join(root, relativePath), "utf8"));

function occurrences(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function snapshot() {
  return {
    workflow: read(".github/workflows/signpath-free-trial-smoke.yml"),
    spec: read("docs/plans/active-2026-08-12-signpath-free-trial-smoke-spec.md"),
    parent: read("docs/plans/active-2026-08-11-signpath-application-readiness-spec.md"),
    crossReview: read("docs/project/active-document-cross-review.md"),
    checklist: read("docs/release/active-0.4.0-dev.37-candidate-checklist.md"),
    docsIndex: read("docs/README.md"),
    compatibility: read(".github/workflows/rust-compatibility.yml"),
  };
}

function validate(value) {
  const workflow = value.workflow;
  assert.match(workflow, /^name: SignPath Free Trial Smoke$/m);
  assert.match(workflow, /^on:\n  workflow_dispatch:\s*$/m, "the smoke lane must be manual-only and input-free");
  assert.doesNotMatch(workflow, /^  (?:push|pull_request|workflow_run|schedule):/m, "automatic triggers are forbidden");
  assert.match(workflow, /^permissions:\n  actions: read\n  contents: read$/m);
  assert.doesNotMatch(workflow, /^\s+(?:actions|contents|packages|pages|id-token): write$/m, "the smoke lane must have no write-scoped token permission");
  assert.match(workflow, /test "\$GITHUB_REPOSITORY" = "YuLab-SMU\/Rho"/);
  assert.match(workflow, /test "\$GITHUB_REF" = "refs\/heads\/\$DEFAULT_BRANCH"/);
  assert.match(workflow, /test "\$GITHUB_SHA" = "\$default_head"/);
  assert.match(workflow, /needs: admission/);

  for (const immutable of [
    "31644429787",
    "9160516935",
    "rho-0.4.0-dev.37-issue33-windows-installed-7ab861b01a36313150988b1e2fa8fdc2056325d9-31644429787",
    "7ab861b01a36313150988b1e2fa8fdc2056325d9",
    "Rho_0.4.0-dev.37_x64-setup.exe",
    "a8fa9ad2628590c9c12e176f22930d971fd8d2572dc606b52b55e38abb41bda6",
  ]) assert.match(workflow, new RegExp(immutable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing immutable source binding: ${immutable}`);
  assert.match(workflow, /\.status == "completed"[\s\S]{0,160}\.conclusion == "success"[\s\S]{0,160}\.head_sha == \$commit/);
  assert.match(workflow, /\.expired == false[\s\S]{0,120}\.workflow_run\.id == \$run_id/);
  assert.match(workflow, /uses: actions\/download-artifact@v5/);
  assert.match(workflow, /artifact-ids: 9160516935/);
  assert.match(workflow, /run-id: 31644429787/);
  assert.match(workflow, /merge-multiple: true/);

  for (const variable of [
    "SIGNPATH_ORGANIZATION_ID",
    "SIGNPATH_PROJECT_SLUG",
    "SIGNPATH_SIGNING_POLICY_SLUG",
    "SIGNPATH_ARTIFACT_CONFIGURATION_SLUG",
    "SIGNPATH_CERTIFICATE_THUMBPRINT",
  ]) assert.match(workflow, new RegExp(`vars\\.${variable}`), `${variable} must come from repository variables`);
  const variableValidation = workflow.match(/- name: Validate non-secret SignPath deployment variables[\s\S]*?(?=\n      - name: Download exact accepted unsigned artifact)/)?.[0];
  assert.ok(variableValidation, "the deployment-variable validation step is missing");
  assert.match(variableValidation, /\$value = \[Environment\]::GetEnvironmentVariable\(\$name\)/);
  assert.match(variableValidation, /Write-Output "::add-mask::\$value"/, "every deployment variable must be masked before SignPath execution");
  assert.doesNotMatch(workflow, /[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/i, "the organization identifier must not be committed");
  assert.equal(occurrences(workflow, /secrets\.SIGNPATH_API_TOKEN/g), 1, "the protected token must be passed only to the bounded module step");
  assert.match(workflow, /SIGNPATH_API_TOKEN: \$\{\{ secrets\.SIGNPATH_API_TOKEN \}\}/);
  assert.match(workflow, /SIGNPATH_MODULE_VERSION: "4\.4\.6"/);
  assert.match(workflow, /SIGNPATH_MODULE_SHA256: 4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae/);
  assert.match(workflow, /Install-Module -Name SignPath -RequiredVersion \$env:SIGNPATH_MODULE_VERSION -Repository PSGallery -Scope CurrentUser -Force -AllowClobber -ErrorAction Stop/);
  assert.match(workflow, /Get-FileHash -LiteralPath \$moduleFile -Algorithm SHA256/);
  assert.equal(occurrences(workflow, /\$moduleHash -ne \$env:SIGNPATH_MODULE_SHA256/g), 2, "module integrity must be rechecked at the execution boundary");
  assert.match(workflow, /Compress-Archive -LiteralPath \$inputInstaller -DestinationPath \$inputArchive/);
  assert.match(workflow, /\$entries\.Count -ne 1 -or \$entries\[0\]\.FullName -ne \$env:EXPECTED_INSTALLER/);
  assert.match(workflow, /Submit-SigningRequest `/);
  assert.match(workflow, /-InputArtifactPath \$inputArchive/);
  assert.match(workflow, /-ProjectSlug \$env:SIGNPATH_PROJECT_SLUG/);
  assert.match(workflow, /-SigningPolicySlug \$env:SIGNPATH_SIGNING_POLICY_SLUG/);
  assert.match(workflow, /-ArtifactConfigurationSlug \$env:SIGNPATH_ARTIFACT_CONFIGURATION_SLUG/);
  assert.match(workflow, /-WaitForCompletionTimeoutInSeconds 900/);
  assert.match(workflow, /-OutputArtifactPath \$signedArchive/);
  assert.match(workflow, /-OrganizationId \$env:SIGNPATH_ORGANIZATION_ID/);
  assert.match(workflow, /-ApiToken \$env:SIGNPATH_API_TOKEN/);
  assert.match(workflow, /\$returnedEntries\.Count -ne 1 -or \$returnedEntries\[0\]\.FullName -ne \$env:EXPECTED_INSTALLER/);
  assert.match(workflow, /ZipFileExtensions\]::ExtractToFile\(\$returnedEntries\[0\], \$returnedInstaller, \$false\)/);
  assert.doesNotMatch(workflow, /Expand-Archive/, "returned ZIP extraction must occur only after exact root-entry validation");
  assert.match(workflow, /SIGNING_REQUEST_ID: \$\{\{ steps\.direct-signpath\.outputs\.signing_request_id \}\}/);
  assert.doesNotMatch(workflow, /signpath\/github-action-submit-signing-request|github-artifact-id|upload-unsigned/, "the rejected GitHub connector and unsigned artifact handoff must stay absent");
  assert.match(workflow, /IsNullOrWhiteSpace\(\$env:SIGNING_REQUEST_ID\)/);

  assert.match(workflow, /\[string\]\$signature\.Status -ne "NotSigned"/);
  assert.match(workflow, /forbiddenStatuses = @\("NotSigned", "HashMismatch", "NotSupported", "Incompatible"\)/);
  assert.match(workflow, /\$null -eq \$signature\.SignerCertificate/);
  assert.match(workflow, /\$actualThumbprint -ne \$expectedThumbprint/);
  assert.match(workflow, /SignerCertificate\.Subject -ne \$signature\.SignerCertificate\.Issuer/);
  assert.match(workflow, /\$signedHash -eq \$env:EXPECTED_UNSIGNED_SHA256/);
  assert.match(workflow, /public_release_authorized = \$false/);
  assert.match(workflow, /candidate_authorized = \$false/);
  assert.match(workflow, /installed_after_signing = \$false/);
  assert.match(workflow, /signing_transport = "signpath_powershell_module"/);
  assert.match(workflow, /signpath_module_version = \$env:SIGNPATH_MODULE_VERSION/);
  assert.match(workflow, /signpath_module_sha256 = \$env:SIGNPATH_MODULE_SHA256/);
  assert.match(workflow, /name: rho-signpath-free-trial-smoke-dev37-/);
  assert.equal(occurrences(workflow, /retention-days: 1\s*$/gm), 0, "the unsigned ZIP must stay runner-local");
  assert.equal(occurrences(workflow, /retention-days: 7\s*$/gm), 1, "signed smoke result retention must be seven days");
  assert.doesNotMatch(workflow, /actions\/checkout|createRelease|updateRelease|uploadReleaseAsset|createRef|gh release|candidate-publish|generate-update-site|update-site-publish/i, "the smoke lane must not execute source or mutate release/update state");

  assert.match(value.spec, /^# SignPath Free Trial Windows Smoke Contract$/m);
  assert.match(value.spec, /Status: active; FT-SIGN1/);
  assert.match(value.spec, /继续，使用Free trial\s+subscription/);
  assert.match(value.spec, /must not merge/);
  assert.match(value.parent, /active-2026-08-12-signpath-free-trial-smoke-spec\.md/);
  assert.match(value.parent, /Free Trial project\/test policy exists/);
  assert.match(value.crossReview, /active-2026-08-12-signpath-free-trial-smoke-spec\.md/);
  assert.match(value.crossReview, /PR #51[\s\S]{0,180}must not merge/);
  assert.match(value.checklist, /FT-SIGN1 Free Trial smoke/);
  assert.match(value.checklist, /public_release_authorized/);
  assert.match(value.docsIndex, /plans\/active-2026-08-12-signpath-free-trial-smoke-spec\.md/);

  for (const trigger of [
    ".github/workflows/signpath-free-trial-smoke.yml",
    "scripts/test-signpath-free-trial-smoke.mjs",
    "docs/plans/active-2026-08-12-signpath-free-trial-smoke-spec.md",
    "docs/release/active-0.4.0-dev.37-candidate-checklist.md",
    "docs/project/active-document-cross-review.md",
  ]) {
    assert.equal(occurrences(value.compatibility, new RegExp(`- "${trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")), 2, `${trigger} must trigger push and pull-request validation`);
  }
  assert.equal(occurrences(value.compatibility, /node scripts\/test-signpath-free-trial-smoke\.mjs --self-test/g), 1);
  assert.equal(occurrences(value.compatibility, /node scripts\/test-signpath-free-trial-smoke\.mjs(?:\s|$)/g), 2);
}

function expectRejected(base, name, mutate, pattern) {
  const changed = structuredClone(base);
  mutate(changed);
  assert.throws(() => validate(changed), pattern, `${name} must fail closed`);
}

const current = snapshot();
validate(current);

if (process.argv.includes("--self-test")) {
  expectRejected(current, "automatic trigger", (value) => {
    value.workflow = value.workflow.replace("  workflow_dispatch:\n", "  push:\n");
  }, /manual-only/);
  expectRejected(current, "write permission", (value) => {
    value.workflow = value.workflow.replace("  contents: read", "  contents: write");
  }, /permissions|write-scoped/);
  expectRejected(current, "missing upstream guard", (value) => {
    value.workflow = value.workflow.replace('test "$GITHUB_REPOSITORY" = "YuLab-SMU/Rho"', "true");
  }, /GITHUB_REPOSITORY/);
  expectRejected(current, "changed source hash", (value) => {
    value.workflow = value.workflow.replace("a8fa9ad2628590c9c12e176f22930d971fd8d2572dc606b52b55e38abb41bda6", "0".repeat(64));
  }, /immutable source binding/);
  expectRejected(current, "public organization id", (value) => {
    value.workflow = value.workflow.replace("${{ vars.SIGNPATH_ORGANIZATION_ID }}", "11111111-2222-4333-8444-555555555555");
  }, /organization identifier/);
  expectRejected(current, "unmasked deployment variables", (value) => {
    value.workflow = value.workflow.replace('Write-Output "::add-mask::$value"', "");
  }, /must be masked/);
  expectRejected(current, "changed SignPath module version", (value) => {
    value.workflow = value.workflow.replace('SIGNPATH_MODULE_VERSION: "4.4.6"', 'SIGNPATH_MODULE_VERSION: "4.4.5"');
  }, /SIGNPATH_MODULE_VERSION/);
  expectRejected(current, "changed SignPath module hash", (value) => {
    value.workflow = value.workflow.replace("4a732624a7214dc8290dbf81ed2714d6b509be319427c2d55fd0c679d13ab5ae", "0".repeat(64));
  }, /SIGNPATH_MODULE_SHA256/);
  expectRejected(current, "missing artifact configuration", (value) => {
    value.workflow = value.workflow.replace("-ArtifactConfigurationSlug $env:SIGNPATH_ARTIFACT_CONFIGURATION_SLUG", "-ArtifactConfigurationSlug disabled");
  }, /ArtifactConfigurationSlug/);
  expectRejected(current, "missing local ZIP cardinality", (value) => {
    value.workflow = value.workflow.replace("$entries.Count -ne 1 -or $entries[0].FullName -ne $env:EXPECTED_INSTALLER", "$false");
  }, /entries/);
  expectRejected(current, "missing returned ZIP cardinality", (value) => {
    value.workflow = value.workflow.replace("$returnedEntries.Count -ne 1 -or $returnedEntries[0].FullName -ne $env:EXPECTED_INSTALLER", "$false");
  }, /returnedEntries/);
  expectRejected(current, "missing direct submission", (value) => {
    value.workflow = value.workflow.replace("Submit-SigningRequest `", "Write-Output `");
  }, /Submit-SigningRequest/);
  expectRejected(current, "missing signing request identity", (value) => {
    value.workflow = value.workflow.replace("IsNullOrWhiteSpace($env:SIGNING_REQUEST_ID)", "IsNullOrWhiteSpace('not-empty')");
  }, /SIGNING_REQUEST_ID/);
  expectRejected(current, "missing unsigned precondition", (value) => {
    value.workflow = value.workflow.replace('[string]$signature.Status -ne "NotSigned"', "$false");
  }, /NotSigned/);
  expectRejected(current, "weakened returned status", (value) => {
    value.workflow = value.workflow.replace('"NotSigned", "HashMismatch", "NotSupported", "Incompatible"', '"NotSigned"');
  }, /forbiddenStatuses/);
  expectRejected(current, "missing thumbprint binding", (value) => {
    value.workflow = value.workflow.replace("$actualThumbprint -ne $expectedThumbprint", "$false");
  }, /actualThumbprint/);
  expectRejected(current, "publication authority", (value) => {
    value.workflow = value.workflow.replace("public_release_authorized = $false", "public_release_authorized = $true");
  }, /public_release_authorized/);
  expectRejected(current, "release mutation", (value) => {
    value.workflow += "\n# createRelease\n";
  }, /mutate release/);
}

process.stdout.write(`SignPath Free Trial smoke contract is valid${process.argv.includes("--self-test") ? " (negative self-tests passed)" : ""}.\n`);

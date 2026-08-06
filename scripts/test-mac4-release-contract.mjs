import assert from "node:assert/strict";
import fs from "node:fs";

const normalizeLineEndings = (text) => text.replace(/\r\n/g, "\n");
const read = (file) => normalizeLineEndings(fs.readFileSync(file, "utf8"));
const count = (text, pattern) => [...text.matchAll(pattern)].length;

const expectedVersion = "0.4.0-dev.1";
const cargo = read("Cargo.toml");
const cargoVersion = cargo.match(/^version = "([^"]+)"/m)?.[1];
assert.equal(cargoVersion, expectedVersion, "Cargo candidate version must be synchronized");
assert.equal(JSON.parse(read("desktop/src-tauri/tauri.conf.json")).version, expectedVersion);
assert.equal(JSON.parse(read("desktop/package.json")).version, expectedVersion);
const packageLock = JSON.parse(read("desktop/package-lock.json"));
assert.equal(packageLock.version, expectedVersion);
assert.equal(packageLock.packages[""].version, expectedVersion);
assert.match(read("desktop/dist/index.html"), /styles\.css\?v=0\.4\.0-dev\.1/);
assert.match(read("desktop/dist/index.html"), /app\.js\?v=0\.4\.0-dev\.1/);
assert.ok(count(read("desktop/dist/app.js"), /0\.4\.0-dev\.1/g) >= 3, "Mock identity must be synchronized");

const localPackagePattern = /name = "rho-[^"]+"\r?\nversion = "([^"]+)"/g;
assert.deepEqual(
  [...'name = "rho-fixture"\r\nversion = "0.4.0-dev.1"'.matchAll(localPackagePattern)].map((match) => match[1]),
  [expectedVersion],
  "Cargo.lock parsing must accept Windows CRLF checkouts",
);
const lockLocalVersions = [...read("Cargo.lock").matchAll(localPackagePattern)].map((match) => match[1]);
assert.ok(lockLocalVersions.length >= 9, "Expected local Rho workspace packages in Cargo.lock");
assert.ok(lockLocalVersions.every((version) => version === expectedVersion), "Cargo.lock local package versions must match the candidate");

const build = read(".github/workflows/candidate-build-draft.yml");
const buildModePattern = /build_mode:\n[\s\S]*?default: rehearsal\n[\s\S]*?type: choice\n[\s\S]*?- rehearsal\n[\s\S]*?- candidate/;
const crlfBuildModeFixture = [
  "build_mode:",
  "  default: rehearsal",
  "  type: choice",
  "  options:",
  "    - rehearsal",
  "    - candidate",
].join("\r\n");
assert.match(
  normalizeLineEndings(crlfBuildModeFixture),
  buildModePattern,
  "Workflow contract parsing must accept Windows CRLF checkouts",
);
assert.match(build, /name: Build Rho Candidate \/ Rehearsal/);
assert.match(build, buildModePattern);
assert.match(build, /candidate-release\.mjs --mode admission --build_mode "\$BUILD_MODE" --repository "\$GITHUB_REPOSITORY" --workflow_ref "\$GITHUB_REF" --default_branch "\$DEFAULT_BRANCH"/);
assert.match(build, /commit="\$\(git rev-parse "\$\{INPUT_REF\}\^\{commit\}"\)"/);
assert.match(build, /Requested commit \$commit is not the current default-branch commit \$default_commit/);
assert.equal(count(build, /persist-credentials: false/g), 5, "Every candidate checkout must avoid persisted Git credentials");
assert.match(build, /runs-on: macos-26\b/);
assert.doesNotMatch(build, /macos-26-arm64/);
assert.match(build, /DEVELOPER_DIR: \/Applications\/Xcode_26\.6\.app\/Contents\/Developer/);
assert.match(build, /--bundles app,dmg/);
assert.match(build, /test "\$\(xcodebuild -version \| sed -n '1p'\)" = "Xcode 26\.6"/);
for (const secret of [
  "APPLE_CERTIFICATE",
  "APPLE_CERTIFICATE_PASSWORD",
  "KEYCHAIN_PASSWORD",
  "APPLE_SIGNING_IDENTITY",
  "APPLE_TEAM_ID",
  "APPLE_API_ISSUER",
  "APPLE_API_KEY",
  "APPLE_API_PRIVATE_KEY",
]) assert.match(build, new RegExp(`secrets\\.${secret}\\b`), `Missing ${secret} secret interface`);
assert.doesNotMatch(build, /secrets\.APPLE_API_KEY_PATH/);
assert.match(build, /APPLE_API_KEY_PATH=\$api_key_path/);
assert.doesNotMatch(build, /security import[^\n]+ -A(?: |$)/);
assert.match(build, /security import[^\n]+ -T \/usr\/bin\/codesign/);
assert.match(build, /if: always\(\)/);
assert.match(build, /security delete-keychain "\$keychain_path"/);
assert.doesNotMatch(build, /security delete-keychain[^\n]+\|\| true/);
assert.match(build, /rm -f "\$RUNNER_TEMP\/AuthKey_\$\{APPLE_API_KEY\}\.p8"/);
assert.match(build, /test ! -e "\$keychain_path"/);
for (const command of [
  "codesign --verify --deep --strict --verbose=4",
  "xcrun notarytool submit",
  "xcrun stapler validate",
  "spctl --assess --type execute",
  "spctl --assess --type open",
]) assert.ok(build.includes(command), `Missing macOS release gate: ${command}`);
assert.doesNotMatch(build, /xcrun notarytool history/);
assert.match(build, /env -u APPLE_API_ISSUER -u APPLE_API_KEY -u APPLE_API_KEY_PATH npx/);
assert.match(build, /require_exact_arm64 "Rho app executable"/);
assert.match(build, /require_exact_arm64 "Bundled Ark executable"/);
assert.match(
  build,
  /xcrun notarytool submit "\$dmg_path" --key "\$APPLE_API_KEY_PATH" --key-id "\$APPLE_API_KEY" --issuer "\$APPLE_API_ISSUER" --wait --output-format json > target\/notary-dmg-submit\.json/,
);
assert.match(build, /node scripts\/validate-notary-receipt\.mjs target\/notary-dmg-submit\.json/);
const dmgSubmitIndex = build.indexOf('xcrun notarytool submit "$dmg_path"');
const receiptValidationIndex = build.indexOf("node scripts/validate-notary-receipt.mjs");
const dmgStapleIndex = build.indexOf('xcrun stapler staple "$dmg_path"');
const gatekeeperIndex = build.indexOf("spctl --assess --type execute");
assert.ok(
  dmgSubmitIndex < receiptValidationIndex
    && receiptValidationIndex < dmgStapleIndex
    && dmgStapleIndex < gatekeeperIndex,
  "Final DMG submission, receipt validation, staple, and Gatekeeper gates must stay ordered",
);
const notaryValidator = read("scripts/validate-notary-receipt.mjs");
assert.match(notaryValidator, /MAX_NOTARY_RECEIPT_BYTES = 64 \* 1024/);
assert.match(notaryValidator, /receipt\.status !== "Accepted"/);
assert.match(notaryValidator, /submissionIdPattern\.test\(receipt\.id\)/);
assert.match(build, /draft: true/);
assert.match(build, /prerelease: true/);
assert.match(build, /getReleaseByTag/);
assert.match(build, /git\.getRef/);
assert.doesNotMatch(build, /deleteReleaseAsset/);
assert.equal(count(build, /uploadReleaseAsset/g), 1, "Only the draft assembly loop may upload release assets");
assert.equal(count(build, /contents: write/g), 1, "Only candidate draft assembly may request contents write");
assert.equal(count(build, /overwrite: true/g), 2, "Only the two intermediate platform artifacts may be replaced on a rerun");
assert.equal(count(build, /pattern: rho-\$\{\{ needs\.identity\.outputs\.version \}\}-\*-\$\{\{ github\.run_id \}\}/g), 2);
assert.match(build, /name: rho-\$\{\{ needs\.identity\.outputs\.version \}\}-windows-x86-64-\$\{\{ github\.run_id \}\}/);
assert.match(build, /name: rho-\$\{\{ needs\.identity\.outputs\.version \}\}-macos-arm64-\$\{\{ github\.run_id \}\}/);

const rehearsalJob = build.match(/\n  rehearsal-evidence:[\s\S]*?(?=\n  draft-candidate:)/)?.[0];
assert.ok(rehearsalJob, "Missing rehearsal evidence job");
assert.match(rehearsalJob, /needs\.identity\.outputs\.build_mode == 'rehearsal'/);
assert.match(rehearsalJob, /github\.repository == 'YuLab-SMU\/Rho_for_mac'/);
assert.match(rehearsalJob, /permissions:\n\s+contents: read/);
assert.match(rehearsalJob, /candidate-release\.mjs --mode rehearsal/);
assert.match(rehearsalJob, /unlinkSync/);
assert.doesNotMatch(rehearsalJob, /contents: write|createRelease|uploadReleaseAsset|getReleaseByTag|git\.getRef/);
const rehearsalUpload = rehearsalJob.match(/- name: Upload exact review-only rehearsal artifact[\s\S]*$/)?.[0];
assert.ok(rehearsalUpload, "Missing rehearsal artifact upload");
assert.equal(count(rehearsalUpload, /^\s+target\/candidate\//gm), 7, "Rehearsal artifact must contain exactly seven files");
assert.match(rehearsalUpload, /rho-\$\{\{ needs\.identity\.outputs\.version \}\}-rehearsal-evidence\.json/);
assert.match(rehearsalUpload, /github\.run_id/);
assert.match(rehearsalUpload, /github\.run_attempt/);
assert.doesNotMatch(rehearsalUpload, /candidate-evidence\.json/);
assert.match(rehearsalUpload, /retention-days: 14/);

const draftJob = build.match(/\n  draft-candidate:[\s\S]*$/)?.[0];
assert.ok(draftJob, "Missing candidate draft job");
assert.match(draftJob, /needs\.identity\.outputs\.build_mode == 'candidate'/);
assert.match(draftJob, /github\.repository == 'YuLab-SMU\/Rho'/);
assert.match(draftJob, /permissions:\n\s+contents: write/);

const candidateTool = read("scripts/candidate-release.mjs");
assert.match(candidateTool, /rho_candidate_rehearsal_evidence/);
assert.match(candidateTool, /REHEARSAL_REPOSITORY = "YuLab-SMU\/Rho_for_mac"/);
assert.match(candidateTool, /CANDIDATE_REPOSITORY = "YuLab-SMU\/Rho"/);
assert.match(candidateTool, /validateBuildAdmission/);
assert.match(candidateTool, /Rehearsal evidence exceeds its byte budget/);

const publish = read(".github/workflows/candidate-publish.yml");
assert.match(publish, /environment: rho-release/);
assert.match(publish, /candidate-release\.mjs --mode publish/);
assert.match(publish, /256 \* 1024/);
assert.match(publish, /publish-release-snapshot\.json/);
assert.match(publish, /Draft identity or assets changed after content validation/);
assert.match(publish, /rho-\$\{version\}-acceptance\.json/);
assert.match(publish, /draft: false/);
assert.match(publish, /prerelease: true/);
assert.doesNotMatch(publish, /uploadReleaseAsset|deleteReleaseAsset|createRelease/);
assert.equal(count(publish, /updateRelease/g), 1, "Publish workflow may perform one release state transition");

const pages = read(".github/workflows/update-site-publish.yml");
assert.match(pages, /"Publish Rho Candidate"/);
assert.match(pages, /rho-\$\{version\}-candidate-evidence\.json/);
assert.match(pages, /target_commitish: release\.target_commitish/);
assert.match(pages, /artifacts\.macos_aarch64/);
assert.match(pages, /Platform evidence content mismatch/);

const update = read("desktop/src-tauri/src/update.rs");
assert.match(update, /macos_aarch64: Option<UpdateArtifact>/);
assert.match(update, /if let Some\(artifact\) = &manifest\.artifacts\.macos_aarch64/);
assert.match(update, /UPDATE_PLATFORM_UNAVAILABLE/);
assert.match(read("desktop/dist/app.js"), /This release does not include an installer for this Mac yet\./);
const generator = read("scripts/generate-update-site.mjs");
assert.match(generator, /validateAggregateEvidence/);
assert.match(generator, /Download for macOS \(Apple Silicon\)/);
assert.match(generator, /candidate platforms/);

process.stdout.write("MAC4 release contract tests passed.\n");

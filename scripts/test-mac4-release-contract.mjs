import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
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

const lockLocalVersions = [...read("Cargo.lock").matchAll(/name = "rho-[^"]+"\nversion = "([^"]+)"/g)].map((match) => match[1]);
assert.ok(lockLocalVersions.length >= 9, "Expected local Rho workspace packages in Cargo.lock");
assert.ok(lockLocalVersions.every((version) => version === expectedVersion), "Cargo.lock local package versions must match the candidate");

const build = read(".github/workflows/candidate-build-draft.yml");
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
assert.match(build, /security delete-keychain "\$RUNNER_TEMP\/rho-signing\.keychain-db"/);
assert.match(build, /rm -f "\$RUNNER_TEMP\/AuthKey_\$\{APPLE_API_KEY\}\.p8"/);
for (const command of [
  "codesign --verify --deep --strict --verbose=4",
  "xcrun notarytool history",
  "xcrun stapler validate",
  "spctl --assess --type execute",
  "spctl --assess --type open",
]) assert.ok(build.includes(command), `Missing macOS release gate: ${command}`);
assert.match(build, /draft: true/);
assert.match(build, /prerelease: true/);
assert.match(build, /getReleaseByTag/);
assert.match(build, /git\.getRef/);
assert.doesNotMatch(build, /deleteReleaseAsset/);
assert.equal(count(build, /uploadReleaseAsset/g), 1, "Only the draft assembly loop may upload release assets");

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

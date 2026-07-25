import fs from "node:fs";
import path from "node:path";

const WEBSITE = "https://yulab-smu.top/Rho/";
const REPOSITORY = "https://github.com/YuLab-SMU/Rho";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) result[argv[index]?.replace(/^--/, "")] = argv[index + 1];
  return result;
}

function parseVersion(value) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/.exec(value);
  if (!match) throw new Error(`Invalid SemVer: ${value}`);
  return { raw: value, core: match.slice(1, 4).map(Number), pre: match[4]?.split(".") || [] };
}

function compareIdentifier(left, right) {
  const leftNumber = /^\d+$/.test(left) ? Number(left) : null;
  const rightNumber = /^\d+$/.test(right) ? Number(right) : null;
  if (leftNumber != null && rightNumber != null) return leftNumber - rightNumber;
  if (leftNumber != null) return -1;
  if (rightNumber != null) return 1;
  return left.localeCompare(right, "en");
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] - right.core[index];
  }
  if (!left.pre.length && right.pre.length) return 1;
  if (left.pre.length && !right.pre.length) return -1;
  for (let index = 0; index < Math.max(left.pre.length, right.pre.length); index += 1) {
    if (left.pre[index] == null) return -1;
    if (right.pre[index] == null) return 1;
    const compared = compareIdentifier(left.pre[index], right.pre[index]);
    if (compared) return compared;
  }
  return 0;
}

function validatedRelease(record) {
  if (record.draft) throw new Error(`Draft release is not publishable: ${record.tag_name}`);
  const version = String(record.tag_name || "").replace(/^v/, "");
  const parsed = parseVersion(version);
  if (Boolean(record.prerelease) !== (parsed.pre.length > 0)) throw new Error(`Release channel metadata mismatch for ${version}`);
  if (record.html_url !== `${REPOSITORY}/releases/tag/v${version}`) throw new Error(`Release URL is not allowlisted for ${version}`);
  const evidence = record.evidence;
  if (!evidence || evidence.status !== "passed") throw new Error(`Passed release evidence is missing for ${version}`);
  if (evidence.version !== version || evidence.release_tag !== `v${version}`) throw new Error(`Evidence identity mismatch for ${version}`);
  const artifact = evidence.artifact;
  if (!artifact?.installer_name || !artifact?.sha256 || !artifact?.size_bytes) throw new Error(`Artifact evidence is incomplete for ${version}`);
  if (!/^[0-9a-f]{64}$/.test(artifact.sha256)) throw new Error(`Artifact SHA-256 is invalid for ${version}`);
  const asset = record.assets?.find((item) => item.name === artifact.installer_name);
  if (!asset || asset.size !== artifact.size_bytes) throw new Error(`Installer asset does not match evidence for ${version}`);
  const expectedDownloadPrefix = `${REPOSITORY}/releases/download/v${version}/`;
  if (!asset.browser_download_url.startsWith(expectedDownloadPrefix)) throw new Error(`Installer URL is not allowlisted for ${version}`);
  return {
    parsed,
    version,
    prerelease: parsed.pre.length > 0,
    published_at: record.published_at,
    summary: String(record.summary || `Rho ${version} is available.`).slice(0, 500),
    github_release_url: record.html_url,
    installer: { url: asset.browser_download_url, sha256: artifact.sha256, size: artifact.size_bytes },
  };
}

function manifest(release, channel) {
  return {
    schema_version: 1,
    channel,
    version: release.version,
    published_at: release.published_at,
    summary: release.summary,
    release_page_url: WEBSITE,
    github_release_url: release.github_release_url,
    artifacts: { windows_x86_64: release.installer },
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function releaseBlock(title, release) {
  if (!release) return `<section><h2>${title}</h2><p>Not available yet.</p></section>`;
  return `<section><h2>${title}</h2><p class="version">Rho ${escapeHtml(release.version)}</p><p>${escapeHtml(release.summary)}</p><p>Published ${escapeHtml(release.published_at.slice(0, 10))}</p><a class="download" href="${escapeHtml(release.installer.url)}">Download for Windows x64</a><details><summary>Verify download</summary><code>SHA-256 ${escapeHtml(release.installer.sha256)}</code></details></section>`;
}

function page(stable, development) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rho Downloads</title><style>body{margin:0;color:#203033;background:#f5f7f7;font:15px/1.55 system-ui,sans-serif}header,main,footer{max-width:760px;margin:auto;padding:28px 22px}header{padding-top:64px}h1{margin:0;font:700 42px Georgia,serif}header p{color:#526568}section{padding:24px 0;border-top:1px solid #cbd4d5}h2{font-size:18px}.version{font-size:24px;font-weight:700}.download{display:inline-block;padding:9px 13px;border-radius:5px;color:white;background:#167568;text-decoration:none}details{margin-top:16px;color:#526568}code{display:block;margin-top:8px;overflow-wrap:anywhere}footer{color:#657679;font-size:13px}a{color:#126b61}</style></head><body><header><h1>Rho</h1><p>An agent-native scientific workbench for R.</p></header><main>${releaseBlock("Stable", stable)}${releaseBlock("Development", development)}<p>Installers are currently hosted by GitHub Releases. In some networks the download may be unavailable even when this page is reachable.</p></main><footer><a href="${REPOSITORY}">Source repository</a> · Rho installers are not yet code signed.</footer></body></html>`;
}

export function generate(records, outputDirectory) {
  const releases = records.map(validatedRelease).sort((left, right) => compareVersions(right.parsed, left.parsed));
  const stable = releases.find((release) => !release.prerelease) || null;
  const development = releases[0] || null;
  if (!development) throw new Error("At least one validated release is required");
  const root = outputDirectory;
  fs.mkdirSync(path.join(root, "updates"), { recursive: true });
  fs.writeFileSync(path.join(root, "index.html"), page(stable, development));
  fs.writeFileSync(path.join(root, "updates", "development.json"), `${JSON.stringify(manifest(development, "development"), null, 2)}\n`);
  if (stable) fs.writeFileSync(path.join(root, "updates", "stable.json"), `${JSON.stringify(manifest(stable, "stable"), null, 2)}\n`);
  return { stable: stable?.version || null, development: development.version };
}

function selfTest() {
  const temp = fs.mkdtempSync(path.join(process.env.TEMP || process.cwd(), "rho-update-site-"));
  const make = (version, prerelease = true) => ({
    tag_name: `v${version}`, draft: false, prerelease, published_at: "2026-07-25T00:00:00Z",
    html_url: `${REPOSITORY}/releases/tag/v${version}`, summary: `Release ${version}`,
    assets: [{ name: `Rho_${version}_x64-setup.exe`, size: 100, browser_download_url: `${REPOSITORY}/releases/download/v${version}/Rho_${version}_x64-setup.exe` }],
    evidence: { status: "passed", version, release_tag: `v${version}`, artifact: { installer_name: `Rho_${version}_x64-setup.exe`, size_bytes: 100, sha256: "a".repeat(64) } },
  });
  const result = generate([make("0.2.0-dev.9"), make("0.2.0-dev.12")], temp);
  if (result.development !== "0.2.0-dev.12") throw new Error("Prerelease ordering failed");
  const promoted = generate([make("0.2.0-dev.12"), make("0.2.0", false)], temp);
  if (promoted.stable !== "0.2.0" || promoted.development !== "0.2.0") throw new Error("Stable promotion failed");
  let rejected = false;
  try { generate([{ ...make("0.3.0"), draft: true }], temp); } catch { rejected = true; }
  if (!rejected) throw new Error("Draft release was not rejected");
  fs.rmSync(temp, { recursive: true, force: true });
  process.stdout.write("Rho update site generator tests passed.\n");
}

const args = parseArgs(process.argv.slice(2));
if (args.test === "true") selfTest();
else if (args.input && args.output) {
  const result = generate(JSON.parse(fs.readFileSync(args.input, "utf8")), args.output);
  process.stdout.write(`${JSON.stringify(result)}\n`);
} else {
  throw new Error("Usage: node scripts/generate-update-site.mjs --input releases.json --output site, or --test true");
}

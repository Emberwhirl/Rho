import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tauriRoot = path.join(repositoryRoot, "desktop", "src-tauri");

async function readJson(name) {
  return JSON.parse(await readFile(path.join(tauriRoot, name), "utf8"));
}

const base = await readJson("tauri.conf.json");
const windows = await readJson("tauri.windows.conf.json");
const macos = await readJson("tauri.macos.conf.json");

for (const key of ["targets", "resources", "icon", "windows", "macOS"]) {
  assert.equal(base.bundle[key], undefined, `base bundle must not own ${key}`);
}

assert.deepEqual(windows.bundle.targets, ["nsis"]);
assert.equal(
  windows.bundle.resources["../resources/WebView2Loader.dll"],
  "WebView2Loader.dll",
);
assert.equal(
  windows.bundle.resources["../resources/runtime/"],
  "resources/runtime/",
);
assert.ok(windows.bundle.icon.includes("icons/icon.ico"));

assert.deepEqual(macos.bundle.targets, ["app", "dmg"]);
assert.ok(macos.bundle.icon.includes("icons/icon.icns"));
assert.equal(macos.bundle.macOS.minimumSystemVersion, "14.0");
assert.equal(macos.bundle.macOS.hardenedRuntime, true);
assert.equal(macos.bundle.macOS.entitlements, "Entitlements.plist");

const entitlements = await readFile(path.join(tauriRoot, "Entitlements.plist"), "utf8");
assert.match(entitlements, /<dict\s*\/>/);
assert.doesNotMatch(entitlements, /com\.apple\.security\.app-sandbox/);

for (const name of ["32x32.png", "128x128.png", "128x128@2x.png", "icon-512.png"]) {
  const image = await readFile(path.join(tauriRoot, "icons", name));
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG", `${name} must be PNG`);
  assert.equal(image[25], 6, `${name} must use PNG RGBA color type`);
}

const icns = await readFile(path.join(tauriRoot, "icons", "icon.icns"));
assert.equal(icns.subarray(0, 4).toString("ascii"), "icns");

console.log("desktop platform configuration is valid");

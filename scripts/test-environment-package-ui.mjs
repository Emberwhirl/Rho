import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");

for (const id of [
  "environmentManagePackageButton",
  "packageManagementDialog",
  "packageManagementForm",
  "packageManagementOperation",
  "packageManagementName",
  "packageManagementPreview",
  "packageManagementError",
]) {
  assert.match(html, new RegExp(`id="${id}"`), `Missing package UI control ${id}`);
}

for (const id of ["reproducibilityHeading", "reproducibilityStatus", "viewInstalledPackages", "viewLockfilePackages", "packageInventoryDialog", "packageInventoryClose", "variablesHeading"]) {
  assert.match(html, new RegExp(`id="${id}"`), `Missing Environment hierarchy control ${id}`);
}

assert.match(html, /value="install_package"/);
assert.match(html, /value="update_package"/);
assert.match(html, /value="remove_package"/);
assert.match(html, /<details id="reproducibilitySection" class="environment-card reproducibility-card">/);
assert.match(html, /id="packageInventoryDialog" class="product-dialog hidden"/);
assert.match(html, /id="variablesHeading">Variables/);
assert.match(html, /class="environment-card environment-render-card"/);
assert.match(css, /\.environment-render-card\s*\{\s*display:\s*none/);
assert.match(css, /\.package-management-fields\s*\{/);
assert.match(css, /\.package-manage-action\s*\{/);
assert.match(css, /grid-template-columns:\s*minmax\(112px, 1fr\)[^;]*58px/);

assert.match(js, /function packageManagementInputValid/);
assert.match(js, /\^\[A-Za-z\]\[A-Za-z0-9\.\]\{0,127\}\$/);
assert.match(js, /function openPackageManagementDialog/);
assert.match(js, /function openPackageInventoryDialog/);
assert.match(js, /function closePackageInventoryDialog/);
assert.match(js, /state\.packageInventoryDialog\.open/);
assert.match(js, /function startEnvironmentOperationPolling/);
assert.match(js, /environmentOperationPollTimer/);
assert.match(js, /async function submitPackageManagement/);
assert.match(js, /package:\s*options\.package \?\? null/);
assert.match(js, /"environment\.package_install": "Install package"/);
assert.match(js, /"environment\.package_update": "Update package"/);
assert.match(js, /"environment\.package_remove": "Remove package"/);
assert.match(js, /missing_in_library:\s*\["install_package", "Install"\]/);
assert.match(js, /version_mismatch:\s*\["update_package", "Update"\]/);
assert.match(js, /missing_in_lockfile:\s*\["remove_package", "Remove"\]/);
assert.match(js, /scenario === "environment-package"/);
assert.match(js, /document_overflow:/);
assert.match(js, /partial library writes may exist/);

console.log("Environment package UI contract checks passed.");

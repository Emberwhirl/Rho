import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(repoRoot, "desktop", "node_modules", "monaco-editor", "min", "vs");
const targetDir = path.join(repoRoot, "desktop", "dist", "vendor", "monaco", "vs");
const licenseSource = path.join(repoRoot, "desktop", "node_modules", "monaco-editor", "LICENSE");
const licenseTarget = path.join(repoRoot, "desktop", "dist", "vendor", "monaco", "LICENSE");

if (!fs.existsSync(sourceDir)) {
  console.error(`Monaco source directory was not found: ${sourceDir}`);
  process.exit(1);
}
if (!fs.existsSync(licenseSource)) {
  console.error(`Monaco license was not found: ${licenseSource}`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
fs.copyFileSync(licenseSource, licenseTarget);

console.log(`Synced Monaco assets to ${targetDir}`);

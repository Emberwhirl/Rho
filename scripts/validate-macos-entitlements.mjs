import fs from "node:fs";
import { pathToFileURL } from "node:url";

export const MAX_MACOS_ENTITLEMENTS_BYTES = 4 * 1024;
export const REQUIRED_MACOS_ENTITLEMENT = "com.apple.security.cs.disable-library-validation";

function fail(message) {
  throw new Error(message);
}

export function validateMacosEntitlements(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("macOS entitlements must be a JSON object");
  }
  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== REQUIRED_MACOS_ENTITLEMENT) {
    fail(`macOS entitlements must contain only ${REQUIRED_MACOS_ENTITLEMENT}`);
  }
  if (value[REQUIRED_MACOS_ENTITLEMENT] !== true) {
    fail(`${REQUIRED_MACOS_ENTITLEMENT} must be true`);
  }
  return value;
}

export function validateMacosEntitlementsFile(filePath) {
  const stat = fs.lstatSync(filePath);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail("macOS entitlement evidence must be a regular file, not a symlink");
  }
  if (stat.size <= 0 || stat.size > MAX_MACOS_ENTITLEMENTS_BYTES) {
    fail(`macOS entitlement evidence exceeds ${MAX_MACOS_ENTITLEMENTS_BYTES} bytes or is empty`);
  }
  let value;
  try {
    value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`macOS entitlement evidence is not valid JSON: ${error.message}`);
  }
  return validateMacosEntitlements(value);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) fail("Usage: node scripts/validate-macos-entitlements.mjs <entitlements.json>");
  validateMacosEntitlementsFile(process.argv[2]);
  process.stdout.write("macOS entitlement evidence is valid.\n");
}

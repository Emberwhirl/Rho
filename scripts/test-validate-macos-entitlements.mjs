import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  MAX_MACOS_ENTITLEMENTS_BYTES,
  REQUIRED_MACOS_ENTITLEMENT,
  validateMacosEntitlements,
  validateMacosEntitlementsFile,
} from "./validate-macos-entitlements.mjs";

function expectFailure(action, pattern) {
  assert.throws(action, pattern);
}

const valid = { [REQUIRED_MACOS_ENTITLEMENT]: true };
assert.deepEqual(validateMacosEntitlements(valid), valid);
expectFailure(() => validateMacosEntitlements(null), /JSON object/);
expectFailure(() => validateMacosEntitlements([]), /JSON object/);
expectFailure(() => validateMacosEntitlements({}), /must contain only/);
expectFailure(
  () => validateMacosEntitlements({ [REQUIRED_MACOS_ENTITLEMENT]: false }),
  /must be true/,
);
expectFailure(
  () => validateMacosEntitlements({ [REQUIRED_MACOS_ENTITLEMENT]: true, "com.apple.security.cs.allow-jit": true }),
  /must contain only/,
);

const root = fs.mkdtempSync(path.join(os.tmpdir(), "rho-entitlements-"));
try {
  const validPath = path.join(root, "valid.json");
  fs.writeFileSync(validPath, `${JSON.stringify(valid)}\n`);
  assert.deepEqual(validateMacosEntitlementsFile(validPath), valid);

  const malformedPath = path.join(root, "malformed.json");
  fs.writeFileSync(malformedPath, "{broken");
  expectFailure(() => validateMacosEntitlementsFile(malformedPath), /not valid JSON/);

  const oversizedPath = path.join(root, "oversized.json");
  fs.writeFileSync(oversizedPath, "x".repeat(MAX_MACOS_ENTITLEMENTS_BYTES + 1));
  expectFailure(() => validateMacosEntitlementsFile(oversizedPath), /exceeds/);

  const symlinkPath = path.join(root, "linked.json");
  try {
    fs.symlinkSync(validPath, symlinkPath, "file");
    expectFailure(() => validateMacosEntitlementsFile(symlinkPath), /not a symlink/);
  } catch (error) {
    if (process.platform !== "win32" || !["EPERM", "EACCES"].includes(error.code)) throw error;
  }
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("macOS entitlement validation tests passed.");

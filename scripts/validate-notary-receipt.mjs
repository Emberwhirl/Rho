import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_NOTARY_RECEIPT_BYTES = 64 * 1024;

const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateNotaryReceiptText(text) {
  const size = Buffer.byteLength(text, "utf8");
  if (size > MAX_NOTARY_RECEIPT_BYTES) {
    throw new Error(`Notary receipt exceeds ${MAX_NOTARY_RECEIPT_BYTES} bytes`);
  }

  let receipt;
  try {
    receipt = JSON.parse(text);
  } catch {
    throw new Error("Notary receipt is not valid JSON");
  }
  if (receipt === null || Array.isArray(receipt) || typeof receipt !== "object") {
    throw new Error("Notary receipt must be a JSON object");
  }
  if (typeof receipt.id !== "string" || !submissionIdPattern.test(receipt.id)) {
    throw new Error("Notary receipt must contain a UUID submission id");
  }
  if (receipt.status !== "Accepted") {
    throw new Error(`Notary submission ${receipt.id} was not Accepted`);
  }

  return { id: receipt.id, status: receipt.status };
}

export function validateNotaryReceiptFile(receiptPath) {
  const stat = fs.statSync(receiptPath);
  if (!stat.isFile()) throw new Error("Notary receipt path must be a regular file");
  if (stat.size > MAX_NOTARY_RECEIPT_BYTES) {
    throw new Error(`Notary receipt exceeds ${MAX_NOTARY_RECEIPT_BYTES} bytes`);
  }
  return validateNotaryReceiptText(fs.readFileSync(receiptPath, "utf8"));
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    if (process.argv.length !== 3) {
      throw new Error("Usage: node scripts/validate-notary-receipt.mjs <receipt.json>");
    }
    const receipt = validateNotaryReceiptFile(process.argv[2]);
    process.stdout.write(`Accepted DMG notarization submission ${receipt.id}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

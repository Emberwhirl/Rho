import assert from "node:assert/strict";

import {
  MAX_NOTARY_RECEIPT_BYTES,
  validateNotaryReceiptText,
} from "./validate-notary-receipt.mjs";

const accepted = JSON.stringify({
  id: "cda1ed1c-71d0-461f-9e19-3ac0b5c8c030",
  status: "Accepted",
  message: "Processing complete",
});

assert.deepEqual(validateNotaryReceiptText(accepted), {
  id: "cda1ed1c-71d0-461f-9e19-3ac0b5c8c030",
  status: "Accepted",
});
assert.throws(() => validateNotaryReceiptText("{"), /not valid JSON/);
assert.throws(() => validateNotaryReceiptText("[]"), /must be a JSON object/);
assert.throws(
  () => validateNotaryReceiptText(JSON.stringify({ status: "Accepted" })),
  /UUID submission id/,
);
assert.throws(
  () => validateNotaryReceiptText(JSON.stringify({ id: "not-a-uuid", status: "Accepted" })),
  /UUID submission id/,
);
assert.throws(
  () => validateNotaryReceiptText(JSON.stringify({
    id: "cda1ed1c-71d0-461f-9e19-3ac0b5c8c030",
    status: "Invalid",
  })),
  /was not Accepted/,
);
assert.throws(
  () => validateNotaryReceiptText("x".repeat(MAX_NOTARY_RECEIPT_BYTES + 1)),
  /exceeds 65536 bytes/,
);

process.stdout.write("Notary receipt validation tests passed.\n");

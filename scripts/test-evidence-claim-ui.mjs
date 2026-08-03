import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");

assert.match(html, /data-evidence-tab="entries"/);
assert.match(html, /data-evidence-tab="claims"/);
assert.match(html, /id="evidenceClaimForm"/);
assert.match(html, /data-claim-anchor="source_range"/);
assert.match(html, /data-claim-anchor="artifact"/);
assert.match(js, /invoke\("create_evidence_claim", \{ request:/);
assert.match(js, /invoke\("list_evidence_claims", \{ limit: 100 \}\)/);
assert.match(js, /invoke\("review_evidence_claim", \{ claimId:/);
assert.match(js, /invoke\("delete_evidence_claim", \{ claimId:/);
assert.match(js, /confirmAction\(\{ title: "Delete claim\?"/);
assert.match(js, /scenario === "evidence-claims"/);
assert.match(js, /cross_project_rejected/);
assert.match(js, /unresolved_source/);
assert.match(js, /missing_evidence/);
assert.match(js, /incomplete_evidence/);
assert.match(js, /Structural review only/);
assert.match(js, /start_column: null/);
assert.match(js, /end_column: null/);
assert.match(js, /claim\.end_column \?\? model\?\.getLineMaxColumn\(endLine\)/);
assert.doesNotMatch(js.slice(js.indexOf("function initEvidencePanel()"), js.indexOf("//", js.indexOf("function initEvidencePanel()") + 50)), /\bconfirm\(/);

console.log("Evidence claim UI contract checks passed.");

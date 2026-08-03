import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");

assert.match(html, /id="agentHelpContextBadge"[^>]+hidden/);
assert.match(html, /id="agentHelpContextRemove"[^>]+aria-label="Remove Local Help context"/);
assert.match(js, /kind: "rho\.local_help_context\.v1"/);
assert.match(js, /function normalizedAgentLocalHelpContext\(\)/);
assert.match(js, /function attachLocalHelpToAgent\(\)/);
assert.match(js, /Ask Rho with this Help/);
assert.match(js, /local_help: state\.agentLocalHelpContext/);
assert.match(js, /function localHelpContextFromTurn\(detail\)/);
assert.match(js, /kind !== "rho\.local_help_context\.v1"/);
assert.match(js, /context\.project_root !== state\.project\.root/);
assert.match(js, /function appendAgentLocalHelpEvidence\(container, detail\)/);
assert.match(js, /Open Help/);
assert.match(js, /scenario === "agent-help-link"/);
assert.match(js, /helpState === "model-only"/);
assert.match(js, /helpState === "mismatch"/);
assert.match(js, /state\.agentLocalHelpContext = null/);
assert.match(css, /\.agent-help-evidence[^}]+overflow: hidden/);
assert.match(css, /\.agent-help-context-badge[^}]+text-overflow: ellipsis/);

const evidenceStart = js.indexOf("function appendAgentLocalHelpEvidence");
const evidenceEnd = js.indexOf("\nfunction selectedFileEditProposal", evidenceStart);
assert.ok(evidenceStart >= 0 && evidenceEnd > evidenceStart);
assert.doesNotMatch(js.slice(evidenceStart, evidenceEnd), /innerHTML/);

console.log("Agent Local Help link UI contract checks passed.");

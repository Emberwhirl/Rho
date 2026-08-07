import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const html = read("desktop", "dist", "index.html");
const css = read("desktop", "dist", "styles.css");
const js = read("desktop", "dist", "app.js");

assert.match(html, /id="auditProjectButton"[^>]+title="Check this project for reproducibility risks"[^>]+aria-label="Check project reproducibility"/);
assert.match(html, /<span>Check project<\/span>/);
assert.match(html, /<strong>Project check<\/strong>/);
assert.doesNotMatch(html, /id="auditScope"/);

for (const label of ["Checking", "No issues found", "Needs attention", "Check incomplete", "Not available", "Check failed"]) {
  assert.match(js, new RegExp(`label: "${label}"`), `Missing friendly audit status ${label}`);
}
for (const label of ["Results and evidence", "Project portability", "Randomness", "Package environment", "Run history", "Other checks"]) {
  assert.match(js, new RegExp(`"${label}"`), `Missing friendly audit category ${label}`);
}

const knownRules = [
  "evidence.run.env_snapshot_missing", "evidence.run.source_revision_missing",
  "evidence.artifact.producing_run_missing", "evidence.artifact.provenance_incomplete",
  "evidence.artifact.file_missing", "evidence.env.snapshot_incomplete",
  "evidence.env.lockfile_drift", "evidence.env.lockfile_missing",
  "portability.absolute_path.windows", "portability.absolute_path.posix",
  "portability.home_path.literal", "portability.setwd.literal",
  "randomness.rng_without_seed", "packages.not_recorded",
  "packages.installed_not_locked", "packages.locked_not_installed",
  "packages.version_drift", "runs.failed", "runs.cancelled", "runs.interrupted",
  "runs.artifact_incomplete_run",
];
for (const rule of knownRules) {
  assert.match(js, new RegExp(`"rho\\.repro\\.v1\\.${rule.replaceAll(".", "\\.")}"`), `Missing presentation for ${rule}`);
}

assert.match(js, /function auditFindingPresentation\(finding\)/);
assert.match(js, /async function openAuditSourceEvidence\(path, item\)/);
assert.match(js, /revealLineInCenter\(boundedLine\)/);
assert.match(js, /editor\.setSelectionRange\(offset, offset\)/);
assert.match(js, /openAuditSourceEvidence\(path, item\)/);
assert.match(js, /function openHumanProjectCheck\(\)/);
assert.match(js, /applyWorkbenchLayout\("analyze"\)/);
assert.match(js, /else openHumanProjectCheck\(\)/);
assert.match(js, /else switchContextTab\("environment"\)/);
assert.match(js, /const AUDIT_REQUEST_TIMEOUT_MS = 30_000/);
assert.match(js, /function dirtyAuditSourcePaths\(\)/);
assert.match(js, /documentIsDirty\(documentState\)/);
assert.match(js, /Save the modified source/);
assert.match(js, /function invokeAuditWithTimeout\(\)/);
assert.match(js, /invoke\("audit_reproducibility", \{ scope: "project_current" \}\)/);
assert.match(js, /Promise\.race\(\[[\s\S]*invoke\("audit_reproducibility"/);
assert.match(js, /\.finally\(\(\) => clearTimeout\(timeoutId\)\)/);
assert.match(js, /state\.auditRequestSequence/);
assert.match(js, /projectRoot !== state\.project\.root/);
assert.match(js, /\$\("#auditPanel"\)\.classList\.add\("hidden"\)/);
assert.match(js, /function appendAuditFindingGroups\(container, findings\)/);
assert.match(js, /error: \["Important", "failed"\]/);
assert.match(js, /warning: \["Review", "warning"\]/);
assert.match(js, /info: \["Note", "neutral"\]/);
assert.match(js, /appendAuditFindingGroups\(content, findings\)/);
assert.match(js, /appendAuditFindingGroups\(findingsContainer, findings\)/);
assert.match(js, /return run \? `Run: \$\{humanRunTitle\(run\)\}` : "Related run"/);
assert.match(js, /`Open \$\{path\}\$\{item\.line \? `:\$\{item\.line\}` : ""\}`/);
assert.match(js, /Some project information could not be reviewed\. This check is incomplete\./);
assert.match(js, /No issues were found in the reviewed project information\./);
assert.match(js, /result\.ui_message \|\| "The project check did not complete\."/);
assert.match(js, /r\.ui_message \|\| "The project check did not complete\."/);
assert.match(js, /function auditCountLabel\(value, singular, plural = `\$\{singular\}s`\)/);
assert.match(js, /auditCountLabel\(coverage\.artifacts_considered, "saved output"\)/);
assert.doesNotMatch(js, /path: "D:\/mock-project\/renv\.lock"/);

const agentAuditStart = js.indexOf("function renderAgentAuditWorkspace(content)");
const agentAuditEnd = js.indexOf("\nfunction renderAgentPlotWorkspace", agentAuditStart);
const humanAuditStart = js.indexOf("function renderAuditPanel()");
const humanAuditEnd = js.indexOf("\nfunction closeWorkbenchMenus", humanAuditStart);
for (const implementation of [js.slice(agentAuditStart, agentAuditEnd), js.slice(humanAuditStart, humanAuditEnd)]) {
  assert.doesNotMatch(implementation, /finding\.rule_id|f\.rule_id|rule_version|source_path|document_version|artifact_id|snapshot_id/);
  assert.doesNotMatch(implementation, /finding\.summary|f\.summary/);
}

assert.match(css, /\.audit-finding-card/);
assert.match(css, /#auditPanel \{ display: flex; flex-direction: column; min-height: 0; \}/);
assert.match(css, /\.audit-findings \{[^}]*min-height: 0;[^}]*overflow-y: auto/);
assert.match(css, /\.audit-finding-heading/);
assert.match(css, /\.audit-evidence-links/);
assert.match(css, /\.agent-review-workspace-content \{[^}]*overflow-y: scroll/);
assert.doesNotMatch(css, /\.finding-rule\s*\{/);
assert.match(css, /@media \(max-width: 960px\)[\s\S]*\.audit-button span \{ display: none; \}/);

console.log("Human-friendly project check UI contract checks passed.");

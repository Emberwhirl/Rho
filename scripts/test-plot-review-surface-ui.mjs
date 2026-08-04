import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const html = read("desktop", "dist", "index.html");
const css = read("desktop", "dist", "styles.css");
const js = read("desktop", "dist", "app.js");

assert.match(html, /class="plot-main"[\s\S]*class="plot-stage"[\s\S]*class="plot-navigator"/);
assert.match(html, /id="plotNavigatorCount"/);
assert.match(html, /<details id="artifactPanel" class="artifact-panel">/);
assert.doesNotMatch(html, /<details id="artifactPanel"[^>]*\sopen/);
assert.match(html, /<strong>Saved outputs<\/strong>/);
assert.match(html, /Exported plot, table, and report files/);
assert.match(html, /class="plot-manage-menu"[\s\S]*Free session previews[\s\S]*Delete project plots/);

assert.doesNotMatch(html, /id="(?:stateRevision|projectRevision|revisionBadge|approvalRequestId)"/);
assert.doesNotMatch(html, /id="(?:retentionSummaryCard|retentionPolicyList|artifactDetailMeta)"/);
assert.doesNotMatch(html, />Artifacts?</);

assert.match(js, /function plotSourceLabel\(plot\)/);
assert.match(js, /sourcePath === "<console>"\) return "Created from Console"/);
assert.match(js, /title\.textContent = `Plot \$\{index \+ 1\}`/);
assert.match(js, /className = "plot-history-thumbnail"/);
assert.match(js, /plotReviewState\(plot\)/);
assert.match(js, /\$\("#artifactPanel"\)\.open = false/);
assert.match(js, /\$\("#artifactPanel"\)\.open = true/);
assert.match(js, /previewParams\.get\("state"\) === "console-plots"/);

assert.doesNotMatch(js, /detail\.textContent = `[^`]*run \$\{run\.run_id\}/);
assert.doesNotMatch(js, /appendAgentReviewSection\([^\n]*"Run ID"/);
assert.doesNotMatch(js, /appendAgentReviewSection\([^\n]*"Revisions"/);
assert.doesNotMatch(js, /`payload \$\{formatBytes\(page\.payload_bytes/);
assert.doesNotMatch(js, /image\.alt = `Plot produced by run/);
assert.doesNotMatch(js, /Pruned \$\{result\?\.pruned_count[^\n]*reclaimed/);
assert.match(js, /const hiddenFields = new Set\(\["parent_run_id", "code_digest"\]\)/);
assert.match(js, /appendAgentReviewSection\(request, "Run scope", humanExecutionMode\(run\)\)/);
assert.doesNotMatch(js, /\$\("#approvalRevision"\)\.textContent = `captured/);
assert.match(js, /This request matches the current workspace/);

assert.match(css, /\.plot-main\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) clamp\(190px, 22%, 260px\)/);
assert.match(css, /\.plot-history-row\s*\{[^}]*grid-template-columns:\s*58px minmax\(0, 1fr\)/);
assert.match(css, /\.artifact-panel-summary/);
assert.match(css, /\.artifact-panel\[open\]/);
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.plot-main/);

console.log("Plot review surface UI contract checks passed.");

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");
const rust = fs.readFileSync(path.join(root, "crates", "rho-server", "src", "coordinator.rs"), "utf8");

assert.match(html, /data-agent-surface="direct"[^>]*>Task<\/button>[\s\S]*data-agent-surface="monitor"[^>]*>Runs<\/button>[\s\S]*data-agent-surface="outputs"[^>]*>Outputs[\s\S]*data-agent-surface="review"[^>]*>Review<\/button>/);
assert.match(html, /id="agentOutputsPanel"[^>]*aria-label="Agent outputs"/);
assert.match(html, /id="agentOutputsList"/);
assert.match(css, /\.agent-output-card\s*\{[^}]*grid-template-columns:\s*68px minmax\(0, 1fr\)/);
assert.match(css, /\.agent-review-plot-stage img\s*\{[^}]*object-fit:\s*contain/);
assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.agent-review-output-meta/);

assert.match(js, /agentSelectedOutput:\s*null/);
assert.match(js, /function renderAgentOutputs\(\)/);
assert.match(js, /async function openAgentOutput\(kind, id\)/);
assert.match(js, /function renderAgentPlotWorkspace\(content, plot\)/);
assert.match(js, /openAgentWorkSurface\("plot"\)/);
assert.match(js, /\["direct", "monitor", "outputs"\]\.includes\(name\)/);
assert.match(js, /\["file", "run", "plot", "artifact", "audit"\]\.includes\(state\.agentWorkSurface\)/);
assert.match(js, /returnToOutputs \? "outputs" : "direct"/);
assert.match(js, /No outputs yet\. Plots and saved results produced in this project will appear here\./);
assert.match(js, /Rho removed this preview to save space\. The Plot remains in history\./);
assert.match(js, /previewState === "outputs-empty"/);
assert.match(js, /previewState === "paths"/);
assert.match(js, /\["outputs", "outputs-plot", "outputs-pruned", "outputs-artifact"\]\.includes\(previewState\)/);
assert.match(js, /state\.agentSelectedOutput = null;[\s\S]*state\.selectedPlotId = null;/);

const displayPathMatch = js.match(/function displayPath\(value\) \{([\s\S]*?)\n\}/);
assert.ok(displayPathMatch, "displayPath must be centralized");
const displayPath = new Function("value", displayPathMatch[1]);
assert.equal(displayPath(String.raw`\\?\E:\Research\analysis.R`), String.raw`E:\Research\analysis.R`);
assert.equal(displayPath("//?/E:/Research/analysis.R"), "E:/Research/analysis.R");
assert.equal(displayPath(String.raw`\\?\UNC\server\share\analysis.R`), String.raw`\\server\share\analysis.R`);
assert.equal(displayPath("//?/UNC/server/share/analysis.R"), "//server/share/analysis.R");
assert.equal(displayPath("analysis.R"), "analysis.R");

assert.match(js, /if \(run\?\.origin === "system"\) return "Background workspace task"/);
assert.match(js, /Refreshing package inventory/);
assert.match(js, /Refreshing lockfile status/);
assert.match(js, /Refreshing project environment/);
assert.doesNotMatch(js, /meta\.textContent = \[prettyOrigin\(run\.origin\), run\.source_path/);
assert.doesNotMatch(js, /appendAgentReviewSection\(request, "Source", run\.source_path/);
assert.doesNotMatch(js, /appendLocalHelpLocation\(content, "Package root"|appendLocalHelpLocation\(content, "Library root"/);
assert.match(js, /appendLocalHelpLocation\(content, "Source reference", record\.source_path \? `\$\{displayPath\(record\.source_path\)\}/);

assert.match(rust, /Ask mode is read-only[\s\S]*Never call run_r\./);
assert.match(rust, /Plan mode is read-only[\s\S]*Never call run_r\./);
assert.match(rust, /Act mode completes explicitly requested executable work in this turn\./);
assert.match(rust, /call run_r; do not merely provide code or ask whether to run it\./);
assert.match(rust, /never claim execution without a successful tool result/);
assert.match(rust, /Explanation-only requests do not require execution\./);

console.log("Agent execution and output review contract checks passed.");

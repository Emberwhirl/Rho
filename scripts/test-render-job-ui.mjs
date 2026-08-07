import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const html = read("desktop", "dist", "index.html");
const css = read("desktop", "dist", "styles.css");
const js = read("desktop", "dist", "app.js");
const rust = read("desktop", "src-tauri", "src", "main.rs");

assert.match(html, /id="renderJobStatus"[\s\S]*id="renderCancelButton"/);
assert.match(html, /id="renderResultCard"[\s\S]*id="renderReviewArtifactButton"/);
assert.match(css, /\.render-cancel-button\s*\{/);
assert.match(css, /\.topbar:has\(#renderJobStatus:not\(\.hidden\)\)[\s\S]*\.audit-button \{ display: none; \}/);
assert.match(js, /let _activeRenderJobId = null/);
assert.match(js, /invoke\("cancel_render_job", \{ job_id: jobId \}\)/);
assert.match(js, /job\.status === "interrupted"/);
assert.match(js, /phase: "interrupted"/);
assert.match(js, /Render status is unavailable/);
assert.doesNotMatch(js, /!job \|\| job\.status === "completed"/);
assert.match(js, /const mockRenderJobs = new Map\(\)/);
assert.match(js, /if \(command === "cancel_render_job"\)/);
assert.match(js, /if \(command === "restart_workspace"\)[\s\S]*job\.status = "interrupted"/);
assert.match(js, /runId: job\.job_id[\s\S]*artifactKind: "render_output"/);
assert.match(js, /job\.artifact_id = artifact\.artifact_id/);
assert.match(js, /invoke\("get_artifact_record", \{ artifactId: job\.artifact_id \}\)/);
assert.match(js, /artifactAvailable: Boolean\(artifactDetail\?\.artifact\)/);
assert.match(js, /renderReviewArtifactButton[\s\S]*switchDockTab\("plots"\)/);
assert.match(js, /const artifactId = state\.lastRender\?\.artifactId[\s\S]*get_artifact_record[\s\S]*artifactId/);

assert.match(rust, /async fn cancel_render_job/);
assert.match(rust, /dispatch_workspace_request_with_execution_id/);
assert.match(rust, /Some\(&job_id\)/);
assert.match(rust, /\.filter\(\|job\| job\.project_root == project_root\)/);
assert.match(rust, /reconcile_render_job\(/);
assert.match(rust, /workspace_restart_before_start/);
assert.match(rust, /artifact_id: Option<String>/);
assert.match(rust, /get_artifact_record_for_run/);

console.log("Render job cancellation/reconciliation UI contract checks passed.");

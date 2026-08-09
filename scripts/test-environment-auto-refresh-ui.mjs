import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const js = read("desktop", "dist", "app.js");
const contract = read("docs", "plans", "active-2026-08-03-ws3-broker-data-query-spec.md");

assert.match(contract, /WS3-Q1-R1 Installed Data View Refresh Correction/);
assert.match(contract, /force-reinspects that same object/);
assert.match(contract, /monotonic request generations plus the[\s\S]*captured active project root/);

assert.match(js, /function workspaceViewerIdentityChanged\(before, after\)/);
assert.match(js, /function viewerProjectRequestIsCurrent\(projectRoot, projectRefreshSequence\)/);
assert.match(js, /function clearEnvironmentObjectSelection\(/);
assert.match(js, /inspectionRequestId: 0/);
assert.match(js, /environmentRefreshRequestId: 0/);
assert.match(js, /const refreshRequestId = \+\+state\.environmentRefreshRequestId/);
assert.match(js, /workspaceViewerIdentityChanged\(selectedWorkspace, response\.workspace\)/);
assert.match(js, /inspectEnvironmentObject\(selectedName, \{[\s\S]*?force: true,[\s\S]*?preserveViewerState: true/);
assert.match(js, /selectedStillExists[\s\S]*?clearEnvironmentObjectSelection\(\)/);

assert.match(js, /const requestIsCurrent = \(\) => pageRequestId === state\.dataViewer\.pageRequestId[\s\S]*?viewerProjectRequestIsCurrent/);
assert.match(js, /const requestIsCurrent = \(\) => inspectionRequestId === state\.dataViewer\.inspectionRequestId[\s\S]*?state\.selectedObjectName === name/);
assert.match(js, /boundedViewerOffset\([\s\S]*?page\.total_rows/);
assert.match(js, /recoverIncompatibleSort/);
assert.match(js, /state\.dataViewer\.viewKind = view\.kind/);
assert.match(js, /Promise\.all\(\[loadRunData\(\), refreshEnvironment\(\)\]\)/);
assert.match(js, /async function hydrateProject\(response\) \{[\s\S]*?clearEnvironmentObjectSelection\(\)/);

assert.match(js, /async function runDataViewerRefreshMockProbe\(\)/);
for (const evidence of [
  "token_changed",
  "revision_advanced",
  "query_preserved",
  "sort_preserved",
  "window_preserved",
  "no_stale_error",
  "disappeared_object_cleared",
  "foreign_project_response_ignored",
]) {
  assert.ok(js.includes(evidence), `${evidence} preview evidence must exist`);
}
assert.match(js, /previewParams\.get\("state"\) === "refresh-probe"/);
assert.match(js, /refresh_probe: state\.dataViewerRefreshPreviewProbe/);

console.log("Environment selected-object auto-refresh UI contract checks passed.");

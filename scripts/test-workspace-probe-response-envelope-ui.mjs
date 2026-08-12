import fs from "node:fs";
import assert from "node:assert/strict";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const helperStart = js.indexOf("function workspaceProbeRecordFromResponse");
const helperEnd = js.indexOf("\nasync function buildRenameRefactorProposal", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart);

const helperSource = js.slice(helperStart, helperEnd);
const workspaceProbeRecordFromResponse = new Function(
  `${helperSource}; return workspaceProbeRecordFromResponse;`,
)();

const direct = { name: "target", references: [{ file: "analysis.R" }] };
const enveloped = {
  execution_id: "execution_1",
  execution: direct,
  events: [],
  workspace: { kernel_instance_id: "workspace_1", state_revision: 4 },
};

assert.equal(workspaceProbeRecordFromResponse(direct), direct);
assert.equal(workspaceProbeRecordFromResponse(enveloped), direct);
assert.equal(workspaceProbeRecordFromResponse(null), null);
assert.deepEqual(workspaceProbeRecordFromResponse({ execution: [] }), { execution: [] });

const renameStart = js.indexOf("async function buildRenameRefactorProposal");
const renameEnd = js.indexOf("\nfunction buildExtractReplacement", renameStart);
const renameSource = js.slice(renameStart, renameEnd);
assert.match(renameSource, /workspaceProbeRecordFromResponse\([\s\S]+editor_find_project_references/);
assert.match(js, /const result = workspaceProbeRecordFromResponse\(await invoke\("editor_goto_definition"/);
assert.match(js, /const record = workspaceProbeRecordFromResponse\([\s\S]+editor_find_project_references/);
assert.match(js, /const result = workspaceProbeRecordFromResponse\([\s\S]+editor_package_functions/);
assert.match(js, /const help = workspaceProbeRecordFromResponse\([\s\S]+editor_function_help/);
assert.match(js, /state\.chunks = workspaceProbeRecordFromResponse\([\s\S]+editor_discover_chunks/);
assert.match(js, /const result = workspaceProbeRecordFromResponse\([\s\S]+editor_lint_file/);
assert.match(js, /function helpRecordFromResponse\(response\) \{\s+return workspaceProbeRecordFromResponse\(response\);/);

for (const mockId of [
  "mock_editor_references",
  "mock_editor_definition",
  "mock_editor_package_functions",
  "mock_editor_function_help",
  "mock_editor_function_documentation",
  "mock_editor_discover_chunks",
  "mock_editor_lint_file",
]) {
  assert.match(js, new RegExp(`mockWorkspaceResponse\\(\\s*"${mockId}"`));
}

console.log("Workspace probe response-envelope UI checks passed.");

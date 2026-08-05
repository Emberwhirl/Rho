import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(js, /function userFacingError\(error, fallback/);
assert.match(js, /function reportUiFailure\(context, error, fallback\)/);
assert.match(js, /function userFacingStatus\(status, labels, fallback/);
for (const message of [
  "The underlying information changed. Refresh it and try again.",
  "The requested information is no longer available.",
  "This action is not allowed in the current project state.",
  "Rho could not reach the required service.",
  "The action was stopped.",
]) assert.ok(js.includes(message), `Missing friendly error projection: ${message}`);

for (const context of [
  "load run history",
  "load project guidance",
  "load Agent history",
  "respond to Agent approval",
  "stop R run",
  "compare runs",
  "load environment operations",
  "preview environment operation",
  "respond to environment operation",
]) assert.ok(js.includes(`reportUiFailure("${context}"`), `Missing projection boundary for ${context}`);

for (const rawProjection of [
  "Run history is unavailable: ${error}",
  "Project skills are unavailable: ${error}",
  "Agent history is unavailable: ${error}",
  "Environment operations are unavailable: ${error}",
]) assert.ok(!js.includes(rawProjection), `Raw backend error remains visible: ${rawProjection}`);

const timelineStart = js.indexOf("function renderAgentTimeline()");
const timelineEnd = js.indexOf("\nfunction renderTaskRail", timelineStart);
const timeline = js.slice(timelineStart, timelineEnd);
assert.match(timeline, /agentModelDisplayName\(turn\.model\)/);
assert.doesNotMatch(timeline, /event\.request_id|meta\.push\(event\.request_id\)/);
assert.doesNotMatch(timeline, /aisdk|Ark session|broker policy/);
assert.match(js, /const code = approval\.code \|\| argumentsObject\.code \|\| ""/);
assert.doesNotMatch(js, /approval\.code \|\| argumentsObject\.code \|\| approval\.arguments_json/);
assert.doesNotMatch(js, /Ark PID/);
assert.doesNotMatch(js, /id="startupDetails"|id="startupTechnicalDetail"|id="startupLogPath"/);
assert.match(js, /\["R session", runtime\.r_version/);
assert.doesNotMatch(js.slice(js.indexOf("async function openAboutDialog()"), js.indexOf("\nfunction updateFailureMessage")), /info\.commit|runtime\.rscript|aisdk/);

const projectSkills = js.slice(js.indexOf("function renderProjectSkills()"), js.indexOf("\nasync function loadProjectSkills"));
assert.doesNotMatch(projectSkills, /skill\.id|instructions_path|references\.join|discovery_error}`/);
assert.match(projectSkills, /Provided by this project/);

const installedHelp = js.slice(js.indexOf("function renderInstalledHelp("), js.indexOf("\nfunction renderLocalHelp"));
assert.doesNotMatch(installedHelp, /state\.installedHelp\.status;/);
assert.doesNotMatch(installedHelp, /record\.notices.*join|bounded response/);

const localHelp = js.slice(js.indexOf("function renderLocalHelp()"), js.indexOf("\nasync function showLocalHelp"));
assert.doesNotMatch(localHelp, /Package root|Library root|transport limit/);

const projectReferences = js.slice(js.indexOf("function renderProjectReferences()"), js.indexOf("\nasync function showProjectReferences"));
assert.doesNotMatch(projectReferences, /state\.projectReferences\.status;|record\.notices.*join|bounded scan/);

const environmentSummary = js.slice(js.indexOf("function renderEnvironmentSummary()"), js.indexOf("\nfunction renderLastRenderCard"));
assert.doesNotMatch(environmentSummary, /`renv \$\{renvStatus\}`/);
assert.match(environmentSummary, /Package versions are not recorded/);

const packageList = js.slice(js.indexOf("function renderPackageList()"), js.indexOf("\nfunction abbreviateLibrary"));
assert.doesNotMatch(packageList, /name\.title = pkg\.library|incomplete_reasons\.join|dependencyRoles\.error \|\| dependencyRoles\.state/);

const environmentOperation = js.slice(js.indexOf("function formatEnvironmentOperationSummary("), js.indexOf("\nfunction closeEnvironmentOperationDialog"));
assert.doesNotMatch(environmentOperation, /bounded drift|broker to mutate|Project library: \$\{args\.project_library\}|Project library: \$\{preview\.project_library/);
assert.doesNotMatch(environmentOperation, /reason = request\.reason \? `[^`]*\$\{request\.reason\}/);

const dataViewer = js.slice(js.indexOf("function renderDataViewer()"), js.indexOf("\nfunction dataViewerDelimitedText"));
assert.doesNotMatch(dataViewer, /bounded page|bounded viewer/);
assert.match(dataViewer, /The source changed; refresh this object before continuing/);

const evidenceClaims = js.slice(js.indexOf("function renderEvidenceClaims()"), js.indexOf("\nfunction switchEvidenceTab"));
assert.doesNotMatch(evidenceClaims, /`\$\{claim\.kind\}/);
assert.match(js, /function claimKindLabel\(kind\)/);
assert.match(js, /function claimLimitationLabel\(limitation\)/);
assert.doesNotMatch(evidenceClaims, /note\.textContent = limitation/);
assert.match(js, /reportUiFailure\("create evidence claim"/);

const compare = js.slice(js.indexOf("function renderCompareResult()"), js.indexOf("\nfunction addProblem"));
assert.match(compare, /filter\(\(item\) => fieldLabels\[item\.field\]/);
assert.doesNotMatch(compare, /fieldLabels\[field\.field\] \|\| "Detail"/);

const agentRunReview = js.slice(js.indexOf("function renderAgentRunReview("), js.indexOf("\nfunction renderAgentReview"));
assert.match(agentRunReview, /document\.createElement\("details"\)/);
assert.doesNotMatch(agentRunReview, /appendAgentReviewSection\(outcome, "Traceback"/);

console.log("Human-facing information projection contract checks passed.");

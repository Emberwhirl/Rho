import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");
const html = read("desktop", "dist", "index.html");
const css = read("desktop", "dist", "styles.css");
const js = read("desktop", "dist", "app.js");
const backend = read("desktop", "src-tauri", "src", "agent_llm.rs");
const main = read("desktop", "src-tauri", "src", "main.rs");
const coordinator = read("crates", "rho-server", "src", "coordinator.rs");
const adapter = read("r", "rho.agent", "R", "aisdk_adapter.R");
const contract = read("docs", "plans", "active-2026-08-05-system-credential-and-simple-llm-settings-spec.md");

assert.ok(
  js.indexOf("const AGENT_MODEL_CAPABILITIES") < js.indexOf("let mockAgentLlmSettings = defaultMockAgentLlmSettingsView()"),
  "mock settings must initialize only after the capability vocabulary is available",
);

function sliceBetween(source, start, end, label) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `${label} must exist and be bounded`);
  return source.slice(from, to);
}

const dialog = sliceBetween(html, '<div id="agentLlmDialog"', '<div id="agentLlmProviderWizard"', "Model settings dialog");
for (const id of [
  "agentLlmRoutingTab",
  "agentLlmConnectionsTab",
  "agentLlmLibraryTab",
  "agentLlmRoutingPanel",
  "agentLlmRouteList",
  "agentLlmRoutingRevision",
  "agentLlmCustomRoute",
  "agentLlmCustomRouteName",
  "agentLlmCustomRouteType",
  "agentLlmCustomRouteRequired",
  "agentLlmCustomRouteModel",
  "agentLlmLibraryPanel",
  "agentLlmLibraryList",
]) assert.ok(dialog.includes(`id="${id}"`), `${id} must be present`);
for (const id of [
  "agentLlmWizardModelImageOutput",
  "agentLlmWizardModelImageEdit",
  "agentLlmWizardModelAudioInput",
  "agentLlmWizardModelAudioOutput",
  "agentLlmWizardModelStructuredOutput",
  "agentLlmWizardModelWebSearch",
]) assert.ok(html.includes(`id="${id}"`), `${id} must be present`);
assert.match(dialog, /role="tablist"/);
assert.match(dialog, /data-agent-llm-view="routing"/);
assert.match(dialog, /data-agent-llm-view="connections"/);
assert.match(dialog, /data-agent-llm-view="library"/);
assert.ok(dialog.indexOf('id="agentLlmShell"') < dialog.indexOf('id="agentLlmRoutingPanel"'), "Connections must be the primary surface before routing");
assert.match(dialog, /<button(?=[^>]*data-agent-llm-view="connections")(?=[^>]*aria-selected="true")[^>]*>/);
assert.match(dialog, /Consumer not installed/);

for (const selector of [
  ".agent-llm-tabs",
  ".agent-llm-route-card",
  ".agent-llm-library-card",
  ".agent-llm-custom-route-fields",
]) assert.ok(css.includes(selector), `${selector} styles must exist`);
assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.agent-llm-route-card\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);

for (const name of [
  "agentModelCapability",
  "agentModelType",
  "agentRouteCompatibility",
  "switchAgentLlmView",
  "routeModelOptions",
  "persistAgentCapabilityRoute",
  "removeAgentCapabilityRoute",
  "renderAgentLlmRouting",
  "renderAgentLlmLibrary",
  "saveAgentLlmCustomRoute",
]) assert.match(js, new RegExp(`(?:async )?function ${name}\\b`), `${name} must exist`);
for (const route of [
  "agent.chat",
  "agent.act",
  "vision.inspect",
  "image.generate",
  "image.edit",
  "embedding.default",
]) assert.ok(js.includes(`"${route}"`), `${route} must be represented`);
assert.match(js, /expectedRevision:\s*settings\.revision/);
assert.match(js, /agent_llm_save_capability_route/);
assert.match(js, /agent_llm_delete_capability_route/);
assert.match(js, /agent_llm_declare_model_capabilities/);
assert.match(js, /Model settings changed in another window/);
assert.match(js, /compatibility !== "compatible"/);
assert.match(js, /agentRouteCompatibility\(model, routeContract\)/);
assert.match(js, /\^\[a-z\]\[a-z0-9\._-\]\{0,79\}\$/);
assert.match(js, /Connection probes are available only for language models/);
assert.match(js, /Per-turn model overrides are unavailable/);
for (const capability of ["image_output", "image_edit", "audio_input", "audio_output", "structured_output", "web_search"]) {
  assert.ok(js.includes(`wizardCapability("${capability}"`), `${capability} evidence must survive the provider wizard`);
}
assert.match(js, /Consumer not installed/);
assert.doesNotMatch(
  sliceBetween(js, "async function sendAgentPrompt()", "\nfunction switchDockTab", "Agent send path"),
  /modelId:\s*selectedModelId/,
  "turn submission must let Rust resolve the named route",
);

assert.match(backend, /const SETTINGS_SCHEMA_VERSION:\s*u32\s*=\s*2/);
assert.match(backend, /const MAX_SETTINGS_BYTES:\s*usize\s*=\s*256 \* 1024/);
assert.match(backend, /SETTINGS_V1_BACKUP_FILE_NAME/);
assert.match(backend, /pub revision:\s*u64/);
assert.match(backend, /pub capability_routes:\s*Vec<AgentCapabilityRoute>/);
assert.match(backend, /fn migrate_settings_v1\b/);
assert.match(backend, /fn save_settings_with\b/);
assert.match(backend, /pub fn save_capability_route\b/);
assert.match(backend, /pub fn delete_capability_route\b/);
assert.match(backend, /pub fn declare_model_capabilities\b/);
assert.match(backend, /settings\.revision == expected_revision/);
assert.match(backend, /Reassign or remove this model's capability routes before deleting it/);
assert.match(backend, /resolve_model_and_credential_for_turn/);
assert.match(backend, /mode == "act"[\s\S]*"agent\.act"/);
assert.match(backend, /Only language models use the text connection test/);
assert.match(backend, /enrich_discovered_models/);
assert.match(backend, /"aisdk_catalog" \| "provider_response" \| "user_declared" \| "unknown"/);

for (const command of [
  "agent_llm_save_capability_route",
  "agent_llm_delete_capability_route",
  "agent_llm_declare_model_capabilities",
]) {
  assert.match(main, new RegExp(`async fn ${command}\\b`));
  assert.ok(main.includes(`${command},`), `${command} must be registered`);
}
assert.match(main, /resolve_model_and_credential_for_turn/);
assert.match(main, /"model_settings_revision"/);
assert.match(main, /"capability_route"/);

assert.match(coordinator, /pub struct AgentRuntimeCapabilityRoute/);
assert.match(coordinator, /pub capability_routes:\s*Vec<AgentRuntimeCapabilityRoute>/);
assert.match(coordinator, /rho_runtime_profile_capability_models\(profile, resolved_model\)/);
assert.match(adapter, /rho_runtime_profile_capability_models <- function/);
assert.match(adapter, /exactly one effective capability route/);
assert.match(adapter, /capability_models = list\(\)/);
assert.match(adapter, /metadata = list\([\s\S]*capability_models/);

assert.match(contract, /CRED-UX4A routing foundation was explicitly authorized/);
assert.match(contract, /CRED-UX4B isolated workers and CRED-UX4C media[\s\S]*remain unauthorized/);

console.log("Capability-routed Model settings V2 contract checks passed.");

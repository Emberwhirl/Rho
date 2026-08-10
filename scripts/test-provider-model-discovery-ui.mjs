import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");
const main = fs.readFileSync(path.join(root, "desktop", "src-tauri", "src", "main.rs"), "utf8");
const backend = fs.readFileSync(path.join(root, "desktop", "src-tauri", "src", "agent_llm.rs"), "utf8");
const contract = fs.readFileSync(path.join(root, "docs", "plans", "active-2026-08-05-system-credential-and-simple-llm-settings-spec.md"), "utf8");

function sliceBetween(source, start, end, label) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `${label} must be present and bounded`);
  return source.slice(from, to);
}

const wizard = sliceBetween(html, '<div id="agentLlmProviderWizard"', '<div id="agentLlmModelDialog"', "Add provider wizard");
const wizardModel = sliceBetween(wizard, '<section id="agentLlmWizardStepModel"', "</section>", "Wizard Model step");
const modelDialog = sliceBetween(html, '<div id="agentLlmModelDialog"', '<div id="agentLlmModelDeleteDialog"', "Add/Edit model dialog");

for (const id of [
  "agentLlmWizardDiscoveredModel",
  "agentLlmWizardDiscoveryStatus",
  "agentLlmWizardRefreshModels",
  "agentLlmWizardManualModel",
]) assert.ok(wizardModel.includes(`id="${id}"`), `${id} must exist in the wizard Model step`);
assert.ok(
  wizardModel.indexOf('id="agentLlmWizardDiscoveredModel"') < wizardModel.indexOf('id="agentLlmWizardManualModel"'),
  "Provider discovery must precede manual Model ID entry",
);
assert.match(wizardModel, /id="agentLlmWizardManualModel"[^>]*class="[^"]*agent-llm-manual-model[^"]*"/);
assert.doesNotMatch(wizardModel.match(/<details id="agentLlmWizardManualModel"[^>]*>/)?.[0] || "", /\sopen(?:\s|>)/);
assert.match(wizardModel, /id="agentLlmWizardManualModel"[\s\S]*id="agentLlmWizardModelId"[\s\S]*id="agentLlmWizardModelName"/);
assert.match(wizardModel, /No prompt is sent/);

for (const id of [
  "agentLlmModelDiscoveredModel",
  "agentLlmModelDiscoveryStatus",
  "agentLlmRefreshModels",
  "agentLlmModelManualFields",
]) assert.ok(modelDialog.includes(`id="${id}"`), `${id} must exist in the Model editor`);
assert.ok(
  modelDialog.indexOf('id="agentLlmModelDiscoveredModel"') < modelDialog.indexOf('id="agentLlmModelManualFields"'),
  "Add model must present Provider discovery before manual fields",
);
assert.match(modelDialog, /id="agentLlmModelManualFields"[\s\S]*id="agentLlmModelDisplayName"[\s\S]*id="agentLlmModelId"/);
assert.doesNotMatch(modelDialog, /Load catalog|agentLlmLoadCatalog|agentLlmCatalogModel/);

for (const name of [
  "agentLlmDiscoveryRecord",
  "resetAgentLlmDiscovery",
  "renderAgentLlmDiscovery",
  "applyAgentLlmDiscoveredModel",
  "agentLlmDiscoveryContextIsCurrent",
  "discoverAgentLlmModels",
]) assert.match(js, new RegExp(`(?:async )?function ${name}\\b`), `${name} must implement discovery-first UI state`);

const advance = sliceBetween(js, "async function advanceAgentLlmProviderWizard()", "\nasync function finishAgentLlmProviderWizard", "Wizard Connection transition");
assert.ok(advance.indexOf('invoke("agent_llm_save_provider"') < advance.indexOf('invoke("agent_llm_set_credential"'));
assert.ok(advance.indexOf('invoke("agent_llm_set_credential"') < advance.indexOf('discoverAgentLlmModels(provider.id, "wizard")'));
assert.doesNotMatch(advance, /preset\.modelId|preset\.modelName/);
assert.match(advance, /wizardStep = "model"[\s\S]*discoverAgentLlmModels\(provider\.id, "wizard"\)/);

const openModel = sliceBetween(js, "function openAgentLlmModelDialog", "\nfunction closeAgentLlmModelDialog", "Model dialog open path");
assert.match(openModel, /if \(modelId\)[\s\S]*else[\s\S]*discoverAgentLlmModels\(providerId, "model"\)/);
assert.match(openModel, /resetAgentLlmDiscovery\("model", providerId\)/);
const closeModel = sliceBetween(js, "function closeAgentLlmModelDialog", "\nasync function copyText", "Model dialog close path");
assert.match(closeModel, /resetAgentLlmDiscovery\("model", null\)/);
const closeWizard = sliceBetween(js, "function closeAgentLlmProviderWizard", "\nasync function advanceAgentLlmProviderWizard", "Wizard close path");
assert.match(closeWizard, /resetAgentLlmDiscovery\("wizard", null\)/);

const discover = sliceBetween(js, "async function discoverAgentLlmModels", "\nfunction renderAgentProviderForm", "Discovery request state machine");
assert.match(discover, /invoke\("agent_llm_discover_models", \{ providerId \}\)/);
assert.match(discover, /agentLlmDiscoveryContextIsCurrent\(scope, providerId, requestId\)/);
assert.match(discover, /Array\.isArray\(response\?\.models\)/);
assert.match(discover, /response\.provider_id !== providerId/);
assert.match(discover, /Enter a model ID manually/);
assert.doesNotMatch(discover, /localStorage|sessionStorage|credential/);

assert.match(js, /command === "agent_llm_discover_models"/);
for (const state of ["ready", "empty", "unsupported", "auth-error", "malformed", "slow", "truncated"]) {
  assert.ok(js.includes(`"${state}"`), `Mock discovery state ${state} must be deterministic`);
}
assert.match(js, /discoverySequence \+= 1/);
assert.match(js, /scenario === "model-settings"/);
assert.match(js, /state"\) === "add-model"/);

assert.match(main, /async fn agent_llm_discover_models\b/);
assert.ok(main.includes("agent_llm_discover_models,"), "Discovery command must be registered with Tauri");
assert.match(backend, /MODEL_DISCOVERY_TIMEOUT:\s*Duration\s*=\s*Duration::from_secs\(15\)/);
assert.match(backend, /MAX_MODEL_DISCOVERY_BYTES:\s*usize\s*=\s*1024 \* 1024/);
assert.match(backend, /MAX_DISCOVERED_MODELS:\s*usize\s*=\s*100/);
assert.match(backend, /redirect\(reqwest::redirect::Policy::none\(\)\)/);
assert.match(backend, /\.no_proxy\(\)/);
assert.match(backend, /credential_store\.get\(provider_id\)/);
for (const header of ["authorization", "x-api-key", "anthropic-version", "x-goog-api-key"]) {
  assert.ok(backend.toLowerCase().includes(header), `Backend must implement ${header} discovery authentication`);
}
assert.match(backend, /response\.take\(\(MAX_MODEL_DISCOVERY_BYTES \+ 1\) as u64\)/);
assert.match(backend, /provider\.base_url\.as_deref\(\)[\s\S]*return Ok\(None\)/);

assert.match(css, /\.agent-llm-discovery-panel\s*\{/);
assert.match(css, /\.agent-llm-manual-model\[open\]/);
assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.agent-llm-discovery-heading\s*\{[^}]*flex-direction:\s*column/);
assert.match(contract, /CRED-UX3 Provider Model Discovery/);
assert.match(contract, /explicitly authorized by the project owner on 2026-08-07/);

console.log("Provider model discovery-first UI and credential-boundary checks passed.");

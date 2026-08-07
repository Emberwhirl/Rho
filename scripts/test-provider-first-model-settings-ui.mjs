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
const description = read("r", "rho.agent", "DESCRIPTION");
const adapter = read("r", "rho.agent", "R", "aisdk_adapter.R");
const contract = read("docs", "plans", "active-2026-08-05-system-credential-and-simple-llm-settings-spec.md");

function sliceBetween(source, start, end, label) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `${label} must exist and be bounded`);
  return source.slice(from, to);
}

const dialog = sliceBetween(html, '<div id="agentLlmDialog"', '<div id="agentLlmProviderWizard"', "Model settings dialog");
const tabs = sliceBetween(dialog, '<div class="agent-llm-tabs"', "</div>", "Model settings tabs");
assert.ok(tabs.indexOf('data-agent-llm-view="connections"') < tabs.indexOf('data-agent-llm-view="routing"'), "Connections must be first");
assert.match(tabs, /<button(?=[^>]*data-agent-llm-view="connections")(?=[^>]*aria-selected="true")[^>]*>/);
assert.match(dialog, /id="agentLlmRetrySettings"/);
assert.match(dialog, /Base URL \(optional\)/);
assert.ok(dialog.indexOf('id="agentLlmProviderBaseUrl"') < dialog.indexOf('id="agentLlmProviderAdvanced"'), "Base URL must be a common connection field");

for (const id of [
  "agentLlmWizardProviderGrid",
  "agentLlmWizardDiscoveredModelCards",
  "agentLlmModelDiscoveredModelCards",
  "agentLlmWizardCapabilityGrid",
  "agentLlmModelCapabilityGrid",
]) assert.ok(html.includes(`id="${id}"`), `${id} must provide a panel/card control`);
assert.match(html, /id="agentLlmModelCapabilities"[^>]*\sopen(?:\s|>)/, "Model options must expose default capabilities without another disclosure step");

for (const selector of [
  ".agent-llm-provider-preset-grid",
  ".agent-llm-discovered-model-grid",
  ".agent-llm-capability-grid",
  ".agent-llm-route-model-card",
  ".agent-llm-model-capabilities",
]) assert.ok(css.includes(selector), `${selector} must be styled`);

for (const name of [
  "retryAgentLlmSettings",
  "renderAgentProviderPresetGrid",
  "renderAgentLlmDiscoveredModelCards",
  "renderAgentCapabilityPanel",
  "focusAgentModelRouting",
  "createAgentRouteModelCard",
]) assert.match(js, new RegExp(`(?:async )?function ${name}\\b`), `${name} must exist`);

const composerSync = sliceBetween(js, "function syncAgentComposerState()", "\nfunction syncAgentModeControl", "composer model entry state");
assert.doesNotMatch(composerSync, /agentModelSelector[^\n]*models/);
const selectorOpen = sliceBetween(js, "function openAgentModelSelector", "\nfunction renderAgentModelSelector", "composer model menu opening");
assert.doesNotMatch(selectorOpen, /models\?\.length\) return/);
assert.match(js, /mockAgentLlmLoadFailureConsumed/);
assert.match(js, /mockAgentLlmFailure === "load-settings"/);
assert.match(main, /agent_llm_settings outcome=failed/);

const routing = sliceBetween(js, "function renderAgentLlmRouting", "\nfunction renderAgentLlmCustomRouteModels", "Model routing renderer");
assert.doesNotMatch(routing, /createElement\("select"\)/);
assert.match(routing, /createAgentRouteModelCard/);
assert.match(js, /Assign uses/);
assert.match(js, /Open connection/);

for (const provider of [
  "deepseek", "moonshot", "kimi", "stepfun", "volcengine", "aihubmix",
  "xai", "openrouter", "bailian", "nvidia",
]) {
  assert.ok(js.includes(`${provider}:`), `${provider} must have a reviewed UI preset`);
  assert.ok(adapter.includes(`create_${provider === "volcengine" ? "volcengine" : provider}`), `${provider} must have an explicit runtime constructor`);
}
assert.match(js, /const AGENT_PROVIDER_PRESETS/);
assert.match(description, /aisdk\.providers/);
assert.match(description, /YuLab-SMU\/aisdk\.providers@5cf315e5eedad7d83b224c96595da346e1192a85/);
assert.match(adapter, /requireNamespace\("aisdk\.providers"/);
assert.match(adapter, /rho_runtime_provider_default_base_url/);
assert.match(adapter, /rho_without_ambient_provider_environment/);
assert.match(adapter, /Credential was not received from the system credential store/);
assert.match(adapter, /gemini = "https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models"/);
assert.match(js, /gemini: \{[^\n]*defaultBaseUrl: "https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models"/);
assert.match(backend, /provider_default_base_url/);
assert.match(backend, /Built-in providers accept only a bounded optional Base URL override/);

assert.match(contract, /CRED-UX4A-R1 — Provider-first recovery and catalog integration/);
assert.match(contract, /`0\.4\.0-dev\.18` was committed, handed to the owner as a DMG/);

console.log("Provider-first Model settings recovery and catalog contract checks passed.");

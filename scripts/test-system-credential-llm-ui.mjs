import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");
const rust = fs.readFileSync(path.join(root, "desktop", "src-tauri", "src", "main.rs"), "utf8");

assert.match(
  html,
  /id="agentLlmCredential" type="password" autocomplete="new-password" spellcheck="false"/,
  "The API key must be a transient password input without browser autofill"
);
for (const label of ["Provider type", "Model", "API key", "Save", "Test connection", "Use this model"]) {
  assert.ok(html.includes(label), `Missing required primary setting: ${label}`);
}
for (const obsolete of ["Reload credentials", "Copy API key template"]) {
  assert.ok(!html.includes(obsolete), `Obsolete primary action remains: ${obsolete}`);
}

const advancedStart = html.indexOf('<details id="agentLlmAdvanced"');
const dialogEnd = html.indexOf("<!-- Generic product dialogs -->", advancedStart);
const advanced = html.slice(advancedStart, dialogEnd);
assert.ok(advancedStart >= 0 && !/<details id="agentLlmAdvanced"[^>]*\sopen(?:\s|>)/.test(advanced));
for (const id of [
  "agentLlmProviderList",
  "agentLlmModelList",
  "agentLlmProviderDisplayName",
  "agentLlmModelDisplayName",
  "agentLlmRegisteredProviderId",
  "agentLlmProviderApiKeyEnv",
  "agentLlmProviderBaseUrlEnv",
  "agentLlmProviderWireApi",
  "agentLlmProviderDisableStreamOptions",
  "agentLlmModelToolCalling",
  "agentLlmModelReasoning",
  "agentLlmModelVisionInput",
  "agentLlmModelCapabilitySource",
  "agentLlmDeleteProvider",
  "agentLlmDeleteModel",
]) assert.ok(advanced.includes(`id="${id}"`), `${id} must be hidden under Advanced`);

for (const status of [
  "Stored securely",
  "Available from user environment",
  "Not set",
  "Not required",
  "Credential storage unavailable",
]) assert.ok(js.includes(status), `Missing friendly credential state: ${status}`);

assert.match(js, /command === "agent_llm_set_credential"/);
assert.match(js, /command === "agent_llm_delete_credential"/);
const setMock = js.slice(
  js.indexOf('if (command === "agent_llm_set_credential")'),
  js.indexOf('if (command === "agent_llm_delete_credential")')
);
assert.doesNotMatch(setMock, /provider\.(?:credential|api_key)\s*=|localStorage|sessionStorage/);
assert.match(setMock, /return structuredClone\(rebuildMockAgentLlmSettings\(\)\)/);

const save = js.slice(js.indexOf("async function saveAgentLlmConfiguration"), js.indexOf("\nasync function deleteAgentLlmCredential"));
assert.match(save, /finally\s*{\s*clearAgentLlmCredentialInput\(\)/);
assert.match(save, /invoke\("agent_llm_set_credential", \{ providerId: provider\.id, credential \}\)/);
const close = js.slice(js.indexOf("function closeAgentLlmDialog"), js.indexOf("\nfunction applyAgentLlmView"));
assert.match(close, /clearAgentLlmCredentialInput\(\)/);
const projectSwitch = js.slice(js.indexOf("async function hydrateProject"), js.indexOf("\nfunction setStartupBusy"));
assert.match(projectSwitch, /clearAgentLlmCredentialInput\(\)/);
const providerListRender = js.slice(js.indexOf("function renderAgentLlmDialog"), js.indexOf("\nfunction openAgentLlmDialog"));
assert.match(providerListRender, /row\.addEventListener\("click", \(\) => \{\s*clearAgentLlmCredentialInput\(\)/);
const providerKindChange = js.slice(js.indexOf('$("#agentLlmProviderKind").addEventListener'), js.indexOf("\n$$", js.indexOf('$("#agentLlmProviderKind").addEventListener')));
assert.match(providerKindChange, /clearAgentLlmCredentialInput\(\)/);
assert.match(js, /\["openai_compatible", "local_openai_compatible"\]\.includes\(kind\)/);
assert.match(js, /agentLlmCredentialField"\)\.classList\.toggle\("hidden", !keyRequired\)/);

for (const command of ["agent_llm_set_credential", "agent_llm_delete_credential"]) {
  assert.match(rust, new RegExp(`async fn ${command}\\b`));
  assert.ok(rust.includes(command), `${command} must be registered with Tauri`);
}

console.log("System credential and simplified model settings contract checks passed.");

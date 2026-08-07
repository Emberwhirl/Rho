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
for (const id of ["agentLlmCurrentSelection", "agentLlmCurrentStatus", "agentLlmProviderList", "agentLlmModelList"]) {
  assert.ok(html.includes(`id="${id}"`), `${id} must be visible in the primary model chooser`);
}
assert.ok(html.includes("<summary>Provider Advanced</summary>"), "Provider connection details must be progressively disclosed per provider");
for (const obsolete of ["Reload credentials", "Copy API key template"]) {
  assert.ok(!html.includes(obsolete), `Obsolete primary action remains: ${obsolete}`);
}

const advancedStart = html.indexOf('<details id="agentLlmProviderAdvanced"');
const advancedEnd = html.indexOf('<details id="agentLlmProviderDanger"', advancedStart);
const advanced = html.slice(advancedStart, advancedEnd);
const modelDialogStart = html.indexOf('<div id="agentLlmModelDialog"');
const modelDialogEnd = html.indexOf("<!-- Generic product dialogs -->", modelDialogStart);
const modelDialog = html.slice(modelDialogStart, modelDialogEnd);
assert.ok(advancedStart >= 0 && !/<details id="agentLlmProviderAdvanced"[^>]*\sopen(?:\s|>)/.test(advanced));
for (const id of [
  "agentLlmProviderDisplayName",
  "agentLlmRegisteredProviderId",
  "agentLlmProviderApiKeyEnv",
  "agentLlmProviderBaseUrlEnv",
  "agentLlmProviderWireApi",
  "agentLlmProviderDisableStreamOptions",
]) assert.ok(advanced.includes(`id="${id}"`), `${id} must be hidden under Provider Advanced`);
for (const id of [
  "agentLlmModelDisplayName",
  "agentLlmModelToolCalling",
  "agentLlmModelReasoning",
  "agentLlmModelVisionInput",
  "agentLlmModelCapabilitySource",
  "agentLlmDeleteModel",
]) assert.ok(modelDialog.includes(`id="${id}"`), `${id} must be isolated in the model editor`);
assert.ok(html.indexOf('id="agentLlmDeleteProvider"') > advancedStart, "Provider deletion must follow Provider Advanced");
for (const id of ["agentLlmProviderList", "agentLlmModelList"]) {
  assert.ok(!advanced.includes(`id="${id}"`), `${id} must remain in the primary chooser`);
}

for (const status of [
  "Stored securely",
  "Not set",
  "Not required",
  "Credential storage unavailable",
]) assert.ok(js.includes(status), `Missing friendly credential state: ${status}`);
assert.doesNotMatch(html, /Open user environment file|Reload credentials|Copy API key template/);
assert.doesNotMatch(js, /agent_llm_open_user_environ|credential_source = "environment"/);

assert.match(js, /command === "agent_llm_set_credential"/);
assert.match(js, /command === "agent_llm_delete_credential"/);
const setMock = js.slice(
  js.indexOf('if (command === "agent_llm_set_credential")'),
  js.indexOf('if (command === "agent_llm_delete_credential")')
);
assert.doesNotMatch(setMock, /provider\.(?:credential|api_key)\s*=|localStorage|sessionStorage/);
assert.match(setMock, /return structuredClone\(rebuildMockAgentLlmSettings\(\)\)/);

const save = js.slice(js.indexOf("async function saveAgentLlmCredential"), js.indexOf("\nasync function deleteAgentLlmCredential"));
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
const currentSelectionRender = js.slice(js.indexOf("function renderAgentLlmCurrentSelection"), js.indexOf("\nfunction renderAgentLlmDialog"));
assert.match(currentSelectionRender, /settings\.selected_model_id/);
assert.match(currentSelectionRender, /agentLlmCurrentSelection/);
assert.match(js, /\$\("#agentLlmAddProvider"\)\.addEventListener\("click", openAgentLlmProviderWizard\)/);
assert.match(js, /\$\("#agentLlmAddModel"\)\.addEventListener\("click", \(\) => openAgentLlmModelDialog\(null\)\)/);
assert.doesNotMatch(js, /saveAgentLlmConfiguration/);

for (const command of ["agent_llm_set_credential", "agent_llm_delete_credential"]) {
  assert.match(rust, new RegExp(`async fn ${command}\\b`));
  assert.ok(rust.includes(command), `${command} must be registered with Tauri`);
}

console.log("System credential and simplified model settings contract checks passed.");

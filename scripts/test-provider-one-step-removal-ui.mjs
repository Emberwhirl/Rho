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
const contract = fs.readFileSync(
  path.join(root, "docs", "plans", "active-2026-08-05-system-credential-and-simple-llm-settings-spec.md"),
  "utf8",
);

function sliceBetween(source, start, end, label) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `${label} must be present and bounded`);
  return source.slice(from, to);
}

const mainDialog = sliceBetween(
  html,
  '<div id="agentLlmDialog"',
  '<div id="agentLlmProviderWizard"',
  "Model settings dialog",
);
const danger = sliceBetween(
  mainDialog,
  '<details id="agentLlmProviderDanger"',
  "</details>",
  "Provider Danger zone",
);
const deleteDialog = sliceBetween(
  html,
  '<div id="agentLlmProviderDeleteDialog"',
  "<!-- Generic product dialogs -->",
  "Provider deletion review dialog",
);

assert.match(danger, /Remove this provider, its imported models, optional route assignments, and stored key in one confirmed action/);
assert.match(danger, /id="agentLlmDeleteProvider"[^>]*>Delete provider and models</);
assert.doesNotMatch(html, /Remove its models first|models have been removed|Delete the provider's models before removing the provider/);
for (const id of [
  "agentLlmProviderDeleteTitle",
  "agentLlmProviderDeleteStatus",
  "agentLlmProviderDeleteSummary",
  "agentLlmProviderDeleteName",
  "agentLlmProviderDeleteModelCount",
  "agentLlmProviderDeleteRouteCount",
  "agentLlmProviderDeleteCredential",
  "agentLlmProviderDeleteModels",
  "agentLlmProviderDeleteRoutes",
  "agentLlmProviderDeleteBlocker",
  "agentLlmProviderDeleteCancel",
  "agentLlmProviderDeleteRouting",
  "agentLlmProviderDeleteConfirm",
]) assert.ok(deleteDialog.includes(`id="${id}"`), `${id} must be isolated in the deletion review`);
assert.match(deleteDialog, /id="agentLlmProviderDeleteStatus"[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(deleteDialog, /id="agentLlmProviderDeleteBlocker"[^>]*role="alert"/);
assert.match(deleteDialog, /This action cannot be undone/);
assert.doesNotMatch(deleteDialog.match(/<div id="agentLlmProviderDeleteDialog"[^>]*>/)?.[0] || "", /role=|aria-modal=/);
assert.ok(
  deleteDialog.indexOf('id="agentLlmProviderDeleteCancel"')
    < deleteDialog.indexOf('id="agentLlmProviderDeleteConfirm"'),
  "The safe cancellation action must precede destructive confirmation",
);

for (const selector of [
  ".agent-llm-provider-delete-surface",
  ".agent-llm-provider-delete-impact",
  ".agent-llm-provider-delete-facts",
  ".agent-llm-provider-delete-list-section",
  ".agent-llm-provider-delete-blocker",
]) assert.ok(css.includes(selector), `${selector} must style the deletion review`);
assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.agent-llm-provider-delete-facts\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);

for (const name of [
  "agentProviderDeleteImpact",
  "agentProviderDeleteFailureMessage",
  "renderAgentProviderDeleteDialog",
  "openAgentProviderDeleteDialog",
  "closeAgentLlmProviderDeleteDialog",
  "openAgentProviderDeleteRouting",
  "confirmAgentProviderDeletion",
]) assert.match(js, new RegExp(`(?:async )?function ${name}\\b`), `${name} must implement the review flow`);

const impact = sliceBetween(js, "function agentProviderDeleteImpact", "\nfunction setAgentProviderDeleteOperation", "Provider deletion impact derivation");
assert.match(impact, /model\.provider_id === provider\.id/);
assert.match(impact, /route\.configured && modelIds\.has\(route\.model_id\)/);
assert.match(impact, /route\.capability === "agent\.chat"/);
assert.match(impact, /route\.capability !== "agent\.chat"/);
assert.match(impact, /credential_source === "system"/);
assert.match(impact, /credential_source === "unavailable"/);

const open = sliceBetween(js, "function openAgentProviderDeleteDialog", "\nfunction closeAgentLlmProviderDeleteDialog", "Provider deletion open path");
assert.doesNotMatch(open, /invoke\("agent_llm_delete_provider"/);
assert.match(open, /providerDeleteRevision = state\.agentLlm\.settings\?\.revision/);
assert.match(open, /setAgentLlmMainDialogInert\(true\)/);
assert.match(open, /labelAgentLlmModal\("agentLlmProviderDeleteTitle"\)/);
assert.match(open, /agentLlmProviderDeleteCancel"\)\.focus\(\)/);

const confirm = sliceBetween(js, "async function confirmAgentProviderDeletion", "\nasync function saveAgentModel", "Provider deletion confirmation");
assert.ok(confirm.indexOf("if (impact.chatRoute)") < confirm.indexOf('invoke("agent_llm_delete_provider"'));
assert.ok(confirm.indexOf("currentRevision !== state.agentLlm.providerDeleteRevision") < confirm.indexOf('invoke("agent_llm_delete_provider"'));
assert.match(confirm, /request:\s*\{\s*provider_id: impact\.provider\.id,\s*expected_revision: state\.agentLlm\.providerDeleteRevision/);
assert.match(confirm, /loadAgentLlmSettings\(\{ preserveOnFailure: true \}\)/);
assert.match(confirm, /if \(!reloaded\)/);
assert.match(confirm, /Review the updated impact, then confirm again/);
assert.match(confirm, /Deleted \$\{impact\.provider\.display_name\}/);
assert.match(js, /The Provider metadata was not deleted/);
assert.match(js, /API key could not be restored after the storage failure/);
assert.match(js, /Its stored API key was restored, so you can retry safely/);
assert.match(js, /No stored API key was affected, so you can retry safely/);
assert.match(js, /stored API key could not be removed/);
assert.match(confirm, /Removed any stored API key for this Provider/);
assert.doesNotMatch(confirm, /target-secret|api.?key\s*[:=]\s*impact/i);

assert.match(js, /\$\("#agentLlmDeleteProvider"\)\.addEventListener\("click", openAgentProviderDeleteDialog\)/);
assert.match(js, /\$\("#agentLlmProviderDeleteCancel"\)\.addEventListener\("click", \(\) => closeAgentLlmProviderDeleteDialog\(\)\)/);
assert.match(js, /\$\("#agentLlmProviderDeleteConfirm"\)\.addEventListener\("click", \(\) => void confirmAgentProviderDeletion\(\)\)/);
assert.match(js, /\[\$\("#agentLlmProviderDeleteDialog"\), "agentLlmProviderDeleteTitle"\]/);
assert.match(js, /trapAgentLlmDialogFocus\(event, \$\("#agentLlmProviderDeleteDialog"\), closeAgentLlmProviderDeleteDialog\)/);
for (const state of ["delete-provider", "delete-provider-empty", "delete-provider-chat-blocked"]) {
  assert.ok(js.includes(`"${state}"`), `Deterministic ${state} preview must exist`);
}
assert.match(js, /provider_delete_open: !providerDeleteDialog\.classList\.contains\("hidden"\)/);
assert.match(js, /blocked_by_chat: !\$\("#agentLlmProviderDeleteBlocker"\)\.classList\.contains\("hidden"\)/);
assert.match(js, /provider_delete_x: Boolean\(providerDeleteSurface/);
assert.match(js, /provider_delete_y: Boolean\(providerDeleteSurface/);

const mockDelete = sliceBetween(js, 'if (command === "agent_llm_delete_provider")', 'if (command === "agent_llm_save_model")', "Mock Provider deletion command");
assert.match(mockDelete, /request\.providerId \?\? request\.provider_id/);
assert.match(mockDelete, /request\.expectedRevision \?\? request\.expected_revision/);
assert.ok(mockDelete.indexOf("expectedRevision !== mockAgentLlmSettings.revision") < mockDelete.indexOf('maybeFailMockAgentLlm("delete-provider")'));
assert.ok(mockDelete.indexOf('route.capability === "agent.chat"') < mockDelete.indexOf('maybeFailMockAgentLlm("delete-provider")'));
assert.match(mockDelete, /persisted_capability_routes[\s\S]*\.filter\(\(route\) => !modelIds\.has\(route\.model_id\)\)/);
assert.match(mockDelete, /models[\s\S]*\.filter\(\(model\) => model\.provider_id !== providerId\)/);
assert.match(mockDelete, /mockAgentLlmSystemCredentials\.delete\(providerId\)/);
assert.match(mockDelete, /providers\.filter\(\(provider\) => provider\.id !== providerId\)/);
assert.match(mockDelete, /revision \+= 1/);

assert.match(main, /async fn agent_llm_delete_provider\(\s*request: DeleteProviderRequest/);
assert.match(main, /agent_llm::delete_provider\(&config\.data_dir, &request\)/);
assert.ok(main.includes("agent_llm_delete_provider,"), "Provider deletion must remain registered with Tauri");
assert.match(backend, /struct DeleteProviderRequest\s*\{\s*pub provider_id: String,\s*pub expected_revision: u64/);
const backendDelete = sliceBetween(backend, "fn delete_provider_with_store_and_save", "\npub fn set_credential", "Rust Provider deletion transaction");
assert.ok(backendDelete.indexOf("settings.revision == request.expected_revision") < backendDelete.indexOf("credential_store.get(provider_id)"));
assert.match(backendDelete, /validate_bounded\(provider_id, "Provider ID", MAX_ID_LENGTH\)/);
assert.ok(backendDelete.indexOf('route.capability == "agent.chat"') < backendDelete.indexOf("credential_store.get(provider_id)"));
assert.ok(backendDelete.indexOf("validate_settings(&settings)") < backendDelete.indexOf("credential_store.get(provider_id)"));
assert.match(backendDelete, /capability_routes\s*\.retain\(\|route\| !model_ids\.contains\(&route\.model_id\)\)/);
assert.match(backendDelete, /models\s*\.retain\(\|model\| model\.provider_id != provider_id\)/);
assert.match(backendDelete, /credential_store\.delete\(provider_id\)/);
assert.match(backendDelete, /credential_store\.set\(provider_id, credential\)/);
assert.match(backendDelete, /could not be restored/);
assert.doesNotMatch(backend, /Delete the provider's models before removing the provider/);

assert.match(contract, /CRED-UX4A-R3 One-Confirmation Provider Removal/);
assert.match(contract, /One destructive confirmation removes exactly one revision-bound Provider/);
assert.match(contract, /Cancellation, stale state, credential failure, or settings\s*>?\s*persistence failure/);

console.log("One-confirmation Provider removal UX and transaction contract checks passed.");

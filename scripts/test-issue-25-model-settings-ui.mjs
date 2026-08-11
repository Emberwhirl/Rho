import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");
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

function extractNamedFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (["'", '"', "`"].includes(character)) {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  assert.fail(`${name} must have a complete function body`);
}

assert.match(contract, /CRED-UX4A-R4 Issue #25 Provider Context And Model-Delete Modal Repair/);
assert.match(contract, /selected Provider detail never presents another Provider's model/);
assert.match(contract, /Cancel, scrim close, or Escape issues no delete[\s>]+command/);

const presentationSource = extractNamedFunction(js, "agentProviderChatPresentation");
const agentProviderChatPresentation = Function(
  "modelSelectorStatusLabel",
  `"use strict"; ${presentationSource}; return agentProviderChatPresentation;`,
)((model) => model.selector_status || "Ready");
const settings = {
  selected_model_id: "model-a",
  selected_model: null,
  capability_routes: [{ capability: "agent.chat", configured: true, model_id: "model-a" }],
  providers: [
    { id: "provider-a", display_name: "Provider A" },
    { id: "provider-b", display_name: "Provider B" },
  ],
  models: [
    {
      id: "model-a",
      provider_id: "provider-a",
      display_name: "Chat Model A",
      model_id: "chat-a",
      selector_status: "Ready",
    },
    {
      id: "model-b",
      provider_id: "provider-b",
      display_name: "Unassigned Model B",
      model_id: "model-b",
      selector_status: "Ready",
    },
  ],
};
const foreign = agentProviderChatPresentation(settings, "provider-b");
assert.equal(foreign.model, null, "an unrelated Chat model must not enter the selected Provider projection");
assert.equal(foreign.status, "Not assigned");
assert.equal(foreign.selection, "This Provider is not assigned to Chat.");
assert.doesNotMatch(JSON.stringify(foreign), /Chat Model A|Provider A/);
const owned = agentProviderChatPresentation(settings, "provider-a");
assert.equal(owned.model?.id, "model-a");
assert.match(owned.selection, /Chat Model A/);
assert.match(owned.selection, /Provider A/);
const missing = agentProviderChatPresentation({
  ...settings,
  selected_model_id: null,
  capability_routes: [],
}, "provider-a");
assert.equal(missing.model, null);
assert.equal(missing.status, "Not assigned");

const modelEditor = sliceBetween(
  html,
  '<div id="agentLlmModelDialog"',
  '<div id="agentLlmModelDeleteDialog"',
  "Model editor",
);
const modelDeleteDialog = sliceBetween(
  html,
  '<div id="agentLlmModelDeleteDialog"',
  '<div id="agentLlmProviderDeleteDialog"',
  "Model deletion confirmation",
);
assert.match(modelEditor, /id="agentLlmDeleteModel"/);
for (const id of [
  "agentLlmModelDeleteTitle",
  "agentLlmModelDeleteStatus",
  "agentLlmModelDeleteSummary",
  "agentLlmModelDeleteClose",
  "agentLlmModelDeleteCancel",
  "agentLlmModelDeleteConfirm",
]) assert.ok(modelDeleteDialog.includes(`id="${id}"`), `${id} must belong to the dedicated confirmation`);
assert.match(modelDeleteDialog, /id="agentLlmModelDeleteStatus"[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(modelDeleteDialog, /This action cannot be undone/);
assert.doesNotMatch(
  modelDeleteDialog.match(/<div id="agentLlmModelDeleteDialog"[^>]*>/)?.[0] || "",
  /role=|aria-modal=/,
  "only the active child may receive modal semantics",
);
assert.ok(
  modelDeleteDialog.indexOf('id="agentLlmModelDeleteCancel"')
    < modelDeleteDialog.indexOf('id="agentLlmModelDeleteConfirm"'),
  "safe cancellation must precede destructive confirmation",
);

assert.match(css, /\.agent-llm-model-delete-dialog\s*\{[^}]*z-index:\s*36\s*;/s);
assert.match(css, /\.agent-llm-model-dialog-inert\s*\{[^}]*pointer-events:\s*none\s*;/s);
assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.agent-llm-model-delete-surface/);

const renderCurrent = sliceBetween(
  js,
  "function renderAgentLlmCurrentSelection",
  "\nfunction switchAgentLlmView",
  "Provider-scoped Chat presentation renderer",
);
assert.match(renderCurrent, /agentProviderChatPresentation\(settings, selectedProviderId\)/);
assert.doesNotMatch(renderCurrent, /provider_display_name[^\n]*\|\|\s*"Provider"/);
const renderDialog = sliceBetween(js, "function renderAgentLlmDialog()", "\nfunction openAgentLlmDialog", "Model settings renderer");
assert.match(renderDialog, /renderAgentLlmCurrentSelection\(settings, selectedProvider\?\.id \|\| null\)/);

for (const name of [
  "setAgentLlmModelDialogInert",
  "renderAgentModelDeleteDialog",
  "openAgentModelDeleteDialog",
  "closeAgentLlmModelDeleteDialog",
  "confirmAgentModelDeletion",
]) assert.match(js, new RegExp(`(?:async )?function ${name}\\b`), `${name} must implement the modal flow`);

const openDelete = sliceBetween(
  js,
  "function openAgentModelDeleteDialog",
  "\nfunction closeAgentLlmModelDeleteDialog",
  "Model deletion open path",
);
assert.doesNotMatch(openDelete, /invoke\("agent_llm_delete_model"/);
assert.match(openDelete, /if \(!state\.agentLlm\.modelDialogOpen \|\| state\.agentLlm\.modelDeleteOpen\) return/);
assert.match(openDelete, /modelDeleteModelId = model\.id/);
assert.match(openDelete, /setAgentLlmModelDialogInert\(true\)/);
assert.match(openDelete, /labelAgentLlmModal\("agentLlmModelDeleteTitle"\)/);
assert.match(openDelete, /agentLlmModelDeleteCancel"\)\.focus\(\)/);

const closeDelete = sliceBetween(
  js,
  "function closeAgentLlmModelDeleteDialog",
  "\nasync function confirmAgentModelDeletion",
  "Model deletion cancellation path",
);
assert.doesNotMatch(closeDelete, /invoke\("agent_llm_delete_model"/);
assert.match(closeDelete, /if \(!state\.agentLlm\.modelDeleteOpen[\s\S]*classList\.contains\("hidden"\)\) return/);
assert.match(closeDelete, /modelDeleteModelId = null/);
assert.match(closeDelete, /setAgentLlmModelDialogInert\(false\)/);
assert.match(closeDelete, /labelAgentLlmModal\("agentLlmModelDialogTitle"\)/);
assert.match(closeDelete, /returnFocus\?\.focus\(\)/);

const confirmDelete = sliceBetween(
  js,
  "async function confirmAgentModelDeletion",
  "\nasync function selectAgentDefaultModel",
  "Model deletion confirmation path",
);
assert.match(confirmDelete, /if \(state\.agentLlm\.modelDeleteWorking\) return/);
assert.match(confirmDelete, /state\.agentLlm\.modelDeleteModelId/);
assert.match(confirmDelete, /invoke\("agent_llm_delete_model"/);
assert.match(confirmDelete, /model_id: model\.id/);
assert.match(confirmDelete, /setAgentModelDeleteOperation\("error"/);
assert.doesNotMatch(confirmDelete, /confirmAction\(/);

assert.match(js, /\[\$\("#agentLlmModelDeleteDialog"\), "agentLlmModelDeleteTitle"\]/);
assert.match(js, /root\.removeAttribute\("role"\)[\s\S]*root\.removeAttribute\("aria-modal"\)/);
assert.match(js, /\$\("#agentLlmDeleteModel"\)\.addEventListener\("click", openAgentModelDeleteDialog\)/);
assert.match(js, /\$\("#agentLlmModelDeleteCancel"\)\.addEventListener\("click", \(\) => closeAgentLlmModelDeleteDialog\(\)\)/);
assert.match(js, /trapAgentLlmDialogFocus\(event, \$\("#agentLlmModelDeleteDialog"\), closeAgentLlmModelDeleteDialog\)/);
assert.match(js, /closeAgentLlmModelDeleteDialog\(\{ force: true, restoreFocus: false \}\)/);
for (const state of ["provider-unassigned", "model-delete", "model-delete-blocked"]) {
  assert.ok(js.includes(`"${state}"`), `deterministic ${state} preview must exist`);
}
assert.match(js, /model_delete_open: !modelDeleteDialog\.classList\.contains\("hidden"\)/);
assert.match(js, /model_editor_inert: modelEditor\.hasAttribute\("inert"\)/);
assert.match(js, /model_delete_x: Boolean\(modelDeleteSurface/);
assert.match(js, /model_delete_y: Boolean\(modelDeleteSurface/);

console.log("Issue #25 Provider context and model-delete modal regressions passed.");

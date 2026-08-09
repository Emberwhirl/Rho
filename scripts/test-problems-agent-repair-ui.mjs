import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), "utf8");
const js = read("desktop", "dist", "app.js");
const main = read("desktop", "src-tauri", "src", "main.rs");
const agentLlm = read("desktop", "src-tauri", "src", "agent_llm.rs");
const coordinator = read("crates", "rho-server", "src", "coordinator.rs");
const store = read("crates", "rho-store", "src", "lib.rs");
const migration = read("crates", "rho-store", "src", "migration.rs");
const bridge = read("r", "rho.bridge", "R", "execute.R");
const contract = read("docs", "plans", "active-2026-08-07-problems-agent-repair-spec.md");

assert.match(contract, /PROBLEMS-AGENT-REPAIR-2/);
assert.match(contract, /explicitly authorized its complete resolution on 2026-08-08/);
assert.match(contract, /range_kind=user_selection/);

assert.match(bridge, /parse\(text = code, keep\.source = TRUE\)/);
assert.match(bridge, /attr\(expressions, "srcref", exact = TRUE\)/);
assert.match(bridge, /source_range = current_source_range/);
assert.doesNotMatch(bridge, /regexec|strcapture|unexpected.*source_range/i);

assert.match(store, /pub\(crate\) const SCHEMA_VERSION: i64 = 10/);
for (const column of [
  "error_start_line",
  "error_start_column",
  "error_end_line",
  "error_end_column",
  "error_range_kind",
]) {
  assert.ok(store.includes(column) || migration.includes(column), `${column} must be durable`);
}
assert.match(store, /fn migrate_v9_to_v10/);
assert.match(store, /finish_run_with_error_range/);
assert.match(store, /validate_run_error_range/);
assert.match(store, /rejects_invalid_problem_ranges_and_projects_partial_history_as_unknown/);

assert.match(coordinator, /fn translated_run_error_range/);
assert.match(coordinator, /utf16_column_at_character_boundary/);
assert.match(coordinator, /project_relative_diagnostic_source/);
assert.match(coordinator, /range_kind: "r_expression"\.to_string\(\)/);
assert.match(coordinator, /Current editor context:/);
assert.match(coordinator, /exact executed code[\s\S]{0,180}do not require the user to restate or manually select a known error range/);

assert.match(main, /struct ExecuteSourceRange/);
assert.match(main, /validate_execute_source_range_shape/);
assert.match(main, /task_kind: Option<String>/);
assert.match(main, /"agent_turn" \| "problem_repair"/);
assert.match(main, /task_kind == "problem_repair" && mode != "ask"/);
assert.match(main, /task_kind == "agent_turn"[\s\S]{0,160}mode == "act"/);
assert.match(main, /resolve_model_and_credential_for_task/);

assert.match(agentLlm, /task_kind == "problem_repair"/);
assert.match(agentLlm, /mode == "ask"/);
assert.match(agentLlm, /resolve_model_for_turn_with_settings\(settings, requested_model_id, "act"\)/);
assert.match(agentLlm, /route\.capability == "agent\.act"/);
assert.match(agentLlm, /function_call/);
assert.match(agentLlm, /credential is missing/);

assert.match(js, /source_range: request\.sourceRange \?\? null/);
assert.match(js, /function problemExactRange\(problem\)/);
assert.match(js, /function currentProblemSelectionRange\(problem\)/);
assert.match(js, /rangeKind: "user_selection"/);
assert.match(js, /function problemRunContext\(detail\)/);
assert.match(js, /traceback: boundedProblemTextList\(problem\.traceback\)/);
assert.match(js, /selectExactProblemRange\(problem, repairRange\)/);
assert.match(js, /problemExpectedSourceText\(problem, runDetail, repairRange\)/);
assert.match(js, /taskKind: "problem_repair", mode: "ask"/);
assert.match(js, /taskKind === "agent_turn" && mode === "act" && state\.actAutoApprove/);
assert.match(js, /fix\.textContent = "Fix with Agent"/);
assert.match(js, /fix\.textContent = "Select code for Agent"/);
assert.match(js, /fix\.textContent = "Set up Agent repair"/);
assert.match(js, /state\.agentLlm\.routingExpandedCapability = "agent\.act"/);

assert.match(js, /run\.run_id === runId && run\.project_root === mockLastProject/);
assert.match(js, /run\.project_root === mockLastProject && run\.error_message/);
assert.match(js, /function runProblemRepairMockProbe\(fileProblem, consoleProblem\)/);
for (const evidence of [
  "foreign_project_blocked",
  "stale_source_blocked",
  "failed_request_recovered",
  "project_switch_blocked",
  "source_unchanged_before_accept",
]) assert.ok(js.includes(evidence), `${evidence} preview evidence must exist`);
assert.match(js, /previewParams\.get\("state"\) === "repair-probe"/);
assert.match(js, /repair_probe: state\.problemRepairPreviewProbe/);

console.log("Problems Agent repair R2 contract checks passed.");

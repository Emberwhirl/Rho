import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "desktop", "dist", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "desktop", "dist", "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "desktop", "dist", "app.js"), "utf8");

assert.match(html, /id="agentModeControl" class="agent-mode-disclosure"/);
assert.match(
  html,
  /id="postureSwitcher"[\s\S]*data-posture="human"[\s\S]*data-posture="agent"/,
  "Posture must be an explicit Human/Agent segmented choice",
);
assert.doesNotMatch(html, /id="postureLabel"/);
assert.match(html, /data-agent-surface="direct"[^>]*>Task<\/button>/);
assert.match(html, /data-agent-surface="monitor"[^>]*>Runs<\/button>/);
assert.match(html, /id="agentTimeline"[\s\S]*id="projectSkillsPanel"/);
assert.match(
  html,
  /id="agentModeControl"[\s\S]*data-agent-mode="ask"[\s\S]*data-agent-mode="plan"[\s\S]*data-agent-mode="act"/,
  "Ask/Plan/Act must remain available inside the advanced mode control",
);
assert.match(html, /class="act-authorization hidden"/);
assert.match(html, /id="agentInput"[^>]*aria-label="Ask Rho"/);
assert.match(html, /<details id="projectSkillsPanel"/);
assert.match(html, /id="agentFileSurfaceClose"[^>]*aria-label="Close file and return to Task"/);
assert.match(html, /id="agentReviewWorkspace"[^>]*aria-label="Review work surface"/);
assert.match(html, /id="agentReviewSurfaceClose"[^>]*aria-label="Close review and return to Task"/);

assert.match(css, /body\.agent-posture \.work-modes\s*\{\s*display:\s*none/);
assert.match(css, /body\.agent-posture \.menu\s*\{\s*display:\s*none/);
assert.match(css, /\.app-shell\.agent-first \.context-tabs\s*\{\s*display:\s*none/);
assert.match(css, /\.app-shell\.agent-first \.agent-composer-resize\s*\{\s*display:\s*none/);
assert.match(css, /\.app-shell\.agent-first \.agent-composer\s*\{[^}]*flex-basis:\s*128px/);
assert.match(css, /\.app-shell\.agent-first \.workspace\s*\{[^}]*display:\s*none/);
assert.match(css, /\.app-shell\.agent-first \.execution-dock,[\s\S]*display:\s*none/);
assert.match(css, /\.app-shell\.agent-first\.agent-work-file \.workspace\s*\{[^}]*display:\s*grid/);
assert.match(css, /\.app-shell\.agent-first\.agent-work-review \.agent-review-workspace\s*\{[^}]*display:\s*flex/);
assert.match(css, /\.agent-mode-popover\s*\{[^}]*position:\s*absolute/);
assert.match(css, /@media \(max-width: 960px\)[\s\S]*\.app-shell\.agent-first \.sidebar,\s*\.app-shell\.agent-first\.has-task-rail \.sidebar\s*\{\s*display:\s*none/);

assert.match(js, /function syncAgentModeControl\(\)/);
assert.match(js, /const label = prettyAgentMode\(state\.agentMode\)/);
assert.match(js, /state\.agentMode !== "act"/);
assert.match(
  js,
  /\$\$\("\[data-agent-mode\]"\)\.forEach\(\(button\) => button\.addEventListener\("click", \(\) => \{\s*state\.agentMode = button\.dataset\.agentMode;\s*syncAgentComposerState\(\);/,
  "Changing Agent mode must resynchronize the Act authorization enabled state",
);
assert.doesNotMatch(
  js,
  /state\.agentMode = button\.dataset\.agentMode;\s*\$\$\("\[data-agent-mode\]"\)[\s\S]{0,240}syncAgentModeControl\(\)/,
  "Mode selection must not update only the label while leaving authorization disabled",
);
assert.match(js, /document\.body\.classList\.toggle\("agent-posture", isAgent\)/);
assert.match(js, /agentActivityExpanded:\s*new Set\(\)/);
assert.match(js, /Show"\}\s*activity/);
assert.match(js, /state\.agentActivityExpanded\.has\(turn\.turn_id\)/);
assert.match(js, /\$\$\('\[data-posture\]'\)/);
assert.doesNotMatch(js, /function togglePosture\(/);
assert.match(js, /function startNewAgentTask\(\)/);
assert.match(js, /async function loadAgentData\(\{ quiet = false \} = \{\}\)/);
assert.match(js, /loadAgentData\(\{ quiet: true \}\)/);
assert.match(js, /function isStaleInformationError\(error\)/);
assert.match(js, /agentWorkSurface:\s*"none"/);
assert.match(js, /agentReviewRunId:\s*null/);
assert.match(js, /function openAgentWorkSurface\(kind\)/);
assert.match(js, /function closeAgentWorkSurface\(\)/);
assert.match(js, /async function hydrateProject\(response\)[\s\S]*state\.agentWorkSurface = "none";[\s\S]*state\.auditResult = null;[\s\S]*applyPostureLayout\(\);\s*\n}/);
assert.match(js, /openDocument\(entry\.path, \{ sessionEntry: entry, revealWorkSurface: false \}\)/);
assert.match(js, /openAgentWorkSurface\("audit"\)/);
assert.match(js, /openAgentWorkSurface\("file"\)/);
assert.match(js, /state\.agentReviewRunId = run\.run_id;[\s\S]*openAgentWorkSurface\("run"\)/);
assert.match(js, /document\.createElement\("button"\)/);
assert.match(js, /\$\("#agentInput"\)\.focus\(\)/);
assert.doesNotMatch(js, /\$\("#agentComposer"\)\.focus\(\)/);
assert.match(js, /scenario === "agent-first-direct"/);
assert.match(js, /previewState === "file"/);
assert.match(js, /previewState === "run" \|\| previewState === "artifact"/);
assert.match(js, /previewState === "audit" \|\| previewState === "audit-failure"/);

console.log("Agent-first UI contract checks passed.");

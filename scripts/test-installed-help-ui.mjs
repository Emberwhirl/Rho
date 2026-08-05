import fs from "node:fs";
import assert from "node:assert/strict";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");
const html = fs.readFileSync("desktop/dist/index.html", "utf8");

assert.match(js, /editor_function_documentation/);
assert.match(js, /previewParams\.get\("locationState"\)/);
assert.match(js, /previewParams\.get\("preview"\) === "local-help"/);
assert.match(js, /scenario === "installed-help"/);
assert.match(js, /const views = \["overview", "arguments", "examples", "vignettes"\]/);
assert.match(js, /code\.textContent = record\.example\.code/);
assert.match(js, /run\.disabled = !record\.example\.executable/);
assert.match(js, /title: "Run reviewed Help example"/);
assert.match(js, /ordinary R code may change the Workspace/i);
assert.match(js, /code: example\.code,[\s\S]+type: "help_example"/);
assert.match(js, /state\.runs\.filter\(\(run\) => run\.execution_mode === "help_example"\)/);
assert.match(js, /function executionHelpTarget\(response\)/);
assert.match(js, /request\.type === "console" \? executionHelpTarget\(response\) : null;[\s\S]+await showLocalHelp\(helpTarget\.topic, helpTarget\.package\)/);
assert.match(js, /function mockConsoleHelpTarget\(code\)/);
assert.match(js, /help: helpTarget/);
assert.match(js, /scenario === "console-help"/);
assert.match(js, /"installed-help", "console-help", "project-references"/);
assert.equal([...js.matchAll(/"installed-help", "console-help", "project-references"/g)].length, 2);
assert.match(js, /run_recorded: Boolean\(helpRun\)/);
assert.match(js, /#consoleOutput \.terminal-entry\.command/);
assert.match(html, /app\.js[^"\n]+help=console-v3/);
assert.match(css, /\.installed-help-example[\s\S]+overflow: auto/);
assert.match(css, /\.installed-help-section p[^}]+overflow-wrap: anywhere/);
assert.doesNotMatch(js, /installedHelp[^\n]+innerHTML/);

console.log("Installed Help UI contract checks passed.");

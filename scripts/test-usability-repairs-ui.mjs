import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const js = read("desktop", "dist", "app.js");
const css = read("desktop", "dist", "styles.css");

assert.match(js, /function problemSourceKind\(problem\)/);
assert.match(js, /sourcePath === "<console>"/);
assert.match(js, /\^<\[\^<>\]\+>\$/);
assert.match(js, /file\.path === sourcePath/);
assert.match(js, /sourceKind === "console" \? "Open Console" : "Go to source"/);
assert.match(js, /unavailable\.textContent = "Source unavailable"/);
assert.match(js, /switchDockTab\("console"\);[\s\S]*consoleInput/);
assert.match(js, /scenario === "usability-problems"/);
assert.match(js, /"usability-problems"\]\.includes\(scenario\)/);
assert.match(css, /\.problem-source-unavailable/);

console.log("Usability repair UI contract checks passed.");

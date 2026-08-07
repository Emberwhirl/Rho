import fs from "node:fs";
import assert from "node:assert/strict";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const start = js.indexOf("async function requestRenameSymbol");
const end = js.indexOf("\nasync function requestExtractFunction", start);
assert.ok(start >= 0 && end > start);
const source = js.slice(start, end);

assert.match(source, /let newName = options\.newName \|\| await promptRefactorName/);
assert.match(source, /const proposal = await buildRenameRefactorProposal\(oldName, newName\)/);
assert.match(source, /openRefactorReview\(proposal, "review", returnFocus\)/);
assert.doesNotMatch(source, /openRefactorReview\(null, "loading"/);
assert.match(source, /title: "Rename symbol - try again"/);
assert.match(source, /defaultValue: newName/);
assert.match(source, /userFacingError\(error, `Rename \$\{oldName\} could not be prepared\.`\)/);
assert.match(source, /state\.refactor\.proposal = null/);
assert.match(source, /if \(!newName\)/);

console.log("Editor rename recovery UI contract checks passed.");

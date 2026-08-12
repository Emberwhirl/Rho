import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");
const spec = fs.readFileSync(
  "docs/plans/active-2026-08-06-file-proposal-collapse-spec.md",
  "utf8",
);

assert.match(spec, /FPC-2 File Proposal Scroll Stability/);
assert.match(spec, /may not replace unchanged preview text or\s+revoke the user's Before, After, or outer disclosure reading position/);

const helperStart = js.indexOf("function setScrollableTextContent(");
const helperEnd = js.indexOf("\nfunction renderFileEditPanel", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "scroll-preserving text helper must exist");

const context = {};
vm.runInNewContext(`${js.slice(helperStart, helperEnd)}\nthis.setText = setScrollableTextContent;`, context);

function createScrollableText({ text = "before", top = 40, left = 7 } = {}) {
  let value = text;
  let assignments = 0;
  const element = {
    scrollTop: top,
    scrollLeft: left,
    scrollHeight: 300,
    clientHeight: 100,
    scrollWidth: 240,
    clientWidth: 120,
  };
  Object.defineProperty(element, "textContent", {
    get: () => value,
    set: (next) => {
      assignments += 1;
      value = next;
      // Match the browser behavior that exposed the regression.
      element.scrollTop = 0;
      element.scrollLeft = 0;
    },
  });
  element.assignmentCount = () => assignments;
  return element;
}

const unchanged = createScrollableText({ text: "same proposal", top: 73, left: 11 });
assert.equal(context.setText(unchanged, "same proposal"), false);
assert.equal(unchanged.assignmentCount(), 0, "unchanged proposal text must not replace its text node");
assert.equal(unchanged.scrollTop, 73);
assert.equal(unchanged.scrollLeft, 11);

const updatedSameProposal = createScrollableText({ text: "old projection", top: 88, left: 13 });
assert.equal(context.setText(updatedSameProposal, "truthful new projection"), true);
assert.equal(updatedSameProposal.scrollTop, 88, "same-proposal truth updates retain vertical reading position");
assert.equal(updatedSameProposal.scrollLeft, 13, "same-proposal truth updates retain horizontal reading position");

const newProposal = createScrollableText({ text: "old proposal", top: 96, left: 17 });
assert.equal(context.setText(newProposal, "new proposal", { reset: true }), true);
assert.equal(newProposal.scrollTop, 0, "a different proposal starts at the beginning");
assert.equal(newProposal.scrollLeft, 0);

const renderSource = js.slice(
  js.indexOf("function renderFileEditPanel()"),
  js.indexOf("\nasync function verifyFileEditUndo", js.indexOf("function renderFileEditPanel()")),
);
assert.match(renderSource, /const panelViewport = proposalChanged\s*\? null\s*:\s*\{ top: panel\.scrollTop, left: panel\.scrollLeft \}/);
assert.match(renderSource, /setScrollableTextContent\(\s*\$\("#fileEditBefore"\),[\s\S]*?\{ reset: proposalChanged \},\s*\);/);
assert.match(renderSource, /setScrollableTextContent\(\s*\$\("#fileEditAfter"\),[\s\S]*?\{ reset: proposalChanged \},\s*\);/);
assert.match(renderSource, /panel\.scrollTop = panelViewport\.top/);
assert.match(renderSource, /panel\.scrollLeft = panelViewport\.left/);

assert.match(css, /\.file-edit-panel\[open\][^}]*overscroll-behavior:\s*contain/);
assert.match(css, /\.file-edit-diff pre[^}]*overscroll-behavior:\s*contain/);

console.log("File proposal scroll stability contract checks passed.");

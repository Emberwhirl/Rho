import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("desktop/dist/index.html", "utf8");
const css = fs.readFileSync("desktop/dist/styles.css", "utf8");
const js = fs.readFileSync("desktop/dist/app.js", "utf8");
const project = fs.readFileSync("desktop/src-tauri/src/project.rs", "utf8");
const main = fs.readFileSync("desktop/src-tauri/src/main.rs", "utf8");

assert.match(html, /id="viewerRegion" class="viewer-region hidden"/);
assert.match(html, /id="viewerSourcePane"/);
assert.match(html, /id="viewerPreviewPane"/);
assert.match(html, /data-viewer-mode="both"/);
assert.match(html, />Outputs <span id="plotCount"/);
assert.match(html, /id="artifactOpenViewerButton"/);
assert.match(html, /vendor\/viewer\/marked\.umd\.js/);
assert.match(html, /vendor\/viewer\/purify\.min\.js/);
assert.match(html, /vendor\/viewer\/papaparse\.min\.js/);

assert.match(project, /MAX_VIEWER_FILE_BYTES: u64 = 4 \* 1024 \* 1024/);
assert.match(project, /pub fn read_viewer_file\(root: &Path, relative: &str\)/);
assert.match(project, /"rho\.viewer_file\.v1"/);
assert.match(project, /"html" => "text\/html"/);
assert.match(project, /"md" => "text\/markdown"/);
assert.match(project, /"csv" => "text\/csv"/);
assert.match(project, /"tsv" => "text\/tab-separated-values"/);
assert.match(main, /viewer_read_file/);

assert.match(js, /function viewerSafeMarkdown\(content\)/);
assert.match(js, /window\.DOMPurify\.sanitize/);
assert.match(js, /FORBID_TAGS: \["script", "style", "iframe", "object", "embed", "form", "base", "meta"\]/);
assert.match(js, /frame\.setAttribute\("sandbox", "allow-scripts"\)/);
assert.doesNotMatch(js, /sandbox", "allow-scripts allow-same-origin/);
assert.match(js, /connect-src 'none'/);
assert.match(js, /function viewerRenderTable\(content, extension\)/);
assert.match(js, /window\.Papa\.parse/);
assert.match(js, /VIEWER_TABLE_ROW_LIMIT = 500/);
assert.match(js, /VIEWER_TABLE_COLUMN_LIMIT = 100/);
assert.match(js, /result\.project_root !== state\.project\.root/);
assert.match(js, /function openViewerForActiveDocument\(\)/);
assert.match(js, /function findCompletedRenderArtifact\(job\)/);
assert.match(js, /artifact_\$\{job\.job_id\}_render/);
assert.match(js, /if \(activeDocumentCanRender\(\)\)/);
assert.match(js, /Preview Active Document/);

assert.match(css, /\.workspace\.viewer-open \.editor-region \{ display: none; \}/);
assert.match(css, /\.viewer-body \{ display: grid; grid-template-columns:/);
assert.match(css, /\.workspace\.viewer-open \.viewer-region\.viewer-mode-preview/);
assert.match(css, /@media \(max-width: 960px\)[\s\S]*\.viewer-body \{ grid-template-columns: minmax\(0, 1fr\); \}/);

console.log("Outputs Viewer UI contract checks passed.");

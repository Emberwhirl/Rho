import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

async function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

function run(root, scriptName) {
  return spawnSync(process.execPath, [path.join(root, "scripts", scriptName)], {
    cwd: root,
    encoding: "utf8",
  });
}

async function fixture(scriptName) {
  const root = await mkdtemp(path.join(tmpdir(), "rho-vendor-license-sync-"));
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await copyFile(path.join(repositoryRoot, "scripts", scriptName), path.join(root, "scripts", scriptName));
  return root;
}

async function testMonaco() {
  const root = await fixture("sync-monaco-assets.mjs");
  try {
    await write(root, "desktop/node_modules/monaco-editor/min/vs/loader.js", "monaco fixture\n");
    await write(root, "desktop/dist/vendor/monaco/sentinel.txt", "preserve on failure\n");

    const rejected = run(root, "sync-monaco-assets.mjs");
    assert.notEqual(rejected.status, 0, "Monaco sync must reject a missing upstream license");
    assert.match(rejected.stderr, /Monaco license was not found/u);
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/monaco/sentinel.txt"), "utf8"),
      "preserve on failure\n",
      "Monaco rejection must preserve the previous checked-in payload",
    );

    await write(root, "desktop/node_modules/monaco-editor/LICENSE", "monaco license fixture\n");
    const recovered = run(root, "sync-monaco-assets.mjs");
    assert.equal(recovered.status, 0, recovered.stderr);
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/monaco/LICENSE"), "utf8"),
      "monaco license fixture\n",
    );
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/monaco/vs/loader.js"), "utf8"),
      "monaco fixture\n",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function populateViewerFixture(root) {
  const files = [
    ["marked/lib/marked.umd.js", "marked fixture\n"],
    ["marked/LICENSE", "marked license fixture\n"],
    ["dompurify/dist/purify.min.js", "dompurify fixture\n"],
    ["dompurify/LICENSE", "dompurify license fixture\n"],
    ["papaparse/papaparse.min.js", "papaparse fixture\n"],
    ["papaparse/LICENSE", "papaparse license fixture\n"],
    ["katex/dist/katex.min.js", "katex fixture\n"],
    ["katex/dist/contrib/auto-render.min.js", "auto-render fixture\n"],
    ["katex/dist/katex.min.css", "katex css fixture\n"],
    ["katex/dist/fonts/fixture.woff2", "font fixture\n"],
  ];
  for (const [relativePath, content] of files) {
    await write(root, path.join("desktop/node_modules", relativePath), content);
  }
}

async function testViewer() {
  const root = await fixture("sync-viewer-assets.mjs");
  try {
    await populateViewerFixture(root);
    await write(root, "desktop/dist/vendor/viewer/sentinel.txt", "preserve on failure\n");

    const rejected = run(root, "sync-viewer-assets.mjs");
    assert.notEqual(rejected.status, 0, "Viewer sync must reject a missing KaTeX license");
    assert.match(rejected.stderr, /katex[/\\]LICENSE/u);
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/viewer/sentinel.txt"), "utf8"),
      "preserve on failure\n",
      "Viewer rejection must preserve the previous checked-in payload",
    );

    await write(root, "desktop/node_modules/katex/LICENSE", "katex license fixture\n");
    const recovered = run(root, "sync-viewer-assets.mjs");
    assert.equal(recovered.status, 0, recovered.stderr);
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/viewer/LICENSE.katex.txt"), "utf8"),
      "katex license fixture\n",
    );
    assert.equal(
      await readFile(path.join(root, "desktop/dist/vendor/viewer/fonts/fixture.woff2"), "utf8"),
      "font fixture\n",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

await testMonaco();
await testViewer();
console.log("vendor license sync failure and recovery paths are valid");

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const desktopRoot = path.join(repoRoot, "desktop");
const targetDir = path.join(desktopRoot, "dist", "vendor", "viewer");
const assets = [
  ["marked/lib/marked.umd.js", "marked.umd.js"],
  ["marked/LICENSE", "LICENSE.marked.txt"],
  ["dompurify/dist/purify.min.js", "purify.min.js"],
  ["dompurify/LICENSE", "LICENSE.dompurify.txt"],
  ["papaparse/papaparse.min.js", "papaparse.min.js"],
  ["papaparse/LICENSE", "LICENSE.papaparse.txt"],
  ["katex/dist/katex.min.js", "katex.min.js"],
  ["katex/dist/contrib/auto-render.min.js", "katex-auto-render.min.js"],
  ["katex/dist/katex.min.css", "katex.min.css"],
];

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
for (const [source, target] of assets) {
  const sourcePath = path.join(desktopRoot, "node_modules", source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Viewer dependency asset was not found: ${sourcePath}`);
    process.exit(1);
  }
  fs.copyFileSync(sourcePath, path.join(targetDir, target));
}

const katexFontsSource = path.join(desktopRoot, "node_modules", "katex", "dist", "fonts");
const katexFontsTarget = path.join(targetDir, "fonts");
fs.mkdirSync(katexFontsTarget, { recursive: true });
for (const font of fs.readdirSync(katexFontsSource).filter((name) => name.endsWith(".woff2"))) {
  fs.copyFileSync(path.join(katexFontsSource, font), path.join(katexFontsTarget, font));
}

console.log(`Synced Viewer assets to ${targetDir}`);

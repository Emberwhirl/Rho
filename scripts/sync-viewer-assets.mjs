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
  ["katex/LICENSE", "LICENSE.katex.txt"],
];
const resolvedAssets = assets.map(([source, target]) => [
  path.join(desktopRoot, "node_modules", source),
  path.join(targetDir, target),
]);
const katexFontsSource = path.join(desktopRoot, "node_modules", "katex", "dist", "fonts");

for (const [sourcePath] of resolvedAssets) {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Viewer dependency asset was not found: ${sourcePath}`);
    process.exit(1);
  }
}
if (!fs.existsSync(katexFontsSource)) {
  console.error(`KaTeX fonts directory was not found: ${katexFontsSource}`);
  process.exit(1);
}
const katexFonts = fs.readdirSync(katexFontsSource).filter((name) => name.endsWith(".woff2"));

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
for (const [sourcePath, targetPath] of resolvedAssets) {
  fs.copyFileSync(sourcePath, targetPath);
}
const katexFontsTarget = path.join(targetDir, "fonts");
fs.mkdirSync(katexFontsTarget, { recursive: true });
for (const font of katexFonts) {
  fs.copyFileSync(path.join(katexFontsSource, font), path.join(katexFontsTarget, font));
}

console.log(`Synced Viewer assets to ${targetDir}`);

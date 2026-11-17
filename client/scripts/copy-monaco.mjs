// Copies Monaco's prebuilt files into /public so the editor is served from our own origin
// (no third-party CDN). Runs automatically on install, dev and build; output is git-ignored.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const source = "node_modules/monaco-editor/min/vs";
const target = "public/monaco/vs";

if (!existsSync(source)) {
  console.warn("[monaco] monaco-editor is not installed yet, skipping copy");
  process.exit(0);
}
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

// NOTE: do not prune files here. The loader needs monaco.contribution.js and the language
// workers; trimming saved ~1 MB and broke editor start-up.

console.log("[monaco] editor files copied to", target);

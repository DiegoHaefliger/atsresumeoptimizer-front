import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./zip.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["manifest.json", "extract.js", "page-reader.js", "no-autorun.js", "frame-reader.js", "frame-shim.js", "frame.js", "capture-error.js", "offscreen.html", "offscreen.js", "dev.js", "merge.js", "api.js", "capture.js", "background.js", "bridge.js", "popup.html", "popup.js", "icons/icon.png"];
const OUTPUT = resolve(root, "public/ats-linkedin-extension.zip");
const VERSION_OUTPUT = resolve(root, "public/ats-linkedin-extension.json");

export function packExtension() {
	const files = FILES.map((path) => ({ path, data: readFileSync(resolve(root, "extension", path)) }));
	mkdirSync(dirname(OUTPUT), { recursive: true });
	writeFileSync(OUTPUT, zip(files));
	const { version } = JSON.parse(readFileSync(resolve(root, "extension/manifest.json"), "utf8"));
	writeFileSync(VERSION_OUTPUT, JSON.stringify({ version }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	packExtension();
}

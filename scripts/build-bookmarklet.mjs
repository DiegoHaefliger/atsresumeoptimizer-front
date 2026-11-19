import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(root, "public/linkedin-reader.js");

const reader = readFileSync(resolve(root, "bookmarklet/reader.js"), "utf8");
const extract = readFileSync(resolve(root, "extension/extract.js"), "utf8").trim().replace(/;$/, "");

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, reader.replace("__EXTRACT__", () => extract));

import { execFileSync } from "node:child_process";

const baseUrl = process.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const specUrl = `${baseUrl}/v3/api-docs`;
const outFile = "src/api/generated/schema.ts";

console.log(`Gerando ${outFile} a partir de ${specUrl}...`);

execFileSync(
	"node",
	["node_modules/openapi-typescript/bin/cli.js", specUrl, "-o", outFile],
	{ stdio: "inherit" },
);

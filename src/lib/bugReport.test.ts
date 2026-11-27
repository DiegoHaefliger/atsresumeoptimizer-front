import { describe, expect, it } from "vitest";
import { bugReportUrl, publicDiagnostics } from "./bugReport";
import type { DiagnosticReport } from "./diagnosticsApi";
import type { RecentError } from "./recentErrors";

const REPORT: DiagnosticReport = {
	generatedAt: "2026-11-25T20:00:00Z",
	checks: [
		{ name: "Banco de dados", status: "OK", detail: "conectado", hint: null },
		{ name: "Conexão com Ollama (local)", status: "FAILURE", detail: "não respondeu: 192.168.1.5 recusou", hint: "Abra o Ollama." },
	],
	verdict: "1 falha.",
	text: "",
	logFileAvailable: true,
	logsFolderOpenable: true,
	sections: [
		{
			title: "Sistema",
			entries: [
				{ label: "Versão do app", value: "1.2.0", personal: false },
				{ label: "Arquivo de log", value: "/home/maria/.ats-resume-optimizer/logs/app.log", personal: true },
			],
		},
	],
};

const ERROR: RecentError = {
	at: "2026-11-25T20:01:00.000Z",
	message: "Falhou",
	errorId: "K7Q3XM2A",
	page: "/jobs",
	source: "server",
};

describe("bugReportUrl", () => {
	it("puts the diagnostics, the latest error and only public data in the issue body", () => {
		const url = new URL(bugReportUrl({ report: REPORT, recentErrors: [ERROR], userAgent: "Firefox 140" }));
		const body = url.searchParams.get("body") ?? "";

		expect(url.pathname).toBe("/DiegoHaefliger/atsresumeoptimizer/issues/new");
		expect(url.searchParams.get("template")).toBe("bug_report.md");
		expect(body).toContain('Apareceu a mensagem: "Falhou" na tela /jobs.');
		expect(body).toContain("### Código do erro\nK7Q3XM2A");
		expect(body).toContain("### Versão do app\n1.2.0");
		expect(body).toContain(
			"```text\n## Verificação\nResultado: 1 falha.\n- [OK] Banco de dados\n- [FALHA] Conexão com Ollama (local)\n\n## Sistema\n- Versão do app: 1.2.0\n\n## Erros recentes\n- 2026-11-25T20:01:00.000Z · K7Q3XM2A · /jobs · Falhou\n\n## Navegador\n- Firefox 140\n```",
		);
		expect(url.toString()).not.toContain("maria");
		expect(url.toString()).not.toContain("192.168.1.5");
	});

	it("prefers the error the user chose over the latest one", () => {
		const body = new URL(bugReportUrl({ errorId: "AAAA2222", message: "Outro", page: "/notes", recentErrors: [ERROR] }))
			.searchParams.get("body");

		expect(body).toContain("### Código do erro\nAAAA2222");
		expect(body).toContain('"Outro" na tela /notes');
	});
});

describe("publicDiagnostics", () => {
	it("says so when the server could not be reached", () => {
		expect(publicDiagnostics({})).toBe("## Sistema\n- Não foi possível consultar o servidor");
	});
});

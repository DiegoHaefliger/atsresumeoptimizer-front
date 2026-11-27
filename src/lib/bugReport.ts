import type { DiagnosticReport, ReadinessStatus } from "./diagnosticsApi";
import { PROJECT_LINKS } from "./projectLinks";
import type { RecentError } from "./recentErrors";

const TEMPLATE = "bug_report.md";
const TITLE_PREFIX = "[Bug] ";
const MAX_DIAGNOSTICS_LENGTH = 4000;
const MAX_RECENT_ERRORS = 5;
const VERSION_LABEL = "Versão do app";

export type BugReportDraft = {
	errorId?: string | null;
	message?: string | null;
	page?: string | null;
	version?: string | null;
	report?: DiagnosticReport | null;
	recentErrors?: RecentError[];
	userAgent?: string | null;
};

const STATUS_TAGS: Record<ReadinessStatus, string> = { OK: "[OK]", WARNING: "[ATENÇÃO]", FAILURE: "[FALHA]" };

function checksSection(report: DiagnosticReport): string[] {
	if (report.checks.length === 0) {
		return [];
	}
	const lines = report.checks.map((check) => `- ${STATUS_TAGS[check.status]} ${check.name}`);
	return [["## Verificação", `Resultado: ${report.verdict}`, ...lines].join("\n")];
}

function reportSections(report: DiagnosticReport): string[] {
	return report.sections.map((section) => {
		const entries = section.entries.filter((entry) => !entry.personal);
		return [`## ${section.title}`, ...entries.map((entry) => `- ${entry.label}: ${entry.value}`)].join("\n");
	});
}

function recentErrorsSection(errors: RecentError[]): string[] {
	if (errors.length === 0) {
		return [];
	}
	const lines = errors
		.slice(0, MAX_RECENT_ERRORS)
		.map((error) => `- ${error.at} · ${error.errorId ?? "sem código"} · ${error.page} · ${error.message}`);
	return [["## Erros recentes", ...lines].join("\n")];
}

export function publicDiagnostics(draft: BugReportDraft): string {
	return [
		...(draft.report ? [...checksSection(draft.report), ...reportSections(draft.report)] : ["## Sistema\n- Não foi possível consultar o servidor"]),
		...recentErrorsSection(draft.recentErrors ?? []),
		...(draft.userAgent ? [`## Navegador\n- ${draft.userAgent}`] : []),
	].join("\n\n");
}

function reportedVersion(report: DiagnosticReport | null | undefined): string | null {
	const entry = report?.sections.flatMap((section) => section.entries).find((candidate) => candidate.label === VERSION_LABEL);
	return entry?.value ?? null;
}

function issueBody(draft: BugReportDraft): string {
	const latest = draft.recentErrors?.[0];
	const message = draft.message ?? latest?.message;
	const page = draft.page ?? latest?.page;
	const diagnostics = publicDiagnostics(draft).slice(0, MAX_DIAGNOSTICS_LENGTH);
	return [
		"<!-- A issue é pública: não cole texto do currículo, chave de API, senha nem e-mail. -->",
		"### O que aconteceu?",
		message ? `Apareceu a mensagem: "${message}"${page ? ` na tela ${page}` : ""}.` : "",
		"### Passos para reproduzir\n1. \n2. \n3. ",
		"### O que você esperava que acontecesse?\n",
		`### Código do erro\n${draft.errorId ?? latest?.errorId ?? "sem código"}`,
		`### Versão do app\n${draft.version ?? reportedVersion(draft.report) ?? "não informada"}`,
		`### Informações do sistema\n\`\`\`text\n${diagnostics}\n\`\`\``,
		"### Pacote de diagnóstico e prints\n<!-- Arraste aqui o .zip baixado em Ajuda › Diagnóstico e, se puder, um print do erro. -->",
	].join("\n\n");
}

export function bugReportUrl(draft: BugReportDraft = {}): string {
	const params = new URLSearchParams({ template: TEMPLATE, title: TITLE_PREFIX, body: issueBody(draft) });
	return `${PROJECT_LINKS.newBugReport}?${params}`;
}

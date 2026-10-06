import type { BadgeTone } from "../components/Badge";

const STATUS_LABELS: Record<string, string> = {
	PRECHECK: "Verificação inicial",
	PENDING: "Na fila",
	PARSING: "Lendo currículo",
	ANALYZING: "Analisando",
	COMPLETED: "Concluída",
	PARTIAL: "Concluída parcialmente",
	FAILED: "Falhou",
	REJECTED: "Rejeitada",
};

const STATUS_TONES: Record<string, BadgeTone> = {
	PRECHECK: "info",
	PENDING: "info",
	PARSING: "info",
	ANALYZING: "info",
	COMPLETED: "success",
	PARTIAL: "warning",
	FAILED: "error",
	REJECTED: "error",
};

const MODE_LABELS: Record<string, string> = {
	JOB_MATCH: "Compatibilidade com vaga",
	GENERAL: "Avaliação geral",
};

const DIMENSION_LABELS: Record<string, string> = {
	PARSEABILITY: "Leitura pelo ATS",
	STRUCTURE_SECTIONS: "Estrutura e seções",
	CONTACT_DATA: "Dados de contato",
	KEYWORD_MATCH: "Palavras-chave da vaga",
	REQUIREMENTS_SENIORITY: "Requisitos e senioridade",
	CONTENT_QUALITY: "Qualidade do conteúdo",
	LANGUAGE: "Idioma e escrita",
};

export function dimensionLabel(code: string): string {
	return DIMENSION_LABELS[code] ?? code;
}

export function statusLabel(status: string): string {
	return STATUS_LABELS[status] ?? status;
}

export function statusTone(status: string): BadgeTone {
	return STATUS_TONES[status] ?? "neutral";
}

export function modeLabel(mode: string): string {
	return MODE_LABELS[mode] ?? mode;
}

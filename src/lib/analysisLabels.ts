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

export function statusLabel(status: string): string {
	return STATUS_LABELS[status] ?? status;
}

export function statusTone(status: string): BadgeTone {
	return STATUS_TONES[status] ?? "neutral";
}

export function modeLabel(mode: string): string {
	return MODE_LABELS[mode] ?? mode;
}

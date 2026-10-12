import type { BadgeTone } from "../components/Badge";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const SEVERITY_LABELS: Record<string, string> = {
	CRITICAL: "Crítico",
	HIGH: "Alto",
	MEDIUM: "Médio",
	LOW: "Baixo",
};

const SEVERITY_TONES: Record<string, BadgeTone> = {
	CRITICAL: "error",
	HIGH: "error",
	MEDIUM: "warning",
	LOW: "info",
};

export const MINOR_SEVERITY = "LOW";

export const URGENT_SEVERITIES = new Set(["CRITICAL", "HIGH"]);

export function severityRank(severity: string | undefined): number {
	const index = SEVERITY_ORDER.indexOf(severity ?? "");
	return index === -1 ? SEVERITY_ORDER.length : index;
}

export function severityLabel(severity: string | undefined): string {
	return SEVERITY_LABELS[severity ?? ""] ?? severity ?? "";
}

export function severityTone(severity: string | undefined): BadgeTone {
	return SEVERITY_TONES[severity ?? ""] ?? "neutral";
}

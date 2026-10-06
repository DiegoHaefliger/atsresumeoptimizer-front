import type { SelectionStage } from "../api/types";

export const STAGE_LABELS: Record<SelectionStage, string> = {
	INTERESTED: "Interessado",
	APPLIED: "Candidatado",
	SCREENING: "Triagem",
	TECHNICAL_TEST: "Teste técnico",
	TECHNICAL_INTERVIEW: "Entrevista técnica",
	MANAGER_INTERVIEW: "Entrevista com gestor",
	OFFER: "Proposta",
	HIRED: "Contratado",
	REJECTED: "Reprovado",
	WITHDRAWN: "Desistência",
};

export const STAGES = Object.keys(STAGE_LABELS) as SelectionStage[];

const dateOnlyFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function formatDate(date: string): string {
	return dateOnlyFormat.format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(instant: string): string {
	return dateTimeFormat.format(new Date(instant));
}

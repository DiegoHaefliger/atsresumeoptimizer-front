import type { SelectionProcess, SelectionStage } from "../api/types";

export const STAGE_LABELS: Record<SelectionStage, string> = {
	INTERESTED: "Interessado",
	APPLIED: "Candidatado",
	SCREENING: "Triagem",
	HR_INTERVIEW: "Entrevista RH",
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
const dayMonthFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const dayMonthTimeFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function formatDate(date: string): string {
	return dateOnlyFormat.format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(instant: string): string {
	return dateTimeFormat.format(new Date(instant));
}

export function formatDayMonth(date: Date): string {
	return dayMonthFormat.format(date);
}

export function formatDayMonthTime(date: Date): string {
	return dayMonthTimeFormat.format(date);
}

export function nextStepLabel(process: SelectionProcess): string | null {
	if (process.nextSchedule) {
		return `${formatDateTime(process.nextSchedule.scheduledAt)} - ${STAGE_LABELS[process.nextSchedule.stage]}`;
	}
	return process.nextStepOn ? formatDate(process.nextStepOn) : null;
}

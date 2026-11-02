import type { SelectionProcess } from "../api/types";
import { relativeDays, type Attention } from "./processAttention";
import { formatDayMonth, formatDayMonthTime, STAGE_LABELS } from "./processLabels";

export type AttentionCopy = { label: string; headline: string; detail: string };

export function attentionCopy(item: Attention, now: Date): AttentionCopy {
	const { process } = item;
	const stage = STAGE_LABELS[item.stage];
	const day = formatDayMonth(item.at);
	switch (item.kind) {
		case "overdue":
			return process.nextSchedule
				? { label: "Atrasada", headline: "Etapa sem registro", detail: `${stage} de ${formatDayMonthTime(item.at)}` }
				: { label: "Atrasada", headline: "Próximo passo atrasado", detail: `era ${day}` };
		case "upcoming": {
			const relative = relativeDays(item.at, now);
			return {
				label: relative.charAt(0).toUpperCase() + relative.slice(1),
				headline: `${stage} ${relative}`,
				detail: process.nextSchedule ? formatDayMonthTime(item.at) : day,
			};
		}
		case "stale":
			return process.stage === "INTERESTED"
				? { label: "Decidir", headline: "Candidatar ou descartar", detail: `desde ${day}` }
				: { label: "Follow-up", headline: "Hora do follow-up", detail: `sem retorno desde ${day}` };
	}
}

export function followUpMailto(process: SelectionProcess): string | null {
	if (!process.contactEmail) {
		return null;
	}
	const subject = `Follow-up: ${process.jobTitle ?? "processo seletivo"}`;
	return `mailto:${process.contactEmail}?subject=${encodeURIComponent(subject)}`;
}

export function firstName(fullName: string | null): string | null {
	return fullName?.trim().split(/\s+/)[0] || null;
}

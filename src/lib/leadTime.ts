export const MAX_LEAD_ENTRIES = 5;
export const MAX_LEAD_MINUTES = 43_200;

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

export type LeadUnit = "minutes" | "hours" | "days";

export const LEAD_UNIT_LABELS: Record<LeadUnit, string> = {
	minutes: "minutos",
	hours: "horas",
	days: "dias",
};

const UNIT_MINUTES: Record<LeadUnit, number> = {
	minutes: 1,
	hours: MINUTES_PER_HOUR,
	days: MINUTES_PER_DAY,
};

export function toMinutes(amount: number, unit: LeadUnit): number {
	return amount * UNIT_MINUTES[unit];
}

function plural(amount: number, singular: string, pluralForm: string): string {
	return `${amount} ${amount === 1 ? singular : pluralForm}`;
}

export function formatLead(minutes: number): string {
	if (minutes % MINUTES_PER_DAY === 0) {
		return plural(minutes / MINUTES_PER_DAY, "dia", "dias");
	}
	if (minutes % MINUTES_PER_HOUR === 0) {
		return plural(minutes / MINUTES_PER_HOUR, "hora", "horas");
	}
	return plural(minutes, "minuto", "minutos");
}

export const DEFAULT_SEARCH_CRON = "0 0 8,20 * * *";
export const CUSTOM_SCHEDULE = "custom";

export const SCHEDULE_PRESETS = [
	{ cron: "0 0 */6 * * *", label: "A cada 6 horas" },
	{ cron: "0 0 */12 * * *", label: "A cada 12 horas" },
	{ cron: DEFAULT_SEARCH_CRON, label: "Duas vezes por dia (8h e 20h)" },
	{ cron: "0 0 8 * * *", label: "Todo dia às 8h" },
	{ cron: "0 0 9 * * MON-FRI", label: "Dias úteis às 9h" },
] as const;

const CRON_FIELDS = 6;

export function presetFor(cron: string): string {
	return SCHEDULE_PRESETS.some((preset) => preset.cron === cron) ? cron : CUSTOM_SCHEDULE;
}

export function isCronShaped(cron: string): boolean {
	return cron.trim().split(/\s+/).filter(Boolean).length === CRON_FIELDS;
}

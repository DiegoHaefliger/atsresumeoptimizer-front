const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MAX_MESSAGE_LENGTH = 8000;
export const COUNTER_THRESHOLD = 7000;

export function relativeDay(instant: string | undefined, now: Date = new Date()): string {
	if (!instant) {
		return "";
	}
	const date = new Date(instant);
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	if (date.getTime() >= startOfToday) {
		return `Hoje, ${timeFormat.format(date)}`;
	}
	if (date.getTime() >= startOfToday - MS_PER_DAY) {
		return "Ontem";
	}
	return dayFormat.format(date);
}

export function isMissingProviderError(message: string): boolean {
	return message.toLowerCase().includes("provedor");
}

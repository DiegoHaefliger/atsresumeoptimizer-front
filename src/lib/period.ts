export type PeriodParts = { start: string; end: string; current: boolean };

const CURRENT_LABEL = "Atual";
const SEPARATOR = " - ";
const DISPLAY_DATE = /^(\d{2})\/(\d{4})$/;
const CURRENT_WORDS = /^(atual|atualmente|presente|present|current|hoje)$/i;
const RANGE = /^\s*(\d{2}\/\d{4})\s*[-–—]\s*(\d{2}\/\d{4}|\S+)\s*$/;

function toDisplay(month: string): string {
	const [year, monthNumber] = month.split("-");
	return year && monthNumber ? `${monthNumber}/${year}` : "";
}

function toMonth(display: string): string {
	const match = DISPLAY_DATE.exec(display);
	return match ? `${match[2]}-${match[1]}` : "";
}

export function parsePeriod(period: string | undefined): PeriodParts {
	const match = RANGE.exec(period ?? "");
	if (!match) {
		return { start: "", end: "", current: false };
	}
	const current = CURRENT_WORDS.test(match[2]);
	return { start: toMonth(match[1]), end: current ? "" : toMonth(match[2]), current };
}

export function isIncompletePeriod(period: string | undefined): boolean {
	return DISPLAY_DATE.test((period ?? "").trim());
}

export function formatPeriod({ start, end, current }: PeriodParts): string {
	const from = toDisplay(start);
	const to = current ? CURRENT_LABEL : toDisplay(end);
	return [from, to].filter(Boolean).join(SEPARATOR);
}

function monthOf(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function hasFutureDate(period: string | undefined, endFutureYears: number, now: Date = new Date()): boolean {
	const { start, end } = parsePeriod(period);
	const endLimit = endFutureYears === 0 ? monthOf(now) : `${now.getFullYear() + endFutureYears}-12`;
	return (start !== "" && start > monthOf(now)) || (end !== "" && end > endLimit);
}

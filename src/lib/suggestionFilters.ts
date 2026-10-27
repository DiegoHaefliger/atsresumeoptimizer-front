import type { JobSuggestion } from "../api/types";

export type SuggestionFilters = {
	query: string;
	source: string;
	minScore: number;
	postedWithinDays: number;
};

export const EMPTY_SUGGESTION_FILTERS: SuggestionFilters = { query: "", source: "", minScore: 0, postedWithinDays: 0 };

export const SUGGESTION_MIN_SCORES = [50, 70, 80] as const;

export const POSTED_WITHIN_OPTIONS = [
	{ days: 1, label: "Últimas 24 horas" },
	{ days: 7, label: "Últimos 7 dias" },
	{ days: 30, label: "Últimos 30 dias" },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function normalized(text: string | undefined): string {
	return (text ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("pt-BR");
}

export function hasActiveSuggestionFilters(filters: SuggestionFilters): boolean {
	return (Object.keys(EMPTY_SUGGESTION_FILTERS) as (keyof SuggestionFilters)[]).some(
		(key) => filters[key] !== EMPTY_SUGGESTION_FILTERS[key],
	);
}

export function suggestionSources(suggestions: JobSuggestion[]): string[] {
	return [...new Set(suggestions.map((item) => item.source).filter((source): source is string => Boolean(source)))].sort();
}

function postedRecently(postedOn: string | undefined, days: number, now: number): boolean {
	if (!postedOn) {
		return false;
	}
	const posted = Date.parse(`${postedOn}T00:00:00`);
	return !Number.isNaN(posted) && now - posted <= days * DAY_MS;
}

export function filterSuggestions<T extends JobSuggestion>(suggestions: T[], filters: SuggestionFilters, now = Date.now()): T[] {
	const words = normalized(filters.query).split(/\s+/).filter(Boolean);
	return suggestions.filter((item) => {
		const haystack = normalized([item.title, item.company, item.location, item.description].join(" "));
		return (
			words.every((word) => haystack.includes(word)) &&
			(!filters.source || item.source === filters.source) &&
			(filters.minScore === 0 || (item.score ?? -1) >= filters.minScore) &&
			(filters.postedWithinDays === 0 || postedRecently(item.postedOn, filters.postedWithinDays, now))
		);
	});
}

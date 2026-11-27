import type { SuggestionSort } from "./suggestionSort";

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

export const SUGGESTION_PAGE_SIZE = 30;

export const SUGGESTION_PAGE_SIZE_OPTIONS = [30, 60, 100] as const;

export type SuggestionPageRequest = {
	filters: SuggestionFilters;
	sort: SuggestionSort;
	page: number;
	size: number;
};

export function hasActiveSuggestionFilters(filters: SuggestionFilters): boolean {
	return (Object.keys(EMPTY_SUGGESTION_FILTERS) as (keyof SuggestionFilters)[]).some(
		(key) => filters[key] !== EMPTY_SUGGESTION_FILTERS[key],
	);
}

export function suggestionSearchParams({ filters, sort, page, size }: SuggestionPageRequest): URLSearchParams {
	const params = new URLSearchParams({ page: String(page), size: String(size), sort });
	const query = filters.query.trim();
	if (query) {
		params.set("query", query);
	}
	if (filters.source) {
		params.set("source", filters.source);
	}
	if (filters.minScore > 0) {
		params.set("minScore", String(filters.minScore));
	}
	if (filters.postedWithinDays > 0) {
		params.set("postedWithinDays", String(filters.postedWithinDays));
	}
	return params;
}

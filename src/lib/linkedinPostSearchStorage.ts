import {
	EMPTY_POST_SEARCH,
	fitToLimit,
	POST_DATE_LABELS,
	POST_LANGUAGE_LABELS,
	POST_SORT_LABELS,
	type PostSearch,
} from "./linkedinPostSearch";
import { WORK_MODEL_LABELS } from "./jobLabels";

const STORAGE_KEY = "ats-linkedin-post-search";

function strings(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function oneOf<T extends string>(value: unknown, options: Record<T, string>, fallback: T): T {
	return typeof value === "string" && value in options ? (value as T) : fallback;
}

function storedLocations(stored: Record<string, unknown>): string[] {
	const legacy = typeof stored.location === "string" && stored.location.trim() ? [stored.location] : [];
	return Array.isArray(stored.locations) ? strings(stored.locations) : legacy;
}

export function parsePostSearch(raw: string | null): PostSearch {
	if (!raw) {
		return EMPTY_POST_SEARCH;
	}
	try {
		const stored = JSON.parse(raw) as Record<string, unknown>;
		return fitToLimit({
			terms: strings(stored.terms),
			excluded: strings(stored.excluded),
			blockedAuthors: strings(stored.blockedAuthors),
			hiringOnly: typeof stored.hiringOnly === "boolean" ? stored.hiringOnly : EMPTY_POST_SEARCH.hiringOnly,
			language: oneOf(stored.language, POST_LANGUAGE_LABELS, EMPTY_POST_SEARCH.language),
			locations: storedLocations(stored),
			workModels: strings(stored.workModels).filter((model): model is keyof typeof WORK_MODEL_LABELS => model in WORK_MODEL_LABELS),
			datePosted: oneOf(stored.datePosted, POST_DATE_LABELS, EMPTY_POST_SEARCH.datePosted),
			sortBy: oneOf(stored.sortBy, POST_SORT_LABELS, EMPTY_POST_SEARCH.sortBy),
		});
	} catch {
		return EMPTY_POST_SEARCH;
	}
}

export function loadPostSearch(): PostSearch {
	try {
		return parsePostSearch(localStorage.getItem(STORAGE_KEY));
	} catch {
		return EMPTY_POST_SEARCH;
	}
}

export function savePostSearch(search: PostSearch) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(search));
	} catch {
		return;
	}
}

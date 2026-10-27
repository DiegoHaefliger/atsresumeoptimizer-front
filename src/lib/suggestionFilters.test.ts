import { describe, expect, it } from "vitest";
import type { JobSuggestion } from "../api/types";
import {
	EMPTY_SUGGESTION_FILTERS,
	filterSuggestions,
	hasActiveSuggestionFilters,
	suggestionSources,
} from "./suggestionFilters";

const NOW = Date.parse("2026-10-27T12:00:00");

const suggestions: JobSuggestion[] = [
	{ id: "1", source: "LINKEDIN", title: "Dev Java", company: "Acme", location: "Curitiba", score: 90, postedOn: "2026-10-26" },
	{ id: "2", source: "GUPY", title: "Desenvolvedor Kotlin", company: "Globex", location: "São Paulo", score: 60, postedOn: "2026-10-10" },
	{ id: "3", source: "GUPY", title: "Analista", company: "Initech", description: "Experiência com Java", postedOn: undefined },
];

function ids(filters: Partial<typeof EMPTY_SUGGESTION_FILTERS>) {
	return filterSuggestions(suggestions, { ...EMPTY_SUGGESTION_FILTERS, ...filters }, NOW).map((item) => item.id);
}

describe("suggestionFilters", () => {
	it("keeps everything when no filter is set", () => {
		expect(ids({})).toEqual(["1", "2", "3"]);
		expect(hasActiveSuggestionFilters(EMPTY_SUGGESTION_FILTERS)).toBe(false);
	});

	it("searches title, company, location and description ignoring accents and case", () => {
		expect(ids({ query: "sao paulo" })).toEqual(["2"]);
		expect(ids({ query: "JAVA" })).toEqual(["1", "3"]);
		expect(ids({ query: "acme curitiba" })).toEqual(["1"]);
	});

	it("filters by source", () => {
		expect(ids({ source: "GUPY" })).toEqual(["2", "3"]);
	});

	it("drops jobs without a score when a minimum is set", () => {
		expect(ids({ minScore: 70 })).toEqual(["1"]);
	});

	it("filters by publication date and drops jobs without one", () => {
		expect(ids({ postedWithinDays: 7 })).toEqual(["1"]);
		expect(ids({ postedWithinDays: 30 })).toEqual(["1", "2"]);
	});

	it("lists the distinct sources in order", () => {
		expect(suggestionSources(suggestions)).toEqual(["GUPY", "LINKEDIN"]);
	});
});

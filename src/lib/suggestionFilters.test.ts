import { describe, expect, it } from "vitest";
import { EMPTY_SUGGESTION_FILTERS, hasActiveSuggestionFilters, suggestionSearchParams } from "./suggestionFilters";

describe("suggestionFilters", () => {
	it("knows when no filter is set", () => {
		expect(hasActiveSuggestionFilters(EMPTY_SUGGESTION_FILTERS)).toBe(false);
		expect(hasActiveSuggestionFilters({ ...EMPTY_SUGGESTION_FILTERS, source: "GUPY" })).toBe(true);
	});

	it("sends only page, size and sort when no filter is set", () => {
		const params = suggestionSearchParams({ filters: EMPTY_SUGGESTION_FILTERS, sort: "SCORE_DESC", page: 0, size: 30 });
		expect(params.toString()).toBe("page=0&size=30&sort=SCORE_DESC");
	});

	it("sends every active filter with the trimmed search text", () => {
		const params = suggestionSearchParams({
			filters: { query: "  java remoto ", source: "GUPY", minScore: 70, postedWithinDays: 7 },
			sort: "POSTED_DESC",
			page: 2,
			size: 60,
		});
		expect(params.toString()).toBe("page=2&size=60&sort=POSTED_DESC&query=java+remoto&source=GUPY&minScore=70&postedWithinDays=7");
	});
});

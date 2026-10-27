import { describe, expect, it } from "vitest";
import type { LinkedInSectionReviewResponse } from "../api/linkedinTypes";
import { scoreDelta, sortedByPriority, weakestFirst } from "./linkedinSections";

function review(section: LinkedInSectionReviewResponse["section"], score: number): LinkedInSectionReviewResponse {
	return { section, score, diagnosis: "", suggestions: [] };
}

describe("linkedinSections", () => {
	it("lists the weakest sections first without mutating the input", () => {
		const sections = [review("ABOUT", 80), review("HEADLINE", 30), review("SKILLS", 55)];

		expect(weakestFirst(sections).map((item) => item.section)).toEqual(["HEADLINE", "SKILLS", "ABOUT"]);
		expect(sections[0].section).toBe("ABOUT");
	});

	it("orders suggestions from high to low priority", () => {
		const sorted = sortedByPriority({
			...review("ABOUT", 50),
			suggestions: [
				{ priority: "LOW", text: "c" },
				{ priority: "HIGH", text: "a" },
				{ priority: "MEDIUM", text: "b" },
			],
		});

		expect(sorted.map((item) => item.text)).toEqual(["a", "b", "c"]);
	});

	it("computes the score change only when there is a previous analysis", () => {
		expect(scoreDelta(70, 55)).toBe(15);
		expect(scoreDelta(40, 55)).toBe(-15);
		expect(scoreDelta(70, undefined)).toBeNull();
	});
});

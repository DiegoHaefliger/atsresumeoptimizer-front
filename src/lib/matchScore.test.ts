import { describe, expect, it } from "vitest";
import { matchDescription, matchScore } from "./matchScore";

describe("matchScore", () => {
	it("averages the scores the job has", () => {
		expect(matchScore({ preferenceScore: 80, atsScore: 75 }).score).toBe(78);
		expect(matchScore({ preferenceScore: null, atsScore: 64 }).score).toBe(64);
		expect(matchScore({}).score).toBeNull();
	});

	it("describes the combined score and each part", () => {
		expect(matchDescription(matchScore({ preferenceScore: 90, atsScore: 70 }))).toBe(
			"Compatibilidade 80% · Aderência 90 · Nota ATS 70",
		);
		expect(matchDescription(matchScore({ preferenceScore: 40 }))).toBe(
			"Compatibilidade 40% · Aderência 40 · Nota ATS sem nota",
		);
	});
});

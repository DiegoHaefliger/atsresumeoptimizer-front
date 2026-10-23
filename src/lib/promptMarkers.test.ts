import { describe, expect, it } from "vitest";
import { markersOf, missingMarkers } from "./promptMarkers";

describe("promptMarkers", () => {
	it("lists each marker once, ignoring inner spaces", () => {
		expect(markersOf("{{resumeText}} e {{ jobText }} e {{resumeText}}")).toEqual(["{{resumeText}}", "{{jobText}}"]);
	});

	it("returns nothing for text without markers", () => {
		expect(markersOf("sem marcadores { assim }")).toEqual([]);
	});

	it("reports markers that disappeared from the edited text", () => {
		expect(missingMarkers("{{a}} {{b}} {{c}}", "{{a}} só")).toEqual(["{{b}}", "{{c}}"]);
	});

	it("reports nothing when every marker is still there", () => {
		expect(missingMarkers("{{a}} {{b}}", "{{b}} {{a}} extra")).toEqual([]);
	});
});

import { describe, expect, it } from "vitest";
import { canSubmit, EMPTY_DRAFT, toRequest } from "./feedbackForm";

describe("canSubmit", () => {
	it("needs a rating from 1 to 5 and nothing else", () => {
		expect(canSubmit(EMPTY_DRAFT)).toBe(false);
		expect(canSubmit({ ...EMPTY_DRAFT, rating: 3 })).toBe(true);
	});
});

describe("toRequest", () => {
	it("trims text and turns empty fields into null", () => {
		expect(toRequest({ ...EMPTY_DRAFT, rating: 5, message: "  ótimo  ", contact: " " }, "1.4.0")).toEqual({
			rating: 5,
			message: "ótimo",
			contact: null,
			appVersion: "1.4.0",
		});
	});
});

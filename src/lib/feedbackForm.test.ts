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
			allowPublish: false,
			appVersion: "1.4.0",
		});
	});

	it("only keeps the publish consent when there is a comment to publish", () => {
		const draft = { ...EMPTY_DRAFT, rating: 5, allowPublish: true };
		expect(toRequest(draft, null).allowPublish).toBe(false);
		expect(toRequest({ ...draft, message: "gostei" }, null).allowPublish).toBe(true);
	});
});

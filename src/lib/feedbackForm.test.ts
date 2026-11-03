import { describe, expect, it } from "vitest";
import { canSubmit, EMPTY_DRAFT, toRequest } from "./feedbackForm";

describe("canSubmit", () => {
	it("needs a rating from 1 to 5", () => {
		expect(canSubmit(EMPTY_DRAFT)).toBe(false);
		expect(canSubmit({ ...EMPTY_DRAFT, rating: 3 })).toBe(true);
	});

	it("needs text unless it is only a general comment", () => {
		const suggestion = { ...EMPTY_DRAFT, rating: 4, kind: "SUGGESTION" as const };
		expect(canSubmit({ ...suggestion, messages: { ...EMPTY_DRAFT.messages, SUGGESTION: "   " } })).toBe(false);
		expect(canSubmit({ ...suggestion, messages: { ...EMPTY_DRAFT.messages, SUGGESTION: "Exportar em Word" } })).toBe(true);
	});
});

describe("toRequest", () => {
	it("sends only the text of the selected tab", () => {
		const messages = { ...EMPTY_DRAFT.messages, SUGGESTION: "ideia", IMPROVEMENT: "ajuste" };
		expect(toRequest({ ...EMPTY_DRAFT, rating: 4, kind: "IMPROVEMENT", messages }, null).message).toBe("ajuste");
	});

	it("trims text and turns empty fields into null", () => {
		expect(toRequest({ ...EMPTY_DRAFT, rating: 5, messages: { ...EMPTY_DRAFT.messages, GENERAL: "  ótimo  " }, contact: " " }, "1.4.0")).toEqual({
			kind: "GENERAL",
			rating: 5,
			message: "ótimo",
			contact: null,
			allowPublish: false,
			appVersion: "1.4.0",
		});
	});

	it("only keeps the publish consent on testimonials", () => {
		const draft = { ...EMPTY_DRAFT, rating: 5, messages: { ...EMPTY_DRAFT.messages, SUGGESTION: "x", TESTIMONIAL: "x" }, allowPublish: true };
		expect(toRequest({ ...draft, kind: "SUGGESTION" }, null).allowPublish).toBe(false);
		expect(toRequest({ ...draft, kind: "TESTIMONIAL" }, null).allowPublish).toBe(true);
	});
});

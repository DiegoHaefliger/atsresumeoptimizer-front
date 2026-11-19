import { describe, expect, it } from "vitest";
import { busyText } from "./WaitingForCapture";

describe("busyText", () => {
	it("says what is being read instead of counting pages", () => {
		expect(busyText({ kind: "capturing", progress: { step: 4, total: 9, page: "skills" } })).toBe("Lendo as competências...");
		expect(busyText({ kind: "capturing", progress: { step: 5, total: 9, page: "certifications" } })).toBe("Procurando certificações...");
	});

	it("falls back to a generic message for an unknown page", () => {
		expect(busyText({ kind: "capturing", progress: { step: 2, total: 9, page: "novidade" } })).toBe("Lendo o seu perfil no LinkedIn...");
	});

	it("keeps the opening message before the first progress", () => {
		expect(busyText({ kind: "capturing", progress: null })).toBe("Abrindo o LinkedIn...");
	});
});

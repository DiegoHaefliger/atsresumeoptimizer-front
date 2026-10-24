import { describe, expect, it } from "vitest";
import { openLinkLabel, sourceLabel } from "./suggestionLabels";

describe("suggestionLabels", () => {
	it("names the origin of a suggestion", () => {
		expect(sourceLabel("LINKEDIN")).toBe("LinkedIn");
		expect(sourceLabel("LINKEDIN_POST")).toBe("Postagem do LinkedIn");
		expect(sourceLabel(undefined)).toBe("LinkedIn");
	});

	it("labels the external link by origin", () => {
		expect(openLinkLabel("LINKEDIN_POST")).toBe("Abrir postagem");
		expect(openLinkLabel("LINKEDIN")).toBe("Abrir no LinkedIn");
	});
});

import { describe, expect, it } from "vitest";
import { shouldPrompt } from "./feedbackPrompt";

describe("shouldPrompt", () => {
	it("asks on every start until the person rates this version", () => {
		expect(shouldPrompt("1.4.0", null, false)).toBe(true);
		expect(shouldPrompt("1.4.0", "1.3.0", false)).toBe(true);
		expect(shouldPrompt("1.4.0", "1.4.0", false)).toBe(false);
	});

	it("does not interrupt another open dialog", () => {
		expect(shouldPrompt("1.4.0", null, true)).toBe(false);
	});

	it("still asks when the version is unknown and nothing was rated", () => {
		expect(shouldPrompt(null, null, false)).toBe(true);
	});
});

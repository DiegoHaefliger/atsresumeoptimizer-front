import { describe, expect, it } from "vitest";
import { CUSTOM_SCHEDULE, DEFAULT_SEARCH_CRON, isCronShaped, presetFor } from "./searchSchedule";

describe("searchSchedule", () => {
	it("recognizes a preset by its expression", () => {
		expect(presetFor(DEFAULT_SEARCH_CRON)).toBe(DEFAULT_SEARCH_CRON);
		expect(presetFor("0 0 */6 * * *")).toBe("0 0 */6 * * *");
	});

	it("treats any other expression as custom", () => {
		expect(presetFor("0 15 10 * * *")).toBe(CUSTOM_SCHEDULE);
	});

	it("checks that the expression has six fields", () => {
		expect(isCronShaped("0 0 8 * * *")).toBe(true);
		expect(isCronShaped("  0  0 8 * * MON-FRI ")).toBe(true);
		expect(isCronShaped("0 8 * * *")).toBe(false);
		expect(isCronShaped("")).toBe(false);
	});
});

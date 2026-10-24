import { describe, expect, it } from "vitest";
import { describeLastRun } from "./searchRunLabels";

describe("describeLastRun", () => {
	it("says nothing ran yet", () => {
		expect(describeLastRun(undefined)).toBe("Nenhuma busca feita ainda.");
	});

	it("summarizes the counters of the last run", () => {
		const text = describeLastRun({
			trigger: "MANUAL",
			finishedAt: "2026-10-24T12:00:00Z",
			read: 20,
			added: 4,
			duplicates: 10,
			belowAdherence: 6,
		});
		expect(text).toContain("manual");
		expect(text).toContain("20 lidas · 4 novas · 10 repetidas · 6 abaixo da aderência");
	});

	it("tells the scheduled runs apart", () => {
		expect(describeLastRun({ trigger: "SCHEDULED", finishedAt: "2026-10-24T12:00:00Z" })).toContain("agendada");
	});
});

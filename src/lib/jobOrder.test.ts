import { describe, expect, it } from "vitest";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { byProcessStage, jobGroup } from "./jobOrder";
import type { Job } from "./useJobs";

function job(id: string, registeredAt = "2026-10-01"): Job {
	return { id, registeredAt } as Job;
}

function processes(stages: Record<string, SelectionStage>): Map<string, SelectionProcess> {
	return new Map(Object.entries(stages).map(([jobId, stage]) => [jobId, { jobPostingId: jobId, stage } as SelectionProcess]));
}

describe("jobGroup", () => {
	it("splits jobs into active, without process and closed", () => {
		const byJob = processes({ a: "TECHNICAL_INTERVIEW", b: "INTERESTED", c: "REJECTED", d: "HIRED" });
		expect(jobGroup(job("a"), byJob)).toBe("active");
		expect(jobGroup(job("b"), byJob)).toBe("active");
		expect(jobGroup(job("x"), byJob)).toBe("none");
		expect(jobGroup(job("c"), byJob)).toBe("closed");
		expect(jobGroup(job("d"), byJob)).toBe("closed");
	});
});

describe("byProcessStage", () => {
	it("puts advanced stages first and closed processes last", () => {
		const byJob = processes({ a: "APPLIED", b: "OFFER", c: "REJECTED" });
		const sorted = [job("c"), job("x"), job("a"), job("b")].sort(byProcessStage(byJob)).map((item) => item.id);
		expect(sorted).toEqual(["b", "a", "x", "c"]);
	});
});

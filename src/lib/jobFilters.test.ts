import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, filterJobs } from "./jobFilters";
import type { Job } from "./useJobs";

function job(id: string, preferenceScore: number | undefined, atsScore: number | undefined): Job {
	return { id, code: 1, preferenceScore, atsScore } as Job;
}

describe("filterJobs", () => {
	it("filters by the combined compatibility score", () => {
		const jobs = [job("both", 90, 70), job("low", 60, 50), job("ats-only", undefined, 85), job("none", undefined, undefined)];
		const ids = filterJobs(jobs, { ...EMPTY_FILTERS, minMatch: 80 }).map((item) => item.id);
		expect(ids).toEqual(["both", "ats-only"]);
	});
});

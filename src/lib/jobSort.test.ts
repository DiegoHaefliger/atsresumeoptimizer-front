import { describe, expect, it } from "vitest";
import type { SelectionProcess } from "../api/types";
import { jobComparator, type JobSort } from "./jobSort";
import type { Job } from "./useJobs";

const jobs = [
	{ id: "a", registeredAt: "2026-11-01", preferenceScore: 50, atsScore: 90 },
	{ id: "b", registeredAt: "2026-11-20", preferenceScore: 80, atsScore: 40 },
	{ id: "c", registeredAt: "2026-11-10" },
] as Job[];

const processes = new Map([["c", { jobPostingId: "c", stage: "OFFER" } as SelectionProcess]]);

function ids(sort: JobSort) {
	return [...jobs].sort(jobComparator(sort, processes)).map((job) => job.id);
}

describe("jobComparator", () => {
	it("keeps the process stage order by default", () => {
		expect(ids("stage")).toEqual(["c", "b", "a"]);
	});

	it("orders by registration date", () => {
		expect(ids("newest")).toEqual(["b", "c", "a"]);
		expect(ids("oldest")).toEqual(["a", "c", "b"]);
	});

	it("orders by score with unscored jobs last", () => {
		expect(ids("preference")).toEqual(["b", "a", "c"]);
		expect(ids("ats")).toEqual(["a", "b", "c"]);
		expect(ids("match")).toEqual(["a", "b", "c"]);
	});
});

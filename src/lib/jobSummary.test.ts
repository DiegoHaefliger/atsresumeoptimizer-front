import { describe, expect, it } from "vitest";
import { buildSummary } from "./jobSummary";

const base = { jobId: "job-1", resumes: [], coverLetters: 0, interviewSets: 0, candidateSets: 0 };

describe("buildSummary", () => {
	it("marks every step as not done for an untouched job", () => {
		const steps = buildSummary(base);
		expect(steps.every((step) => !step.done)).toBe(true);
		expect(steps.find((step) => step.key === "analysis")?.links).toEqual([]);
	});

	it("links each distinct analysis and its saved rewrite", () => {
		const steps = buildSummary({
			...base,
			resumes: [
				{ id: "r1", origin: "ADAPTED", sourceAnalysisId: "a1" },
				{ id: "r2", origin: "ADAPTED", sourceAnalysisId: "a1" },
				{ id: "r3", origin: "BASE" },
			],
		});
		const analysis = steps.find((step) => step.key === "analysis");
		const resume = steps.find((step) => step.key === "resume");
		expect(analysis?.detail).toBe("1 análise");
		expect(analysis?.links).toEqual([{ label: "Análise 1", to: "/analyses/a1" }]);
		expect(resume?.detail).toBe("2 currículos adaptados");
		expect(resume?.links[0]?.to).toBe("/analyses/a1/rewrite?view=saved");
	});

	it("points assistant steps at their tab", () => {
		const steps = buildSummary({ ...base, coverLetters: 1, interviewSets: 2, candidateSets: 3 });
		expect(steps.find((step) => step.key === "cover-letter")?.links[0]?.to).toBe("/jobs/job-1/assistant?tab=cover-letter");
		expect(steps.find((step) => step.key === "questions")?.detail).toBe("2 conjuntos gerados");
		expect(steps.find((step) => step.key === "doubts")?.links[0]?.to).toBe("/jobs/job-1/assistant?tab=doubts");
	});
});

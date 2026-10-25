import { describe, expect, it } from "vitest";
import { addBenefit, clampMaxResults, criteriaSummary, describeSearch, isSameForm, searchMaxResultsValue, toForm, toRequest } from "./preferenceForm";

const empty = toForm({});

describe("preferenceForm", () => {
	it("starts every criterion outside the score", () => {
		expect(criteriaSummary(empty).every((criterion) => !criterion.active)).toBe(true);
	});

	it("detects pending changes by the request payload", () => {
		expect(isSameForm(empty, { ...empty })).toBe(true);
		expect(isSameForm(empty, { ...empty, locations: ["Curitiba"] })).toBe(false);
	});

	it("round-trips salary strings to numbers", () => {
		expect(toRequest({ ...empty, minSalary: "8000" }).minSalary).toBe(8000);
		expect(toRequest(empty).minSalary).toBeUndefined();
	});

	it("keeps a custom benefit once and selects it", () => {
		const once = addBenefit(empty, "auxílio academia");
		const twice = addBenefit(once, "Auxílio Academia");
		expect(twice.customBenefits).toEqual(["auxílio academia"]);
		expect(twice.benefits).toEqual(["auxílio academia"]);
	});

	it("starts the search disabled with default period, limit and adherence", () => {
		expect(empty).toMatchObject({
			searchPostedWithin: "PAST_WEEK",
			searchMaxResults: "50",
			searchMinAdherence: 70,
			searchEnabled: false,
			searchCron: "0 0 8,20 * * *",
			searchSites: ["LINKEDIN", "GUPY", "PROGRAMATHOR", "INFOJOBS", "VAGAS", "REMOTAR"],
		});
	});

	it("keeps the sites chosen for the search", () => {
		expect(toRequest({ ...empty, searchSites: ["GUPY"] }).searchSites).toEqual(["GUPY"]);
		expect(toRequest({ ...empty, searchSites: [] }).searchSites).toEqual([]);
	});

	it("never sends an enabled search without keywords", () => {
		expect(toRequest({ ...empty, searchEnabled: true }).searchEnabled).toBe(false);
		expect(toRequest({ ...empty, searchEnabled: true, searchKeywords: ["Java"] }).searchEnabled).toBe(true);
	});

	it("accepts only whole search limits between 1 and 100", () => {
		expect(searchMaxResultsValue({ ...empty, searchMaxResults: "30" })).toBe(30);
		for (const invalid of ["0", "101", "2.5", ""]) {
			expect(searchMaxResultsValue({ ...empty, searchMaxResults: invalid })).toBeNull();
		}
	});

	it("builds the search description from the reused preference fields", () => {
		const form = {
			...empty,
			searchKeywords: ["Java", "Spring"],
			seniorities: ["Pleno", "Sênior"],
			workModels: ["REMOTE" as const],
			locations: ["Curitiba"],
		};
		expect(describeSearch(form)).toEqual(["Java, Spring", "Pleno/Sênior", "Remoto", "Curitiba", "últimos 7 dias", "LinkedIn, Gupy, Programathor, InfoJobs, Vagas.com, Remotar"]);
	});

	it("caps the max results at 100 while typing", () => {
		expect(clampMaxResults("250")).toBe("100");
		expect(clampMaxResults("100")).toBe("100");
		expect(clampMaxResults("42")).toBe("42");
		expect(clampMaxResults("")).toBe("");
	});
});

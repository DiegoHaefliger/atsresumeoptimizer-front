import type { ContractType, JobPreferenceRequest, JobPreferenceResponse, PostedWithin, SearchSite, WorkModel } from "../api/types";
import { DEFAULT_SEARCH_CRON } from "./searchSchedule";
import { BENEFIT_OPTIONS, CONTRACT_TYPE_LABELS, matchingOption, POSTED_WITHIN_LABELS, SEARCH_SITE_LABELS, SENIORITY_OPTIONS, WORK_MODEL_LABELS } from "./jobLabels";

export const DEFAULT_MAX_RESULTS = 50;
export const DEFAULT_MIN_ADHERENCE = 70;
export const MAX_RESULTS_LIMIT = 100;
export const ALL_SEARCH_SITES = Object.keys(SEARCH_SITE_LABELS) as SearchSite[];

export type PreferenceSection = "format" | "pay" | "benefits" | "places" | "search";

export type PreferenceForm = {
	workModels: WorkModel[];
	contractTypes: ContractType[];
	minSalary: string;
	desiredSalary: string;
	seniorities: string[];
	benefits: string[];
	customBenefits: string[];
	locations: string[];
	preferredCompanies: string[];
	avoidedCompanies: string[];
	searchKeywords: string[];
	searchExcludedKeywords: string[];
	searchPostedWithin: PostedWithin;
	searchMaxResults: string;
	searchMinAdherence: number;
	searchEnabled: boolean;
	searchCron: string;
	searchSites: SearchSite[];
};

export type PreferenceCriterion = { label: string; section: PreferenceSection; active: boolean };

export const SECTION_TITLES: Record<PreferenceSection, string> = {
	format: "Formato da vaga",
	pay: "Remuneração",
	benefits: "Benefícios",
	places: "Local e empresas",
	search: "Busca de vagas",
};

export function toForm(preference: JobPreferenceResponse): PreferenceForm {
	const benefits = (preference.benefits ?? []).map((value) => matchingOption(BENEFIT_OPTIONS, value) ?? value);
	return {
		workModels: preference.workModels ?? [],
		contractTypes: preference.contractTypes ?? [],
		minSalary: preference.minSalary?.toString() ?? "",
		desiredSalary: preference.desiredSalary?.toString() ?? "",
		seniorities: (preference.seniorities ?? []).map((value) => matchingOption(SENIORITY_OPTIONS, value) ?? value),
		benefits,
		customBenefits: benefits.filter((value) => !matchingOption(BENEFIT_OPTIONS, value)),
		locations: preference.locations ?? [],
		preferredCompanies: preference.preferredCompanies ?? [],
		avoidedCompanies: preference.avoidedCompanies ?? [],
		searchKeywords: preference.searchKeywords ?? [],
		searchExcludedKeywords: preference.searchExcludedKeywords ?? [],
		searchPostedWithin: preference.searchPostedWithin ?? "PAST_WEEK",
		searchMaxResults: String(preference.searchMaxResults ?? DEFAULT_MAX_RESULTS),
		searchMinAdherence: preference.searchMinAdherence ?? DEFAULT_MIN_ADHERENCE,
		searchEnabled: preference.searchEnabled ?? false,
		searchCron: preference.searchCron ?? DEFAULT_SEARCH_CRON,
		searchSites: preference.searchSites ?? ALL_SEARCH_SITES,
	};
}

export function toRequest(form: PreferenceForm): JobPreferenceRequest {
	return {
		workModels: form.workModels,
		contractTypes: form.contractTypes,
		minSalary: form.minSalary ? Number(form.minSalary) : undefined,
		desiredSalary: form.desiredSalary ? Number(form.desiredSalary) : undefined,
		benefits: form.benefits,
		seniorities: form.seniorities,
		locations: form.locations,
		preferredCompanies: form.preferredCompanies,
		avoidedCompanies: form.avoidedCompanies,
		searchKeywords: form.searchKeywords,
		searchExcludedKeywords: form.searchExcludedKeywords,
		searchPostedWithin: form.searchPostedWithin,
		searchMaxResults: searchMaxResultsValue(form) ?? DEFAULT_MAX_RESULTS,
		searchMinAdherence: form.searchMinAdherence,
		searchEnabled: form.searchEnabled && form.searchKeywords.length > 0,
		searchCron: form.searchCron.trim(),
		searchSites: form.searchSites,
	};
}

export function clampMaxResults(raw: string): string {
	const digits = raw.replace(/\D/g, "");
	if (digits === "") {
		return "";
	}
	return String(Math.min(Number(digits), MAX_RESULTS_LIMIT));
}

export function searchMaxResultsValue(form: PreferenceForm): number | null {
	const value = Number(form.searchMaxResults);
	return Number.isInteger(value) && value >= 1 && value <= MAX_RESULTS_LIMIT ? value : null;
}

export function isSameForm(a: PreferenceForm, b: PreferenceForm): boolean {
	return JSON.stringify(toRequest(a)) === JSON.stringify(toRequest(b));
}

export function addBenefit(form: PreferenceForm, value: string): PreferenceForm {
	const existing = matchingOption([...BENEFIT_OPTIONS, ...form.customBenefits], value);
	const benefit = existing ?? value;
	return {
		...form,
		customBenefits: existing ? form.customBenefits : [...form.customBenefits, value],
		benefits: form.benefits.includes(benefit) ? form.benefits : [...form.benefits, benefit],
	};
}

export function criteriaSummary(form: PreferenceForm): PreferenceCriterion[] {
	return [
		{ label: "Modelo de trabalho", section: "format", active: form.workModels.length > 0 },
		{ label: "Tipo de contrato", section: "format", active: form.contractTypes.length > 0 },
		{ label: "Senioridade", section: "format", active: form.seniorities.length > 0 },
		{ label: "Remuneração", section: "pay", active: Boolean(form.minSalary || form.desiredSalary) },
		{ label: "Benefícios", section: "benefits", active: form.benefits.length > 0 },
		{
			label: "Empresa",
			section: "places",
			active: form.preferredCompanies.length > 0 || form.avoidedCompanies.length > 0,
		},
		{ label: "Localização", section: "places", active: form.locations.length > 0 },
		{
			label: "Cargos e palavras-chave",
			section: "search",
			active: form.searchKeywords.length > 0 || form.searchExcludedKeywords.length > 0,
		},
	];
}

export function describeSearch(form: PreferenceForm): string[] {
	const parts = [
		form.searchKeywords.join(", "),
		form.seniorities.join("/"),
		form.workModels.map((value) => WORK_MODEL_LABELS[value]).join("/"),
		form.contractTypes.map((value) => CONTRACT_TYPE_LABELS[value]).join("/"),
		form.locations.join(", "),
		POSTED_WITHIN_LABELS[form.searchPostedWithin].toLowerCase(),
		form.searchSites.map((site) => SEARCH_SITE_LABELS[site]).join(", "),
	];
	return parts.filter((part) => part.length > 0);
}

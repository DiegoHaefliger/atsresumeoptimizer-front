import type { ContractType, WorkModel } from "../api/types";
import { formatJobCode, matchesJobCode } from "./jobCode";
import type { Job } from "./useJobs";

export type JobFilters = {
	query: string;
	workModel: WorkModel | "";
	contractType: ContractType | "";
	seniority: string;
	minScore: number;
	minAtsScore: number;
};

export const EMPTY_FILTERS: JobFilters = { query: "", workModel: "", contractType: "", seniority: "", minScore: 0, minAtsScore: 0 };

export const MIN_SCORE_OPTIONS = [50, 70, 80] as const;

function normalized(text: string | undefined): string {
	return (text ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("pt-BR");
}

export function hasActiveFilters(filters: JobFilters): boolean {
	return (Object.keys(EMPTY_FILTERS) as (keyof JobFilters)[]).some((key) => filters[key] !== EMPTY_FILTERS[key]);
}

export function seniorityOptions(jobs: Job[]): string[] {
	const byKey = new Map<string, string>();
	for (const job of jobs) {
		const value = job.seniority?.trim();
		if (value && !byKey.has(normalized(value))) {
			byKey.set(normalized(value), value);
		}
	}
	return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
	const words = normalized(filters.query).split(/\s+/).filter(Boolean);
	return jobs.filter((job) => {
		const haystack = normalized([formatJobCode(job.code), job.title, job.company, job.targetRole, job.jobDescription].join(" "));
		return (
			words.every((word) => haystack.includes(word) || matchesJobCode(word, job.code)) &&
			(!filters.workModel || job.workModel === filters.workModel) &&
			(!filters.contractType || job.contractType === filters.contractType) &&
			(!filters.seniority || normalized(job.seniority) === normalized(filters.seniority)) &&
			(filters.minScore === 0 || (job.preferenceScore ?? -1) >= filters.minScore) &&
			(filters.minAtsScore === 0 || (job.atsScore ?? -1) >= filters.minAtsScore)
		);
	});
}

const STORAGE_KEY = "job-filters";

export function loadFilters(): JobFilters {
	try {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		return stored ? { ...EMPTY_FILTERS, ...JSON.parse(stored) } : EMPTY_FILTERS;
	} catch {
		return EMPTY_FILTERS;
	}
}

export function saveFilters(filters: JobFilters): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
	} catch {
		// sem storage (modo privado): os filtros só não sobrevivem à navegação
	}
}

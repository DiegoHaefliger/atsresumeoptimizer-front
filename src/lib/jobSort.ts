import type { SelectionProcess } from "../api/types";
import { byProcessStage } from "./jobOrder";
import { matchScore } from "./matchScore";
import type { Job } from "./useJobs";

export type JobSort = "stage" | "newest" | "oldest" | "match" | "preference" | "ats";

export const DEFAULT_JOB_SORT: JobSort = "stage";

export const JOB_SORT_OPTIONS: readonly { value: JobSort; label: string }[] = [
	{ value: "stage", label: "Etapa do processo" },
	{ value: "newest", label: "Cadastro mais recente" },
	{ value: "oldest", label: "Cadastro mais antigo" },
	{ value: "match", label: "Maior compatibilidade" },
	{ value: "preference", label: "Maior aderência" },
	{ value: "ats", label: "Maior nota ATS" },
];

type JobComparator = (a: Job, b: Job) => number;

const newestFirst: JobComparator = (a, b) => (b.registeredAt ?? "").localeCompare(a.registeredAt ?? "");

function highestFirst(score: (job: Job) => number | null | undefined): JobComparator {
	return (a, b) => (score(b) ?? -1) - (score(a) ?? -1) || newestFirst(a, b);
}

export function jobComparator(sort: JobSort, processes: Map<string, SelectionProcess> | undefined): JobComparator {
	switch (sort) {
		case "stage":
			return byProcessStage(processes);
		case "newest":
			return newestFirst;
		case "oldest":
			return (a, b) => newestFirst(b, a);
		case "match":
			return highestFirst((job) => matchScore(job).score);
		case "preference":
			return highestFirst((job) => job.preferenceScore);
		case "ats":
			return highestFirst((job) => job.atsScore);
	}
}

const STORAGE_KEY = "job-sort";

export function loadJobSort(): JobSort {
	try {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		return JOB_SORT_OPTIONS.some((option) => option.value === stored) ? (stored as JobSort) : DEFAULT_JOB_SORT;
	} catch {
		return DEFAULT_JOB_SORT;
	}
}

export function saveJobSort(sort: JobSort): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, sort);
	} catch {
		// sem storage (modo privado): a ordenação só não sobrevive à navegação
	}
}

import type { SelectionProcess, SelectionStage } from "../api/types";
import type { Job } from "./useJobs";

const STAGE_RANK: Record<SelectionStage, number> = {
	OFFER: 0,
	MANAGER_INTERVIEW: 1,
	TECHNICAL_INTERVIEW: 2,
	TECHNICAL_TEST: 3,
	HR_INTERVIEW: 4,
	SCREENING: 5,
	APPLIED: 6,
	INTERESTED: 7,
	HIRED: 9,
	WITHDRAWN: 10,
	REJECTED: 11,
};

const WITHOUT_PROCESS_RANK = 8;

function rankOf(job: Job, processes: Map<string, SelectionProcess> | undefined): number {
	const stage = processes?.get(job.id)?.stage;
	return stage ? STAGE_RANK[stage] : WITHOUT_PROCESS_RANK;
}

export function byProcessStage(processes: Map<string, SelectionProcess> | undefined) {
	return (a: Job, b: Job): number =>
		rankOf(a, processes) - rankOf(b, processes) || (b.registeredAt ?? "").localeCompare(a.registeredAt ?? "");
}

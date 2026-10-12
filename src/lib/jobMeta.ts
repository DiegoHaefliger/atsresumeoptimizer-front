import { workModelLabel } from "./jobLabels";
import type { Job } from "./useJobs";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function jobUsage(job: Job): string | null {
	if (job.lastUsedAt) {
		return `usada em ${dateFormat.format(new Date(job.lastUsedAt))}`;
	}
	return job.registeredAt ? `cadastrada em ${dateFormat.format(new Date(job.registeredAt))}` : null;
}

export function jobDetails(job: Job): string {
	return [job.workModel && workModelLabel(job.workModel), jobUsage(job)].filter(Boolean).join(" · ");
}

export function jobMeta(job: Job): string {
	return [job.company, jobDetails(job)].filter(Boolean).join(" · ");
}

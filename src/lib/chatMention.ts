import type { Job } from "./useJobs";

export type MentionQuery = { start: number; query: string };

const MENTION_PATTERN = /(?:^|\s)@([^\n@]{0,40})$/;
const MAX_MATCHES = 6;

function normalize(text: string): string {
	return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function mentionOptionId(menuId: string, index: number): string {
	return `${menuId}-option-${index}`;
}

export function mentionAt(text: string, caret: number): MentionQuery | null {
	const before = text.slice(0, caret);
	const match = MENTION_PATTERN.exec(before);
	if (!match) {
		return null;
	}
	return { start: before.length - match[1].length - 1, query: match[1] };
}

export function searchJobs(jobs: Job[], query: string, attachedIds: string[]): Job[] {
	const terms = normalize(query).replace(/^#/, "").split(/\s+/).filter(Boolean);
	return jobs
		.filter((job) => !attachedIds.includes(job.id))
		.filter((job) => {
			const haystack = normalize(`${job.code} ${job.title ?? ""} ${job.company ?? ""}`);
			return terms.every((term) => haystack.includes(term));
		})
		.slice(0, MAX_MATCHES);
}

export function removeMention(text: string, mention: MentionQuery, caret: number): { text: string; caret: number } {
	const before = text.slice(0, mention.start).replace(/ +$/, "");
	const after = text.slice(caret).replace(/^ +/, "");
	const separator = before && after ? " " : "";
	return { text: before + separator + after, caret: before.length + separator.length };
}

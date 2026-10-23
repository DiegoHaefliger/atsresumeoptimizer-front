export function coverLettersPath(jobId: string): string {
	return `/api/v1/jobs/${jobId}/cover-letters`;
}

export function interviewQuestionsPath(jobId: string): string {
	return `/api/v1/jobs/${jobId}/interview-questions`;
}

export function candidateQuestionsPath(jobId: string): string {
	return `/api/v1/jobs/${jobId}/candidate-questions`;
}

export function jobResumesPath(jobId: string): string {
	return `/api/v1/jobs/${jobId}/resumes`;
}

export type AssistantTab = "questions" | "cover-letter" | "doubts";

const ASSISTANT_TABS: AssistantTab[] = ["questions", "cover-letter", "doubts"];

export function assistantPath(jobId: string, tab?: AssistantTab): string {
	return tab ? `/jobs/${jobId}/assistant?tab=${tab}` : `/jobs/${jobId}/assistant`;
}

export function assistantTabFromParam(param: string | null): AssistantTab {
	return ASSISTANT_TABS.find((tab) => tab === param) ?? "questions";
}

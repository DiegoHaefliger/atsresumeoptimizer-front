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

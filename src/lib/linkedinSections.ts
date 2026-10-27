import type { LinkedInSectionReviewResponse, SuggestionPriority } from "../api/linkedinTypes";

const PRIORITY_ORDER: Record<SuggestionPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function sortedByPriority(review: LinkedInSectionReviewResponse): LinkedInSectionReviewResponse["suggestions"] {
	return [...review.suggestions].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function weakestFirst(sections: LinkedInSectionReviewResponse[]): LinkedInSectionReviewResponse[] {
	return [...sections].sort((a, b) => a.score - b.score);
}

export function scoreDelta(current: number, previous: number | undefined): number | null {
	return previous === undefined ? null : current - previous;
}

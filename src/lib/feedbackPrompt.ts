const RATED_VERSION_KEY = "ats-feedback-rated-version";

export const PROMPT_DELAY_MS = 8000;
export const FEEDBACK_PATH_PAGE = "/feedback";

export function ratedVersion(): string | null {
	try {
		return localStorage.getItem(RATED_VERSION_KEY);
	} catch {
		return null;
	}
}

export function markRated(version: string | null) {
	try {
		localStorage.setItem(RATED_VERSION_KEY, version ?? "");
	} catch {
		return;
	}
}

export function shouldPrompt(version: string | null, rated: string | null, modalOpen: boolean): boolean {
	return !modalOpen && (rated === null || rated !== (version ?? ""));
}

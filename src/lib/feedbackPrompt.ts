import { HELP_PATH, HELP_TAB_PARAM, helpPath } from "./helpTabs";

const RATED_VERSION_KEY = "ats-feedback-rated-version";
const SNOOZE_UNTIL_KEY = "ats-feedback-snooze-until";
const DISMISSALS_KEY = "ats-feedback-dismissals";
const VALUE_EVENTS_KEY = "ats-feedback-value-events";

const DAY_MS = 24 * 60 * 60 * 1000;
const SHORT_SNOOZE_DAYS = 7;
const LONG_SNOOZE_DAYS = 30;
const DISMISSALS_BEFORE_LONG_SNOOZE = 3;

export const VALUE_EVENT = "ats-value-event";
export const PROMPT_DELAY_MS = 2500;
const FEEDBACK_TAB = "feedback";

export function feedbackPagePath(rating?: number): string {
	return `${helpPath(FEEDBACK_TAB)}${rating ? `&rating=${rating}` : ""}`;
}

export function isFeedbackPage(pathname: string, search: string): boolean {
	return pathname === HELP_PATH && new URLSearchParams(search).get(HELP_TAB_PARAM) === FEEDBACK_TAB;
}

function readNumber(key: string): number {
	try {
		return Number(localStorage.getItem(key)) || 0;
	} catch {
		return 0;
	}
}

function writeValue(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
}

export function ratedVersion(): string | null {
	try {
		return localStorage.getItem(RATED_VERSION_KEY);
	} catch {
		return null;
	}
}

export function markRated(version: string | null) {
	writeValue(RATED_VERSION_KEY, version ?? "");
}

export type PromptState = {
	version: string | null;
	rated: string | null;
	snoozeUntil: number;
	valueEvents: number;
	now: number;
	modalOpen: boolean;
};

export function readPromptState(version: string | null, now: number = Date.now()): PromptState {
	return { version, rated: ratedVersion(), snoozeUntil: readNumber(SNOOZE_UNTIL_KEY), valueEvents: readNumber(VALUE_EVENTS_KEY), now, modalOpen: false };
}

export function shouldPrompt(state: PromptState): boolean {
	const alreadyRated = state.rated !== null && state.rated === (state.version ?? "");
	return !state.modalOpen && !alreadyRated && state.valueEvents > 0 && state.now >= state.snoozeUntil;
}

export function snoozePrompt(now: number = Date.now()) {
	const dismissals = readNumber(DISMISSALS_KEY) + 1;
	const days = dismissals >= DISMISSALS_BEFORE_LONG_SNOOZE ? LONG_SNOOZE_DAYS : SHORT_SNOOZE_DAYS;
	writeValue(DISMISSALS_KEY, String(dismissals));
	writeValue(SNOOZE_UNTIL_KEY, String(now + days * DAY_MS));
}

export function recordValueEvent() {
	writeValue(VALUE_EVENTS_KEY, String(readNumber(VALUE_EVENTS_KEY) + 1));
	window.dispatchEvent(new Event(VALUE_EVENT));
}

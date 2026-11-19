import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markRated, readPromptState, recordValueEvent, shouldPrompt, snoozePrompt, VALUE_EVENT } from "./feedbackPrompt";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("shouldPrompt", () => {
	it("never asks before the person got any value from the app", () => {
		expect(shouldPrompt(readPromptState("1.4.0", NOW))).toBe(false);
	});

	it("asks after a value event until this version is rated", () => {
		recordValueEvent();

		expect(shouldPrompt(readPromptState("1.4.0", NOW))).toBe(true);
		markRated("1.3.0");
		expect(shouldPrompt(readPromptState("1.4.0", NOW))).toBe(true);
		markRated("1.4.0");
		expect(shouldPrompt(readPromptState("1.4.0", NOW))).toBe(false);
	});

	it("does not interrupt another open dialog", () => {
		recordValueEvent();

		expect(shouldPrompt({ ...readPromptState("1.4.0", NOW), modalOpen: true })).toBe(false);
	});

	it("still asks when the version is unknown and nothing was rated", () => {
		recordValueEvent();

		expect(shouldPrompt(readPromptState(null, NOW))).toBe(true);
	});
});

describe("snoozePrompt", () => {
	it("stays quiet for a week after the first Agora não", () => {
		recordValueEvent();
		snoozePrompt(NOW);

		expect(shouldPrompt(readPromptState("1.4.0", NOW + 6 * DAY))).toBe(false);
		expect(shouldPrompt(readPromptState("1.4.0", NOW + 8 * DAY))).toBe(true);
	});

	it("backs off to a month after three dismissals", () => {
		recordValueEvent();
		snoozePrompt(NOW);
		snoozePrompt(NOW);
		snoozePrompt(NOW);

		expect(shouldPrompt(readPromptState("1.4.0", NOW + 20 * DAY))).toBe(false);
		expect(shouldPrompt(readPromptState("1.4.0", NOW + 31 * DAY))).toBe(true);
	});
});

describe("recordValueEvent", () => {
	it("announces the moment so the prompt can react", () => {
		const listener = vi.fn();
		window.addEventListener(VALUE_EVENT, listener);

		recordValueEvent();

		expect(listener).toHaveBeenCalledTimes(1);
		window.removeEventListener(VALUE_EVENT, listener);
	});
});

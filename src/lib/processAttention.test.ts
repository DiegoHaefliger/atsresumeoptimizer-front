import { describe, expect, it } from "vitest";
import type { SelectionProcess, SelectionSchedule } from "../api/types";
import { attentionFor, daysInStage, isStale, relativeDays } from "./processAttention";

const NOW = new Date("2026-10-30T12:00:00");

function process(overrides: Partial<SelectionProcess>): SelectionProcess {
	return {
		id: "p1",
		jobPostingId: "j1",
		stage: "APPLIED",
		appliedOn: null,
		nextStepOn: null,
		updatedAt: "2026-10-29T12:00:00Z",
		nextSchedule: null,
		stageSince: null,
		...overrides,
	} as SelectionProcess;
}

function schedule(scheduledAt: string): SelectionSchedule {
	return { stage: "TECHNICAL_INTERVIEW", scheduledAt, status: "SCHEDULED" } as SelectionSchedule;
}

describe("daysInStage", () => {
	it("counts from when the current stage started", () => {
		expect(daysInStage(process({ stageSince: "2026-10-24T12:00:00" }), NOW)).toBe(6);
	});

	it("falls back to the application date and never goes negative", () => {
		expect(daysInStage(process({ appliedOn: "2026-10-20" }), NOW)).toBe(10);
		expect(daysInStage(process({ stageSince: "2026-11-02T12:00:00" }), NOW)).toBe(0);
	});
});

describe("isStale", () => {
	it("flags active processes stuck for too long, but not closed ones", () => {
		expect(isStale(process({ stageSince: "2026-10-15T12:00:00" }), NOW)).toBe(true);
		expect(isStale(process({ stageSince: "2026-10-25T12:00:00" }), NOW)).toBe(false);
		expect(isStale(process({ stage: "REJECTED", stageSince: "2026-10-01T12:00:00" }), NOW)).toBe(false);
	});
});

describe("attentionFor", () => {
	const kind = (overrides: Partial<SelectionProcess>) => attentionFor(process(overrides), NOW)?.kind ?? null;

	it("tells overdue, upcoming and stale processes apart", () => {
		expect(kind({ nextSchedule: schedule("2026-10-28T15:00:00") })).toBe("overdue");
		expect(kind({ nextSchedule: schedule("2026-10-31T15:00:00") })).toBe("upcoming");
		expect(kind({ stageSince: "2026-10-01T12:00:00" })).toBe("stale");
	});

	it("stays quiet for far schedules, fresh stages and closed processes", () => {
		expect(kind({ nextSchedule: schedule("2026-12-20T15:00:00"), stageSince: "2026-10-01T12:00:00" })).toBeNull();
		expect(kind({ stageSince: "2026-10-25T12:00:00" })).toBeNull();
		expect(kind({ stage: "REJECTED", nextSchedule: schedule("2026-10-28T15:00:00") })).toBeNull();
	});

	it("uses the next-step date when there is no schedule", () => {
		expect(kind({ nextStepOn: "2026-10-27" })).toBe("overdue");
		expect(kind({ nextStepOn: "2026-11-02" })).toBe("upcoming");
	});
});

describe("relativeDays", () => {
	it("speaks in days", () => {
		expect(relativeDays(new Date("2026-10-30T20:00:00"), NOW)).toBe("hoje");
		expect(relativeDays(new Date("2026-10-31T09:00:00"), NOW)).toBe("amanhã");
		expect(relativeDays(new Date("2026-10-27T09:00:00"), NOW)).toBe("há 3 dias");
		expect(relativeDays(new Date("2026-11-04T09:00:00"), NOW)).toBe("em 5 dias");
	});
});

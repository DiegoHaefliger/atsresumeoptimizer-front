import { describe, expect, it } from "vitest";
import type { SelectionSchedule, StageMovement } from "../api/types";
import { buildStageTimeline } from "./stageTimeline";

const NOW = new Date("2026-10-20T12:00:00Z");

function movement(id: string, stage: StageMovement["stage"], movedAt: string): StageMovement {
	return { id, stage, movedAt, note: null, stageAt: null };
}

function schedule(id: string, stage: SelectionSchedule["stage"], scheduledAt: string, status: SelectionSchedule["status"]): SelectionSchedule {
	return {
		id,
		processId: "p",
		stage,
		scheduledAt,
		durationMinutes: null,
		location: null,
		notes: null,
		status,
		createdAt: scheduledAt,
		updatedAt: scheduledAt,
	};
}

describe("buildStageTimeline", () => {
	it("lists the newest stage first and measures time spent in each", () => {
		const { nodes } = buildStageTimeline(
			[movement("m1", "INTERESTED", "2026-10-10T12:00:00Z"), movement("m2", "APPLIED", "2026-10-15T12:00:00Z")],
			[],
			NOW,
		);
		expect(nodes.map((node) => node.stage)).toEqual(["APPLIED", "INTERESTED"]);
		expect(nodes[0]).toMatchObject({ current: true, daysInStage: 5 });
		expect(nodes[1]).toMatchObject({ current: false, daysInStage: 5 });
	});

	it("separates future scheduled items from the stage history", () => {
		const { upcoming, nodes } = buildStageTimeline(
			[movement("m1", "HR_INTERVIEW", "2026-10-12T12:00:00Z")],
			[
				schedule("s1", "HR_INTERVIEW", "2026-10-22T12:00:00Z", "SCHEDULED"),
				schedule("s2", "HR_INTERVIEW", "2026-10-14T12:00:00Z", "DONE"),
			],
			NOW,
		);
		expect(upcoming.map((item) => item.id)).toEqual(["s1"]);
		expect(nodes[0].schedules.map((item) => item.id)).toEqual(["s2"]);
	});

	it("creates a stage node for schedules whose stage was never entered", () => {
		const { nodes } = buildStageTimeline(
			[movement("m1", "INTERESTED", "2026-10-10T12:00:00Z")],
			[schedule("s1", "SCREENING", "2026-10-13T12:00:00Z", "CANCELED")],
			NOW,
		);
		expect(nodes[0]).toMatchObject({ stage: "SCREENING", movement: null, daysInStage: null });
		expect(nodes[0].schedules).toHaveLength(1);
	});

	it("attaches a schedule to the latest visit of its stage", () => {
		const { nodes } = buildStageTimeline(
			[
				movement("m1", "HR_INTERVIEW", "2026-10-01T12:00:00Z"),
				movement("m2", "SCREENING", "2026-10-05T12:00:00Z"),
				movement("m3", "HR_INTERVIEW", "2026-10-08T12:00:00Z"),
			],
			[schedule("s1", "HR_INTERVIEW", "2026-10-09T12:00:00Z", "DONE")],
			NOW,
		);
		expect(nodes.find((node) => node.key === "m3")?.schedules).toHaveLength(1);
		expect(nodes.find((node) => node.key === "m1")?.schedules).toHaveLength(0);
	});
});

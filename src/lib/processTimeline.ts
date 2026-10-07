import type { SelectionSchedule, StageMovement } from "../api/types";

export type TimelineItem =
	| { kind: "movement"; id: string; at: string; movement: StageMovement }
	| { kind: "schedule"; id: string; at: string; schedule: SelectionSchedule };

export function buildTimeline(history: StageMovement[], schedules: SelectionSchedule[]): TimelineItem[] {
	const items: TimelineItem[] = [
		...history.map((movement): TimelineItem => ({ kind: "movement", id: movement.id, at: movement.movedAt, movement })),
		...schedules.map((schedule): TimelineItem => ({ kind: "schedule", id: schedule.id, at: schedule.scheduledAt, schedule })),
	];
	return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

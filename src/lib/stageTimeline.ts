import type { SelectionSchedule, SelectionStage, StageMovement } from "../api/types";

const DAY_MS = 86_400_000;

export type StageNode = {
	key: string;
	stage: SelectionStage;
	movement: StageMovement | null;
	at: string;
	schedules: SelectionSchedule[];
	daysInStage: number | null;
	current: boolean;
};

export type StageTimeline = {
	upcoming: SelectionSchedule[];
	nodes: StageNode[];
};

function ownerOf(schedule: SelectionSchedule, movements: StageMovement[]): StageMovement | null {
	const sameStage = movements.filter((movement) => movement.stage === schedule.stage);
	if (sameStage.length === 0) {
		return null;
	}
	const at = Date.parse(schedule.scheduledAt);
	return sameStage.filter((movement) => Date.parse(movement.movedAt) <= at).at(-1) ?? sameStage[0];
}

export function buildStageTimeline(history: StageMovement[], schedules: SelectionSchedule[], now: Date = new Date()): StageTimeline {
	const nowMs = now.getTime();
	const upcoming = schedules
		.filter((schedule) => schedule.status === "SCHEDULED" && Date.parse(schedule.scheduledAt) >= nowMs)
		.sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
	const past = schedules.filter((schedule) => !upcoming.includes(schedule));
	const movements = [...history].sort((a, b) => Date.parse(a.movedAt) - Date.parse(b.movedAt));
	const currentId = movements.at(-1)?.id;

	const byMovement = new Map<string, SelectionSchedule[]>();
	const orphans = new Map<SelectionStage, SelectionSchedule[]>();
	for (const schedule of past) {
		const owner = ownerOf(schedule, movements);
		if (owner) {
			byMovement.set(owner.id, [...(byMovement.get(owner.id) ?? []), schedule]);
		} else {
			orphans.set(schedule.stage, [...(orphans.get(schedule.stage) ?? []), schedule]);
		}
	}

	const newestFirst = (a: SelectionSchedule, b: SelectionSchedule) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt);

	const movementNodes = movements.map((movement, index): StageNode => {
		const next = movements[index + 1];
		const end = next ? Date.parse(next.movedAt) : nowMs;
		return {
			key: movement.id,
			stage: movement.stage,
			movement,
			at: movement.movedAt,
			schedules: (byMovement.get(movement.id) ?? []).sort(newestFirst),
			daysInStage: Math.max(0, Math.floor((end - Date.parse(movement.movedAt)) / DAY_MS)),
			current: movement.id === currentId,
		};
	});

	const orphanNodes = [...orphans.entries()].map(([stage, items]): StageNode => {
		const ordered = items.sort(newestFirst);
		return {
			key: `stage:${stage}`,
			stage,
			movement: null,
			at: ordered[ordered.length - 1].scheduledAt,
			schedules: ordered,
			daysInStage: null,
			current: false,
		};
	});

	const nodes = [...movementNodes, ...orphanNodes].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
	return { upcoming, nodes };
}

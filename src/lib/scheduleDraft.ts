import type { SelectionSchedule, SelectionStage } from "../api/types";
import { inputToInstant, instantToInput } from "./dateTimeInput";

export type ScheduleDraft = {
	stage: SelectionStage;
	scheduledAt: string;
	durationMinutes: string;
	location: string;
	notes: string;
};

export function emptyScheduleDraft(stage: SelectionStage, scheduledAt = ""): ScheduleDraft {
	return { stage, scheduledAt, durationMinutes: "", location: "", notes: "" };
}

export function draftFromSchedule(schedule: SelectionSchedule): ScheduleDraft {
	return {
		stage: schedule.stage,
		scheduledAt: instantToInput(schedule.scheduledAt),
		durationMinutes: schedule.durationMinutes != null ? String(schedule.durationMinutes) : "",
		location: schedule.location ?? "",
		notes: schedule.notes ?? "",
	};
}

export function scheduleRequest(draft: ScheduleDraft) {
	const duration = draft.durationMinutes.trim() === "" ? Number.NaN : Number(draft.durationMinutes);
	return {
		stage: draft.stage,
		scheduledAt: inputToInstant(draft.scheduledAt),
		durationMinutes: Number.isFinite(duration) ? duration : undefined,
		location: draft.location.trim() || undefined,
		notes: draft.notes.trim() || undefined,
	};
}

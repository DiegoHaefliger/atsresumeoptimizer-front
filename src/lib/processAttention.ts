import type { SelectionProcess, SelectionStage } from "../api/types";

export const STALE_AFTER_DAYS = 10;
export const UPCOMING_WITHIN_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const CLOSED_STAGES: SelectionStage[] = ["HIRED", "REJECTED", "WITHDRAWN"];

export type AttentionKind = "overdue" | "upcoming" | "stale";

export type Attention = {
	kind: AttentionKind;
	process: SelectionProcess;
	at: Date;
	stage: SelectionStage;
};

function startOfDay(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function localDate(date: string): Date {
	return new Date(`${date}T00:00:00`);
}

export function daysBetween(from: Date, to: Date): number {
	return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
}

export function isActive(process: SelectionProcess): boolean {
	return !CLOSED_STAGES.includes(process.stage);
}

export function stageStart(process: SelectionProcess): Date {
	if (process.stageSince) {
		return new Date(process.stageSince);
	}
	return process.appliedOn ? localDate(process.appliedOn) : new Date(process.updatedAt);
}

export function daysInStage(process: SelectionProcess, now: Date): number {
	return Math.max(0, daysBetween(stageStart(process), now));
}

export function isStale(process: SelectionProcess, now: Date): boolean {
	return isActive(process) && daysInStage(process, now) >= STALE_AFTER_DAYS;
}

export function attentionFor(process: SelectionProcess, now: Date): Attention | null {
	if (!isActive(process)) {
		return null;
	}
	const schedule = process.nextSchedule;
	if (schedule) {
		const at = new Date(schedule.scheduledAt);
		if (at.getTime() < now.getTime()) {
			return { kind: "overdue", process, at, stage: schedule.stage };
		}
		return daysBetween(now, at) <= UPCOMING_WITHIN_DAYS ? { kind: "upcoming", process, at, stage: schedule.stage } : null;
	}
	if (process.nextStepOn) {
		const at = localDate(process.nextStepOn);
		const days = daysBetween(now, at);
		if (days < 0) {
			return { kind: "overdue", process, at, stage: process.stage };
		}
		return days <= UPCOMING_WITHIN_DAYS ? { kind: "upcoming", process, at, stage: process.stage } : null;
	}
	return isStale(process, now) ? { kind: "stale", process, at: stageStart(process), stage: process.stage } : null;
}

export function relativeDays(at: Date, now: Date): string {
	const days = daysBetween(now, at);
	if (days === 0) {
		return "hoje";
	}
	if (days === 1) {
		return "amanhã";
	}
	if (days === -1) {
		return "ontem";
	}
	return days > 0 ? `em ${days} dias` : `há ${-days} dias`;
}

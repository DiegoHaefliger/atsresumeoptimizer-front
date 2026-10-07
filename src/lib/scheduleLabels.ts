import type { BadgeTone } from "../components/Badge";
import type { ScheduleStatus } from "../api/types";

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
	SCHEDULED: "Agendada",
	DONE: "Realizada",
	CANCELED: "Cancelada",
	RESCHEDULED: "Reagendada",
};

export const SCHEDULE_STATUS_TONES: Record<ScheduleStatus, BadgeTone> = {
	SCHEDULED: "info",
	DONE: "success",
	CANCELED: "error",
	RESCHEDULED: "neutral",
};

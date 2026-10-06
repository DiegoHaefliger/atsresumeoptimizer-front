import type { CalendarEvent } from "../api/types";
import { STAGE_LABELS } from "./processLabels";

export function eventTitle(event: CalendarEvent): string {
	const subject = [event.company, event.jobTitle].filter(Boolean).join(" - ");
	return subject ? `${STAGE_LABELS[event.stage]}: ${subject}` : STAGE_LABELS[event.stage];
}

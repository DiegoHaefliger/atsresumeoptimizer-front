import type { CalendarEvent, GoogleCalendarEvent, ScheduleStatus } from "../api/types";
import { eventTitle } from "./calendarLabels";

const DEFAULT_DURATION_MINUTES = 60;
const MS_PER_MINUTE = 60_000;

export type CalendarItem = {
	key: string;
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	source: "app" | "google";
	status: ScheduleStatus | null;
	processId: string | null;
	link: string | null;
};

function parseDate(value: string, allDay: boolean): Date {
	if (!allDay) {
		return new Date(value);
	}
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function fromAppEvent(event: CalendarEvent): CalendarItem {
	const start = new Date(event.scheduledAt);
	const minutes = event.durationMinutes ?? DEFAULT_DURATION_MINUTES;
	return {
		key: `app-${event.scheduleId}`,
		title: eventTitle(event),
		start,
		end: new Date(start.getTime() + minutes * MS_PER_MINUTE),
		allDay: false,
		source: "app",
		status: event.status,
		processId: event.processId,
		link: null,
	};
}

export function fromGoogleEvent(event: GoogleCalendarEvent): CalendarItem {
	return {
		key: `google-${event.id}`,
		title: event.title,
		start: parseDate(event.start, event.allDay),
		end: parseDate(event.end, event.allDay),
		allDay: event.allDay,
		source: "google",
		status: null,
		processId: null,
		link: event.link,
	};
}

export function mergeItems(appEvents: CalendarEvent[], googleEvents: GoogleCalendarEvent[]): CalendarItem[] {
	return [...appEvents.map(fromAppEvent), ...googleEvents.map(fromGoogleEvent)].sort(
		(a, b) => a.start.getTime() - b.start.getTime(),
	);
}

export function overlapping(items: CalendarItem[], start: Date, end: Date, ignoreKey?: string): CalendarItem[] {
	return items.filter(
		(item) =>
			!item.allDay &&
			item.key !== ignoreKey &&
			(item.source === "google" || item.status === "SCHEDULED") &&
			item.start < end &&
			start < item.end,
	);
}

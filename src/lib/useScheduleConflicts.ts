import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { CalendarEvent, GoogleCalendarEvent } from "../api/types";
import { CALENDAR_EVENTS_PATH, GOOGLE_EVENTS_PATH, rangeQuery } from "./calendarPaths";
import { addDays, startOfDay } from "./calendarRange";
import { mergeItems, overlapping, type CalendarItem } from "./calendarItems";

const DEFAULT_DURATION_MINUTES = 60;
const MS_PER_MINUTE = 60_000;

export function useScheduleConflicts(scheduledAt: string, durationMinutes: string, ignoreScheduleId?: string): CalendarItem[] {
	const [dayItems, setDayItems] = useState<{ day: string; items: CalendarItem[] } | null>(null);
	const start = scheduledAt ? new Date(scheduledAt) : null;
	const valid = start !== null && !Number.isNaN(start.getTime());
	const day = valid ? startOfDay(start).toISOString() : "";

	useEffect(() => {
		if (!day) {
			return;
		}
		const from = new Date(day);
		const query = rangeQuery(from, addDays(from, 1));
		let active = true;
		Promise.all([
			apiGet<CalendarEvent[]>(`${CALENDAR_EVENTS_PATH}?${query}`).catch(() => []),
			apiGet<GoogleCalendarEvent[]>(`${GOOGLE_EVENTS_PATH}?${query}`).catch(() => []),
		]).then(([app, google]) => {
			if (active) {
				setDayItems({ day, items: mergeItems(app, google) });
			}
		});
		return () => {
			active = false;
		};
	}, [day]);

	if (!valid || dayItems?.day !== day) {
		return [];
	}
	const minutes = Number(durationMinutes) > 0 ? Number(durationMinutes) : DEFAULT_DURATION_MINUTES;
	const end = new Date(start.getTime() + minutes * MS_PER_MINUTE);
	return overlapping(dayItems.items, start, end, ignoreScheduleId ? `app-${ignoreScheduleId}` : undefined);
}

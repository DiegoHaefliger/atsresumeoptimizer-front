import type { CalendarEvent, GoogleCalendarEvent } from "../api/types";
import { CALENDAR_EVENTS_PATH, GOOGLE_EVENTS_PATH, rangeQuery } from "./calendarPaths";
import { useApiResource } from "./useApiResource";

export function useCalendarEvents(from: Date, to: Date) {
	const query = rangeQuery(from, to);
	const app = useApiResource<CalendarEvent[]>(`${CALENDAR_EVENTS_PATH}?${query}`);
	const google = useApiResource<GoogleCalendarEvent[]>(`${GOOGLE_EVENTS_PATH}?${query}`);
	return {
		events: app.data,
		googleEvents: google.data ?? [],
		failed: app.failed,
		googleFailed: google.failed,
		reload: () => {
			app.reload();
			google.reload();
		},
	};
}

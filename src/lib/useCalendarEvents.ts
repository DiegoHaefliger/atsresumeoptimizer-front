import type { CalendarEvent } from "../api/types";
import { useApiResource } from "./useApiResource";

export function useCalendarEvents(from: Date, to: Date) {
	const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
	const { data, failed, reload } = useApiResource<CalendarEvent[]>(`/api/v1/calendar/events?${query}`);
	return { events: data, failed, reload };
}

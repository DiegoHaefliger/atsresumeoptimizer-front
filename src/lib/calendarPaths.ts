export const CALENDAR_EVENTS_PATH = "/api/v1/calendar/events";
export const GOOGLE_EVENTS_PATH = "/api/v1/google-calendar/events";

export function rangeQuery(from: Date, to: Date): string {
	return new URLSearchParams({ from: from.toISOString(), to: to.toISOString() }).toString();
}

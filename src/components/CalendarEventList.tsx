import type { CalendarEvent } from "../api/types";
import { dayLabel, groupByDay } from "../lib/calendarRange";
import { CalendarEventChip } from "./CalendarEventChip";
import { StateMessage } from "./StateMessage";

export function CalendarEventList({ events }: { events: CalendarEvent[] }) {
	if (events.length === 0) {
		return <StateMessage variant="empty" layout="page" message="Nenhum agendamento neste período." />;
	}
	return (
		<ol className="calendar-list panel panel-body">
			{[...groupByDay(events)].map(([key, dayEvents]) => (
				<li key={key}>
					<h3 className="calendar-day-heading">{dayLabel(new Date(dayEvents[0].scheduledAt))}</h3>
					{dayEvents.map((event) => (
						<CalendarEventChip key={event.scheduleId} event={event} />
					))}
				</li>
			))}
		</ol>
	);
}

import { Link } from "react-router-dom";
import type { CalendarEvent } from "../api/types";
import { timeLabel } from "../lib/calendarRange";
import { eventTitle } from "../lib/calendarLabels";

export function CalendarEventChip({ event }: { event: CalendarEvent }) {
	const title = eventTitle(event);
	return (
		<Link
			to={`/processes/${event.processId}`}
			className={`calendar-chip calendar-chip-${event.status}`}
			title={`${timeLabel(event.scheduledAt)} ${title}`}
		>
			<span className="calendar-chip-time">{timeLabel(event.scheduledAt)}</span>
			<span className="calendar-chip-title">{title}</span>
		</Link>
	);
}

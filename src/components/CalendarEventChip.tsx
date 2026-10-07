import { Link } from "react-router-dom";
import { timeLabel } from "../lib/calendarRange";
import type { CalendarItem } from "../lib/calendarItems";

export function CalendarEventChip({ item }: { item: CalendarItem }) {
	const time = timeLabel(item);
	const content = (
		<>
			<span className="calendar-chip-time">{time}</span>
			<span className="calendar-chip-title">{item.title}</span>
		</>
	);
	if (item.source === "google") {
		const label = `${time} ${item.title} (Google Agenda)`;
		return item.link ? (
			<a href={item.link} target="_blank" rel="noopener noreferrer" className="calendar-chip calendar-chip-google" title={label}>
				{content}
			</a>
		) : (
			<span className="calendar-chip calendar-chip-google" title={label}>
				{content}
			</span>
		);
	}
	return (
		<Link to={`/processes/${item.processId}`} className={`calendar-chip calendar-chip-${item.status}`} title={`${time} ${item.title}`}>
			{content}
		</Link>
	);
}

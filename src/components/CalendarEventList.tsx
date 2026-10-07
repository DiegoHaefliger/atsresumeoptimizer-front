import { dayLabel, groupByDay } from "../lib/calendarRange";
import type { CalendarItem } from "../lib/calendarItems";
import { CalendarEventChip } from "./CalendarEventChip";
import { StateMessage } from "./StateMessage";

export function CalendarEventList({ items }: { items: CalendarItem[] }) {
	if (items.length === 0) {
		return <StateMessage variant="empty" layout="page" message="Nenhum compromisso neste período." />;
	}
	return (
		<ol className="calendar-list panel panel-body">
			{[...groupByDay(items)].map(([key, dayItems]) => (
				<li key={key}>
					<h3 className="calendar-day-heading">{dayLabel(dayItems[0].start)}</h3>
					{dayItems.map((item) => (
						<CalendarEventChip key={item.key} item={item} />
					))}
				</li>
			))}
		</ol>
	);
}

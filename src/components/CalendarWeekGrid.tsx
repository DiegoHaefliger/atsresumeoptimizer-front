import type { CalendarEvent } from "../api/types";
import { addDays, dayKey, dayLabel, groupByDay, gridStart } from "../lib/calendarRange";
import { CalendarEventChip } from "./CalendarEventChip";

const WEEK_DAYS = 7;

type CalendarWeekGridProps = {
	anchor: Date;
	events: CalendarEvent[];
	todayKey: string;
};

export function CalendarWeekGrid({ anchor, events, todayKey }: CalendarWeekGridProps) {
	const start = gridStart("week", anchor);
	const days = Array.from({ length: WEEK_DAYS }, (_, index) => addDays(start, index));
	const byDay = groupByDay(events);
	return (
		<div className="calendar-grid calendar-week" aria-label="Calendário da semana">
			{days.map((day) => {
				const key = dayKey(day);
				const dayEvents = byDay.get(key) ?? [];
				return (
					<section key={key} className={`calendar-day${key === todayKey ? " calendar-day-today" : ""}`}>
						<h3 className="calendar-day-heading">{dayLabel(day)}</h3>
						{dayEvents.length === 0 ? (
							<span className="calendar-empty">Sem agendamentos</span>
						) : (
							dayEvents.map((event) => <CalendarEventChip key={event.scheduleId} event={event} />)
						)}
					</section>
				);
			})}
		</div>
	);
}

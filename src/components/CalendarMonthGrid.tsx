import type { CalendarEvent } from "../api/types";
import { addDays, dayKey, groupByDay, gridStart, weekdayLabel } from "../lib/calendarRange";
import { CalendarEventChip } from "./CalendarEventChip";

const MONTH_GRID_DAYS = 42;
const WEEK_DAYS = 7;
const MAX_CHIPS_PER_DAY = 3;

type CalendarMonthGridProps = {
	anchor: Date;
	events: CalendarEvent[];
	todayKey: string;
};

export function CalendarMonthGrid({ anchor, events, todayKey }: CalendarMonthGridProps) {
	const start = gridStart("month", anchor);
	const days = Array.from({ length: MONTH_GRID_DAYS }, (_, index) => addDays(start, index));
	const byDay = groupByDay(events);
	return (
		<div className="calendar-grid calendar-month" role="grid" aria-label="Calendário do mês">
			{days.slice(0, WEEK_DAYS).map((day) => (
				<div key={`head-${day.getDay()}`} className="calendar-weekday" role="columnheader">
					{weekdayLabel(day)}
				</div>
			))}
			{days.map((day) => {
				const dayEvents = byDay.get(dayKey(day)) ?? [];
				const key = dayKey(day);
				return (
					<div
						key={key}
						role="gridcell"
						className={`calendar-day${day.getMonth() !== anchor.getMonth() ? " calendar-day-outside" : ""}${key === todayKey ? " calendar-day-today" : ""}`}
					>
						<span className="calendar-day-number">{day.getDate()}</span>
						{dayEvents.slice(0, MAX_CHIPS_PER_DAY).map((event) => (
							<CalendarEventChip key={event.scheduleId} event={event} />
						))}
						{dayEvents.length > MAX_CHIPS_PER_DAY && (
							<span className="calendar-more">+{dayEvents.length - MAX_CHIPS_PER_DAY} mais</span>
						)}
					</div>
				);
			})}
		</div>
	);
}

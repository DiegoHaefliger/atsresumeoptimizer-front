import { useState } from "react";
import { CalendarEventList } from "../components/CalendarEventList";
import { CalendarMonthGrid } from "../components/CalendarMonthGrid";
import { CalendarWeekGrid } from "../components/CalendarWeekGrid";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { dayKey, rangeTitle, shiftAnchor, visibleRange, type CalendarView } from "../lib/calendarRange";
import { useCalendarEvents } from "../lib/useCalendarEvents";

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
	{ value: "month", label: "Mês" },
	{ value: "week", label: "Semana" },
	{ value: "list", label: "Lista" },
];

export function CalendarPage() {
	const [view, setView] = useState<CalendarView>("month");
	const [anchor, setAnchor] = useState(() => new Date());
	const [todayKey] = useState(() => dayKey(new Date()));
	const { from, to } = visibleRange(view, anchor);
	const { events, failed, reload } = useCalendarEvents(from, to);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Agenda</span>
					<h1>Agenda dos processos</h1>
					<p className="page-subtitle">Entrevistas e testes agendados nos seus processos seletivos.</p>
				</div>
			</header>

			<div className="calendar-toolbar">
				<div className="calendar-nav">
					<button type="button" className="btn-secondary btn-small" onClick={() => setAnchor(shiftAnchor(view, anchor, -1))}>
						Anterior
					</button>
					<button type="button" className="btn-secondary btn-small" onClick={() => setAnchor(new Date())}>
						Hoje
					</button>
					<button type="button" className="btn-secondary btn-small" onClick={() => setAnchor(shiftAnchor(view, anchor, 1))}>
						Próximo
					</button>
				</div>
				<h2 className="calendar-title" aria-live="polite">
					{rangeTitle(view, anchor)}
				</h2>
				<SegmentedTabs label="Visualização" options={VIEW_OPTIONS} value={view} onChange={setView} />
			</div>

			{failed ? (
				<>
					<StateMessage variant="error" layout="inline" message="Não deu pra carregar a agenda." />
					<button type="button" className="btn-secondary btn-small" onClick={reload}>
						Tentar de novo
					</button>
				</>
			) : events === null ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando agenda...</span>
					<Skeleton width="100%" height={360} radius="var(--radius-lg)" />
				</div>
			) : view === "month" ? (
				<>
					<CalendarMonthGrid anchor={anchor} events={events} todayKey={todayKey} />
					<div className="calendar-month-fallback">
						<CalendarEventList events={events} />
					</div>
				</>
			) : view === "week" ? (
				<CalendarWeekGrid anchor={anchor} events={events} todayKey={todayKey} />
			) : (
				<CalendarEventList events={events} />
			)}
		</div>
	);
}

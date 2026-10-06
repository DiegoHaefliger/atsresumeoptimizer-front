import type { CalendarEvent } from "../api/types";

export type CalendarView = "month" | "week" | "list";

const DAYS_PER_WEEK = 7;
const MONTH_GRID_DAYS = 42;

const titleFormat = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const weekdayFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date: Date): Date {
	return addDays(startOfDay(date), -date.getDay());
}

function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function dayKey(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

export function gridStart(view: CalendarView, anchor: Date): Date {
	return view === "week" ? startOfWeek(anchor) : startOfWeek(startOfMonth(anchor));
}

export function visibleRange(view: CalendarView, anchor: Date): { from: Date; to: Date } {
	if (view === "week") {
		const from = startOfWeek(anchor);
		return { from, to: addDays(from, DAYS_PER_WEEK) };
	}
	if (view === "list") {
		const from = startOfMonth(anchor);
		return { from, to: new Date(from.getFullYear(), from.getMonth() + 1, 1) };
	}
	const from = gridStart(view, anchor);
	return { from, to: addDays(from, MONTH_GRID_DAYS) };
}

export function shiftAnchor(view: CalendarView, anchor: Date, direction: -1 | 1): Date {
	return view === "week"
		? addDays(anchor, direction * DAYS_PER_WEEK)
		: new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
}

export function rangeTitle(view: CalendarView, anchor: Date): string {
	if (view !== "week") {
		return titleFormat.format(anchor);
	}
	const { from, to } = visibleRange(view, anchor);
	return `${dayFormat.format(from)} - ${dayFormat.format(addDays(to, -1))}`;
}

export function weekdayLabel(date: Date): string {
	return weekdayFormat.format(date);
}

export function dayLabel(date: Date): string {
	return `${weekdayFormat.format(date)}, ${dayFormat.format(date)}`;
}

export function timeLabel(instant: string): string {
	return timeFormat.format(new Date(instant));
}

export function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
	const groups = new Map<string, CalendarEvent[]>();
	for (const event of events) {
		const key = dayKey(new Date(event.scheduledAt));
		groups.set(key, [...(groups.get(key) ?? []), event]);
	}
	return groups;
}

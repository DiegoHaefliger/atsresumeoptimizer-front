import type { AppNotification } from "../api/types";
import { dayKey } from "./calendarRange";

export type NotificationDayGroup = { key: string; label: string; items: AppNotification[] };

const dayFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function notificationTime(iso: string): string {
	return timeFormat.format(new Date(iso));
}

function dayLabel(date: Date, today: Date): string {
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (dayKey(date) === dayKey(today)) {
		return "Hoje";
	}
	if (dayKey(date) === dayKey(yesterday)) {
		return "Ontem";
	}
	return dayFormat.format(date);
}

export function groupByDay(notifications: AppNotification[], today: Date): NotificationDayGroup[] {
	const groups = new Map<string, NotificationDayGroup>();
	for (const notification of notifications) {
		const date = new Date(notification.createdAt);
		const key = dayKey(date);
		const group = groups.get(key) ?? { key, label: dayLabel(date, today), items: [] };
		group.items.push(notification);
		groups.set(key, group);
	}
	return [...groups.values()];
}

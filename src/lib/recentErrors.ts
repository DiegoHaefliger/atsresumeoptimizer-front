import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ats.recentErrors";
const MAX_ENTRIES = 20;
const REPEAT_WINDOW_MS = 30_000;

export type RecentErrorSource = "server" | "screen";

export type RecentError = {
	at: string;
	message: string;
	errorId: string | null;
	page: string;
	source: RecentErrorSource;
};

const listeners = new Set<() => void>();
let entries: RecentError[] = load();

function load(): RecentError[] {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
		return Array.isArray(stored) ? stored : [];
	} catch {
		return [];
	}
}

function publish(next: RecentError[]): void {
	entries = next;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// localStorage cheio ou bloqueado não pode derrubar o registro em memória
	}
	listeners.forEach((listener) => listener());
}

function repeatsLatest(entry: Omit<RecentError, "at">, now: number): boolean {
	const latest = entries[0];
	return Boolean(latest) && latest.message === entry.message && latest.page === entry.page
		&& now - Date.parse(latest.at) < REPEAT_WINDOW_MS;
}

export function recordRecentError(entry: Omit<RecentError, "at">): void {
	const now = Date.now();
	if (repeatsLatest(entry, now)) {
		return;
	}
	publish([{ ...entry, at: new Date(now).toISOString() }, ...entries].slice(0, MAX_ENTRIES));
}

export function clearRecentErrors(): void {
	publish([]);
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function useRecentErrors(): RecentError[] {
	return useSyncExternalStore(subscribe, () => entries);
}

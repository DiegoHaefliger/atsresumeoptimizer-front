import { useSyncExternalStore } from "react";

let unreachable = false;
const listeners = new Set<() => void>();

export function setServerUnreachable(next: boolean): void {
	if (unreachable === next) {
		return;
	}
	unreachable = next;
	listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function useServerUnreachable(): boolean {
	return useSyncExternalStore(subscribe, () => unreachable);
}

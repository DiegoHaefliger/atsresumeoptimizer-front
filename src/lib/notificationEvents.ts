const NOTIFICATIONS_CHANGED = "ats:notifications-changed";

export function announceNotificationsChanged(): void {
	window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}

export function onNotificationsChanged(listener: () => void): () => void {
	window.addEventListener(NOTIFICATIONS_CHANGED, listener);
	return () => window.removeEventListener(NOTIFICATIONS_CHANGED, listener);
}

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api/client";
import { onNotificationsChanged } from "./notificationEvents";
import { NOTIFICATIONS_PATH } from "./notificationsPath";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount(): number {
	const [count, setCount] = useState(0);

	const refresh = useCallback(() => {
		if (document.visibilityState === "hidden") {
			return;
		}
		apiGet<{ count: number }>(`${NOTIFICATIONS_PATH}/unread-count`)
			.then((loaded) => setCount(loaded.count))
			.catch(() => undefined);
	}, []);

	useEffect(() => {
		refresh();
		const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
		document.addEventListener("visibilitychange", refresh);
		const stopListening = onNotificationsChanged(refresh);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", refresh);
			stopListening();
		};
	}, [refresh]);

	return count;
}

import { useCallback } from "react";
import { apiDelete, apiPostJson } from "../api/client";
import type { AppNotification } from "../api/types";
import { announceNotificationsChanged } from "./notificationEvents";
import { NOTIFICATIONS_PATH } from "./notificationsPath";
import { useApiResource } from "./useApiResource";

const MAX_LISTED = 200;

export function useNotifications(unreadOnly: boolean) {
	const { data, setData, failed, reload } = useApiResource<AppNotification[]>(
		`${NOTIFICATIONS_PATH}?unreadOnly=${unreadOnly}&limit=${MAX_LISTED}`,
	);

	const markRead = useCallback(
		async (id: string) => {
			const updated = await apiPostJson<AppNotification>(`${NOTIFICATIONS_PATH}/${id}/read`, {});
			setData((current) =>
				unreadOnly
					? (current ?? []).filter((item) => item.id !== id)
					: (current ?? []).map((item) => (item.id === id ? updated : item)),
			);
			announceNotificationsChanged();
		},
		[setData, unreadOnly],
	);

	const markAllRead = useCallback(async () => {
		await apiPostJson<void>(`${NOTIFICATIONS_PATH}/read-all`, {});
		reload();
		announceNotificationsChanged();
	}, [reload]);

	const remove = useCallback(
		async (id: string) => {
			await apiDelete(`${NOTIFICATIONS_PATH}/${id}`);
			setData((current) => (current ?? []).filter((item) => item.id !== id));
			announceNotificationsChanged();
		},
		[setData],
	);

	return { notifications: data, failed, reload, markRead, markAllRead, remove };
}

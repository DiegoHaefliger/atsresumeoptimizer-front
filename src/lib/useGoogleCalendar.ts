import { useCallback } from "react";
import { apiDelete, apiGet, apiPostJson, apiPutJson } from "../api/client";
import type { GoogleCalendarStatus } from "../api/types";
import { useApiResource } from "./useApiResource";

const GOOGLE_PATH = "/api/v1/google-calendar";

export function useGoogleCalendar() {
	const { data, failed, reload } = useApiResource<GoogleCalendarStatus>(GOOGLE_PATH);

	const connect = useCallback(async () => {
		const { url } = await apiGet<{ url: string }>(`${GOOGLE_PATH}/authorize`);
		window.location.assign(url);
	}, []);

	const sync = useCallback(async () => (await apiPostJson<{ synced: number }>(`${GOOGLE_PATH}/sync`, {})).synced, []);

	const disconnect = useCallback(async () => {
		await apiDelete(`${GOOGLE_PATH}/connection`);
		reload();
	}, [reload]);

	const saveCredentials = useCallback(
		async (clientId: string, clientSecret: string) => {
			await apiPutJson<void>(`${GOOGLE_PATH}/credentials`, { clientId, clientSecret });
			reload();
		},
		[reload],
	);

	const clearCredentials = useCallback(async () => {
		await apiDelete(`${GOOGLE_PATH}/credentials`);
		reload();
	}, [reload]);

	return { status: data, failed, reload, connect, sync, disconnect, saveCredentials, clearCredentials };
}

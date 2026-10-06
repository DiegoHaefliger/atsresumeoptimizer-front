import { useCallback } from "react";
import { apiDelete, apiPostJson } from "../api/client";
import type { CalendarFeedInfo } from "../api/types";
import { useApiResource } from "./useApiResource";

export const CALENDAR_FEED_PATH = "/api/v1/calendar/feed-info";
const FEED_TOKEN_PATH = "/api/v1/calendar/feed/token";

export function useCalendarFeed() {
	const { data, setData, failed, reload } = useApiResource<CalendarFeedInfo>(CALENDAR_FEED_PATH);

	const regenerate = useCallback(async () => {
		setData(await apiPostJson<CalendarFeedInfo>(FEED_TOKEN_PATH, {}));
	}, [setData]);

	const disable = useCallback(async () => {
		await apiDelete(FEED_TOKEN_PATH);
		setData({ enabled: false, path: null });
	}, [setData]);

	return { info: data, failed, reload, regenerate, disable };
}

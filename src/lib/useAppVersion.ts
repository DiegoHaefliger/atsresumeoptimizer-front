import { useEffect } from "react";
import type { AppVersion } from "../api/types";
import { useApiResource } from "./useApiResource";

const RECHECK_INTERVAL_MS = 60 * 60 * 1000;

export function useAppVersion() {
	const { data, reload } = useApiResource<AppVersion>("/api/v1/app/version");

	useEffect(() => {
		const timer = setInterval(reload, RECHECK_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [reload]);

	return data;
}

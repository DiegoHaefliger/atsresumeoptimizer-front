import type { AppVersion } from "../api/types";
import { useApiResource } from "./useApiResource";

export function useAppVersion() {
	return useApiResource<AppVersion>("/api/v1/app/version").data;
}

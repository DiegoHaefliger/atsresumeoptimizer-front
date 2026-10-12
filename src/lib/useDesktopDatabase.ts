import { useApiResource } from "./useApiResource";
import type { DatabaseSettings } from "../api/types";
import { DESKTOP_DATABASE_PATH } from "./desktopDatabase";

export function useDesktopDatabase() {
	return useApiResource<DatabaseSettings>(DESKTOP_DATABASE_PATH);
}

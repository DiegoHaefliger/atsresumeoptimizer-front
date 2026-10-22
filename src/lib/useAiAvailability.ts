import type { AiSettingsView } from "../api/types";
import { useApiResource } from "./useApiResource";

export function useAiAvailability(): boolean | null {
	const { data, failed } = useApiResource<AiSettingsView>("/api/v1/ai-settings");
	if (failed) {
		return true;
	}
	if (!data) {
		return null;
	}
	return (data.providers ?? []).some((provider) => provider.enabled && provider.priority != null);
}

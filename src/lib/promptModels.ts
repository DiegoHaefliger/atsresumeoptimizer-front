import type { AiSettingsView } from "../api/types";

const HEAVY_TASK_KEY = "resume-structuring";

export type ModelInUse = { provider: string; model: string };

export function modelsInUse(settings: AiSettingsView | null, key: string): ModelInUse[] {
	return (settings?.providers ?? [])
		.filter((provider) => provider.enabled)
		.sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
		.map((provider) => ({
			provider: provider.label ?? "",
			model: (key === HEAVY_TASK_KEY && provider.heavyModel) || provider.model || "",
		}))
		.filter((item) => item.model !== "");
}

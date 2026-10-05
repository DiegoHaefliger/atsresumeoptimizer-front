import type { AiProviderView } from "../../api/types";
import type { BadgeTone } from "../Badge";

const KEY_SOURCE_LABELS: Record<string, { label: string; tone: BadgeTone }> = {
	DATABASE: { label: "Chave salva", tone: "success" },
	NONE: { label: "Sem chave", tone: "neutral" },
};

export function keyStatus(provider: AiProviderView): { label: string; tone: BadgeTone } {
	if (!provider.requiresApiKey) {
		return { label: "Local, sem chave", tone: "neutral" };
	}
	return KEY_SOURCE_LABELS[provider.apiKeySource ?? "NONE"];
}

export function isConfigured(provider: AiProviderView, typedApiKey: string, baseUrl: string): boolean {
	const hasKey = !provider.requiresApiKey || provider.apiKeySource !== "NONE" || typedApiKey.trim() !== "";
	const hasBaseUrl = !provider.requiresBaseUrl || baseUrl.trim() !== "";
	return hasKey && hasBaseUrl;
}

export function missingConfiguration(provider: AiProviderView): string {
	return provider.requiresApiKey ? "Configure a chave pra usar na fila" : "Informe o endereço pra usar na fila";
}

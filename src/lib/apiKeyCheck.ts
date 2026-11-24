import type { AiProvider } from "../api/types";

const MIN_KEY_LENGTH = 20;

export type KeyOrigin = { provider: AiProvider; presetId?: string; label: string };

export type KeyProblem =
	| { kind: "WRONG_PROVIDER"; origin: KeyOrigin }
	| { kind: "TOO_SHORT" };

const ORIGINS: { prefix: string; origin: KeyOrigin }[] = [
	{ prefix: "sk-ant-", origin: { provider: "ANTHROPIC", label: "Anthropic (Claude)" } },
	{ prefix: "sk-or-", origin: { provider: "OPENAI_COMPATIBLE", presetId: "openrouter", label: "OpenRouter" } },
	{ prefix: "gsk_", origin: { provider: "OPENAI_COMPATIBLE", presetId: "groq", label: "Groq" } },
	{ prefix: "AIza", origin: { provider: "GEMINI", label: "Google Gemini" } },
	{ prefix: "sk-", origin: { provider: "OPENAI", label: "OpenAI" } },
];

export function cleanApiKey(raw: string): string {
	return raw
		.trim()
		.replace(/^["'`]+|["'`]+$/g, "")
		.replace(/^Bearer\s+/i, "")
		.replace(/\s+/g, "");
}

export function keyOrigin(key: string): KeyOrigin | undefined {
	return ORIGINS.find(({ prefix }) => key.startsWith(prefix))?.origin;
}

export function keyProblem(provider: AiProvider, key: string, presetId?: string): KeyProblem | null {
	if (key === "") {
		return null;
	}
	const origin = keyOrigin(key);
	if (origin && isOtherProvider(origin, provider, presetId)) {
		return { kind: "WRONG_PROVIDER", origin };
	}
	return key.length < MIN_KEY_LENGTH ? { kind: "TOO_SHORT" } : null;
}

function isOtherProvider(origin: KeyOrigin, provider: AiProvider, presetId?: string): boolean {
	if (origin.provider !== provider) {
		return !(provider === "OPENAI_COMPATIBLE" && origin.provider === "OPENAI");
	}
	return origin.presetId !== undefined && presetId !== undefined && origin.presetId !== presetId;
}

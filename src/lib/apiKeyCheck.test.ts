import { describe, expect, it } from "vitest";
import { cleanApiKey, keyProblem } from "./apiKeyCheck";

const LONG = "x".repeat(40);

describe("cleanApiKey", () => {
	it("strips whitespace, quotes and Bearer prefix pasted along with the key", () => {
		expect(cleanApiKey(`  "sk-proj-${LONG}"\n`)).toBe(`sk-proj-${LONG}`);
		expect(cleanApiKey(`Bearer sk-ant-${LONG}`)).toBe(`sk-ant-${LONG}`);
		expect(cleanApiKey(`AIza ${LONG}`)).toBe(`AIza${LONG}`);
	});
});

describe("keyProblem", () => {
	it("accepts empty and matching keys", () => {
		expect(keyProblem("OPENAI", "")).toBeNull();
		expect(keyProblem("OPENAI", `sk-proj-${LONG}`)).toBeNull();
		expect(keyProblem("ANTHROPIC", `sk-ant-${LONG}`)).toBeNull();
		expect(keyProblem("GEMINI", `AIza${LONG}`)).toBeNull();
	});

	it("points to the provider the key belongs to", () => {
		expect(keyProblem("OPENAI", `sk-ant-${LONG}`)).toEqual({
			kind: "WRONG_PROVIDER",
			origin: { provider: "ANTHROPIC", label: "Anthropic (Claude)" },
		});
		expect(keyProblem("ANTHROPIC", `AIza${LONG}`)).toMatchObject({ origin: { provider: "GEMINI" } });
		expect(keyProblem("OPENAI", `gsk_${LONG}`)).toMatchObject({ origin: { presetId: "groq" } });
	});

	it("accepts sk- keys on OpenAI-compatible servers but flags a preset mismatch", () => {
		expect(keyProblem("OPENAI_COMPATIBLE", `sk-${LONG}`)).toBeNull();
		expect(keyProblem("OPENAI_COMPATIBLE", `sk-${LONG}`, "deepseek")).toBeNull();
		expect(keyProblem("OPENAI_COMPATIBLE", `gsk_${LONG}`, "groq")).toBeNull();
		expect(keyProblem("OPENAI_COMPATIBLE", `gsk_${LONG}`, "openrouter")).toMatchObject({ kind: "WRONG_PROVIDER" });
	});

	it("flags keys that look cut off", () => {
		expect(keyProblem("OPENAI", "sk-abc")).toEqual({ kind: "TOO_SHORT" });
	});
});

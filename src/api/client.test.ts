import { afterEach, describe, expect, it, vi } from "vitest";
import { apiPostJson } from "./client";

function respond(status: number, body: string) {
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body || null, { status })));
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("apiPostJson", () => {
	it("accepts an empty 202 answer", async () => {
		respond(202, "");
		await expect(apiPostJson<void>("/api/v1/job-search/run", {})).resolves.toBeUndefined();
	});

	it("accepts an empty 204 answer", async () => {
		respond(204, "");
		await expect(apiPostJson<void>("/x", {})).resolves.toBeUndefined();
	});

	it("still parses a JSON body", async () => {
		respond(200, '{"jobId":"abc"}');
		await expect(apiPostJson<{ jobId: string }>("/x", {})).resolves.toEqual({ jobId: "abc" });
	});

	it("turns an error answer into the server message", async () => {
		respond(409, '{"detail":"Já tem uma busca em andamento."}');
		await expect(apiPostJson<void>("/x", {})).rejects.toThrow("Já tem uma busca em andamento.");
	});
});

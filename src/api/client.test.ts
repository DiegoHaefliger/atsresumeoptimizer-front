import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useServerUnreachable } from "../lib/serverReachability";
import { ApiError, apiGet, apiPostJson } from "./client";

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

describe("server reachability", () => {
	it("flags the server as unreachable when fetch fails, and clears it on the next answer", async () => {
		const { result, rerender } = renderHook(() => useServerUnreachable());
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

		await expect(apiGet("/x")).rejects.toEqual(new ApiError("Sem conexão com o servidor.", 0));
		rerender();
		expect(result.current).toBe(true);

		respond(200, "[]");
		await apiGet("/x");
		rerender();
		expect(result.current).toBe(false);
	});
});

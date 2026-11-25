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

describe("apiGet timeout", () => {
	it("turns a timed out request into an ApiError instead of hanging", async () => {
		const fetchMock = vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError"));
		vi.stubGlobal("fetch", fetchMock);

		const result = apiGet("/api/v1/ai-settings", 20_000);

		await expect(result).rejects.toBeInstanceOf(ApiError);
		await expect(result).rejects.toThrow("O servidor demorou demais para responder");
		expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
	});

	it("sends no timeout signal when none is asked", async () => {
		respond(200, "{}");

		await apiGet("/api/v1/jobs");

		expect(vi.mocked(fetch).mock.calls[0][1]).toBeUndefined();
	});
});

describe("server failures", () => {
	afterEach(() => localStorage.clear());

	it("shows the error code of a server failure and keeps it in the recent errors", async () => {
		respond(500, '{"detail":"Algo deu errado no servidor.","errorId":"K7Q3XM2A"}');

		const failure = await apiGet("/x").catch((error: unknown) => error);

		expect(failure).toBeInstanceOf(ApiError);
		expect((failure as ApiError).message).toBe("Algo deu errado no servidor. (código do erro: K7Q3XM2A)");
		expect((failure as ApiError).errorId).toBe("K7Q3XM2A");
		expect(JSON.parse(localStorage.getItem("ats.recentErrors") ?? "[]")[0]).toMatchObject({
			errorId: "K7Q3XM2A",
			source: "server",
		});
	});

	it("keeps business messages clean", async () => {
		respond(400, '{"detail":"Informe o nome da vaga.","errorId":"K7Q3XM2A"}');

		await expect(apiGet("/x")).rejects.toThrow(/^Informe o nome da vaga\.$/);
	});
});

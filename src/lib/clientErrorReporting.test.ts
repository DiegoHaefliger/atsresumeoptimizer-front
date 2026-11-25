import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function freshModule() {
	vi.resetModules();
	return import("./clientErrorReporting");
}

function answerWith(errorId: string) {
	const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ errorId }), { status: 201 }));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

beforeEach(() => localStorage.clear());

afterEach(() => vi.unstubAllGlobals());

describe("reportClientError", () => {
	it("sends the error to the server and remembers the returned code", async () => {
		const fetchMock = answerWith("K7Q3XM2A");
		const { reportClientError } = await freshModule();

		await expect(reportClientError(new TypeError("x is undefined"), "at JobList")).resolves.toBe("K7Q3XM2A");

		const body = JSON.parse(fetchMock.mock.calls[0][1].body);
		expect(body).toMatchObject({ message: "TypeError: x is undefined", componentStack: "at JobList" });
		expect(JSON.parse(localStorage.getItem("ats.recentErrors") ?? "[]")[0]).toMatchObject({ errorId: "K7Q3XM2A", source: "screen" });
	});

	it("does not flood the server with the same error", async () => {
		const fetchMock = answerWith("K7Q3XM2A");
		const { reportClientError } = await freshModule();

		await reportClientError(new Error("loop"));
		await expect(reportClientError(new Error("loop"))).resolves.toBeNull();

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("still lists the error when the server cannot be reached", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
		const { reportClientError } = await freshModule();

		await expect(reportClientError(new Error("quebrou"))).resolves.toBeNull();

		expect(JSON.parse(localStorage.getItem("ats.recentErrors") ?? "[]")[0]).toMatchObject({ errorId: null, message: "Error: quebrou" });
	});
});

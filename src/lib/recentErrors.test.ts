import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
	localStorage.clear();
	vi.resetModules();
});

describe("recordRecentError", () => {
	it("ignores the same failure repeated by background polling", async () => {
		const { recordRecentError } = await import("./recentErrors");

		recordRecentError({ message: "Falhou", errorId: "AAAA2222", page: "/about", source: "server" });
		recordRecentError({ message: "Falhou", errorId: "BBBB3333", page: "/about", source: "server" });
		recordRecentError({ message: "Outro", errorId: "CCCC4444", page: "/about", source: "server" });

		const stored = JSON.parse(localStorage.getItem("ats.recentErrors") ?? "[]");
		expect(stored.map((entry: { errorId: string }) => entry.errorId)).toEqual(["CCCC4444", "AAAA2222"]);
	});
});

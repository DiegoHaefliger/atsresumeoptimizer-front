import { afterEach, describe, expect, it, vi } from "vitest";
import { captureWithExtension, CaptureFailedError, checkExtension, isOlderVersion, MIN_EXTENSION_VERSION, probeExtension } from "./linkedinExtension";

type AppMessage = { source: string; type: string; id: string };

function extensionAnswers(answer: (message: AppMessage) => Record<string, unknown>[]) {
	const listener = (event: MessageEvent) => {
		const message = event.data as AppMessage;
		if (message?.source !== "ats-app") {
			return;
		}
		for (const reply of answer(message)) {
			window.dispatchEvent(
				new MessageEvent("message", { data: { source: "ats-extension", id: message.id, ...reply }, source: window, origin: window.location.origin }),
			);
		}
	};
	window.addEventListener("message", listener);
	return () => window.removeEventListener("message", listener);
}

afterEach(() => {
	vi.useRealTimers();
});

describe("checkExtension", () => {
	it("is current when the extension answers with the minimum version or newer", async () => {
		const stop = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong", version: "0.3.6" }] : []));

		await expect(checkExtension(500)).resolves.toBe("current");
		stop();
	});

	it("is outdated when the extension answers with an older or unknown version", async () => {
		const stopOld = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong", version: "0.3.5" }] : []));
		await expect(checkExtension(500)).resolves.toBe("outdated");
		stopOld();

		const stopUnknown = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong" }] : []));
		await expect(checkExtension(500)).resolves.toBe("outdated");
		stopUnknown();
	});

	it("is missing when nobody answers", async () => {
		await expect(checkExtension(30)).resolves.toBe("missing");
	});
});

describe("checkExtension with the newest version published by the app", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("is outdated when the app publishes a newer version than the installed one", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: "0.9.0" }) }));
		const stop = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong", version: "0.3.8" }] : []));

		const probe = await probeExtension(500);

		expect(probe).toMatchObject({ status: "outdated", requiredVersion: "0.9.0" });
		stop();
	});

	it("is current when the installed version is the published one", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: "0.9.0" }) }));
		const stop = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong", version: "0.9.0" }] : []));

		await expect(checkExtension(500)).resolves.toBe("current");
		stop();
	});

	it("falls back to the minimum version when the published one cannot be read", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		const stop = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong", version: MIN_EXTENSION_VERSION }] : []));

		await expect(checkExtension(500)).resolves.toBe("current");
		stop();
	});
});

describe("isOlderVersion", () => {
	it("compares numerically, not as text", () => {
		expect(isOlderVersion("0.10.0", "0.9.0")).toBe(false);
		expect(isOlderVersion("0.3.5", "0.3.6")).toBe(true);
		expect(isOlderVersion("1.0", "0.3.6")).toBe(false);
	});
});

describe("captureWithExtension", () => {
	it("reports progress and resolves with the stored snapshot", async () => {
		const snapshot = { id: "s1", unchanged: true, changedSections: [] };
		const stop = extensionAnswers((message) =>
			message.type === "capture" ? [{ type: "progress", step: 1, total: 3 }, { type: "progress", step: 2, total: 3 }, { type: "result", snapshot }] : [],
		);
		const onProgress = vi.fn();

		const result = await captureWithExtension({ profileUrl: "https://www.linkedin.com/in/ana/", onProgress });

		expect(result).toEqual(snapshot);
		expect(onProgress).toHaveBeenNthCalledWith(1, { step: 1, total: 3 });
		expect(onProgress).toHaveBeenNthCalledWith(2, { step: 2, total: 3 });
		stop();
	});

	it("rejects with the reason the extension gave", async () => {
		const stop = extensionAnswers((message) =>
			message.type === "capture" ? [{ type: "error", code: "login-required", message: "Entre no LinkedIn" }] : [],
		);

		const failure = await captureWithExtension({}).catch((error) => error);

		expect(failure).toBeInstanceOf(CaptureFailedError);
		expect(failure.code).toBe("login-required");
		expect(failure.message).toBe("Entre no LinkedIn");
		stop();
	});

	it("ignores messages for another request", async () => {
		const stop = extensionAnswers((message) =>
			message.type === "capture"
				? [{ id: "other", type: "result", snapshot: { id: "x" } }, { type: "result", snapshot: { id: "mine" } }]
				: [],
		);

		await expect(captureWithExtension({})).resolves.toMatchObject({ id: "mine" });
		stop();
	});
});

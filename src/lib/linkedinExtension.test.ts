import { afterEach, describe, expect, it, vi } from "vitest";
import { captureWithExtension, CaptureFailedError, pingExtension } from "./linkedinExtension";

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

describe("pingExtension", () => {
	it("is true when the extension answers", async () => {
		const stop = extensionAnswers((message) => (message.type === "ping" ? [{ type: "pong" }] : []));

		await expect(pingExtension(500)).resolves.toBe(true);
		stop();
	});

	it("is false when nobody answers", async () => {
		await expect(pingExtension(30)).resolves.toBe(false);
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

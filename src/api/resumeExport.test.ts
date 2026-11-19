import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VALUE_EVENT } from "../lib/feedbackPrompt";
import { downloadResume } from "./resumeExport";

vi.mock("./client", () => ({ apiDownload: vi.fn().mockResolvedValue({ blob: new Blob(["x"]), fileName: "cv.pdf" }) }));

beforeEach(() => {
	localStorage.clear();
	URL.createObjectURL = vi.fn(() => "blob:x");
	URL.revokeObjectURL = vi.fn();
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("downloadResume", () => {
	it("counts a finished download as a moment to ask for feedback, from any screen", async () => {
		const listener = vi.fn();
		window.addEventListener(VALUE_EVENT, listener);

		await downloadResume("r1", "v1", "PDF");

		expect(listener).toHaveBeenCalledTimes(1);
		window.removeEventListener(VALUE_EVENT, listener);
	});
});

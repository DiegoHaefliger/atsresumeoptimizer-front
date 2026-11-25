import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROMPT_DELAY_MS, recordValueEvent } from "../lib/feedbackPrompt";
import { FeedbackPrompt } from "./FeedbackPrompt";

vi.mock("../lib/useAppVersion", () => ({ useAppVersion: () => ({ current: "1.4.0" }) }));

function Where() {
	const location = useLocation();
	return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderPrompt(path = "/jobs") {
	render(
		<MemoryRouter initialEntries={[path]}>
			<FeedbackPrompt />
			<Routes>
				<Route path="*" element={<Where />} />
			</Routes>
		</MemoryRouter>,
	);
}

async function valueMoment() {
	await act(async () => {
		recordValueEvent();
		await vi.advanceTimersByTimeAsync(PROMPT_DELAY_MS + 100);
	});
}

beforeEach(() => {
	localStorage.clear();
	vi.useFakeTimers();
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("FeedbackPrompt", () => {
	it("stays quiet on its own, however long the app stays open", async () => {
		renderPrompt();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(60_000);
		});

		expect(screen.queryByText("Gostou do resultado?")).toBeNull();
	});

	it("asks right after the person got something done", async () => {
		renderPrompt();

		await valueMoment();

		expect(screen.getByText("Gostou do resultado?")).toBeTruthy();
	});

	it("goes straight to the form with the chosen rating", async () => {
		renderPrompt();
		await valueMoment();

		fireEvent.click(screen.getByRole("radio", { name: /4 estrelas/ }));

		expect(screen.getByTestId("where").textContent).toBe("/about?tab=feedback&rating=4");
		expect(screen.queryByText("Gostou do resultado?")).toBeNull();
	});

	it("does not come back for a week after Agora não, even after another good moment", async () => {
		renderPrompt();
		await valueMoment();
		fireEvent.click(screen.getByRole("button", { name: "Agora não" }));

		await valueMoment();

		expect(screen.queryByText("Gostou do resultado?")).toBeNull();
	});

	it("does not show on the feedback page itself", async () => {
		renderPrompt("/about?tab=feedback");

		await valueMoment();

		expect(screen.queryByText("Gostou do resultado?")).toBeNull();
	});
});

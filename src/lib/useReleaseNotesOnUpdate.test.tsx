import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReleaseNotesOnUpdate } from "./useReleaseNotesOnUpdate";

function CurrentPath() {
	const { pathname, search } = useLocation();
	return <p data-testid="path">{pathname + search}</p>;
}

function Shell() {
	useReleaseNotesOnUpdate();
	return (
		<Routes>
			<Route path="*" element={<CurrentPath />} />
		</Routes>
	);
}

function serveVersion(current: string) {
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ current, updateAvailable: false }))));
}

beforeEach(() => localStorage.clear());

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function renderAt(path: string) {
	render(
		<MemoryRouter initialEntries={[path]}>
			<Shell />
		</MemoryRouter>,
	);
}

describe("useReleaseNotesOnUpdate", () => {
	it("opens the release notes the first time a new version runs", async () => {
		localStorage.setItem("ats-last-seen-version", "1.1.12");
		serveVersion("1.1.13");

		renderAt("/jobs");

		await vi.waitFor(() => expect(screen.getByTestId("path").textContent).toBe("/about"));
		expect(localStorage.getItem("ats-last-seen-version")).toBe("1.1.13");
	});

	it("opens the release notes right after the first install", async () => {
		serveVersion("1.1.13");

		renderAt("/jobs");

		await vi.waitFor(() => expect(screen.getByTestId("path").textContent).toBe("/about"));
	});

	it("leaves the user where they are once the version was seen", async () => {
		localStorage.setItem("ats-last-seen-version", "1.1.13");
		serveVersion("1.1.13");

		renderAt("/jobs");

		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(screen.getByTestId("path").textContent).toBe("/jobs");
	});
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AboutPage } from "./AboutPage";

function Where() {
	const location = useLocation();
	return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderAt(path: string) {
	vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("{}", { status: 404 }))));
	render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/about" element={<AboutPage />} />
				<Route path="/help" element={<Where />} />
			</Routes>
		</MemoryRouter>,
	);
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("AboutPage", () => {
	it("sends old diagnostics and feedback links to the Help page", () => {
		renderAt("/about?tab=feedback&rating=4");
		expect(screen.getByTestId("where").textContent).toBe("/help?tab=feedback&rating=4");
	});

	it("shows version, links and release notes on a single page", () => {
		renderAt("/about?tab=version");
		expect(screen.getByRole("heading", { name: "Novidades por versão" })).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Projeto" })).toBeTruthy();
		expect(screen.queryByRole("tablist")).toBeNull();
	});
});

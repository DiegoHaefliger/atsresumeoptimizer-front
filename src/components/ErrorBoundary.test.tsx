import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Broken(): never {
	throw new Error("tela quebrou");
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	localStorage.clear();
});

describe("ErrorBoundary", () => {
	it("replaces the broken screen with the error code the server registered", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"errorId":"K7Q3XM2A"}', { status: 201 })));

		render(
			<MemoryRouter>
				<ErrorBoundary>
					<Broken />
				</ErrorBoundary>
			</MemoryRouter>,
		);

		expect(screen.getByRole("heading", { name: "Esta tela encontrou um erro" })).toBeTruthy();
		expect(await screen.findByText("K7Q3XM2A")).toBeTruthy();
		expect(screen.getByRole("link", { name: /diagnóstico/ }).getAttribute("href")).toBe("/about?tab=diagnostics");
	});
});

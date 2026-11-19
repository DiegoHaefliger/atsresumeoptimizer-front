import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiPostJson } from "../api/client";
import { LinkedInReceivePage } from "./LinkedInReceivePage";

vi.mock("../api/client", async (importOriginal) => ({
	...(await importOriginal<typeof import("../api/client")>()),
	apiPostJson: vi.fn(),
}));

function receive(value: unknown) {
	window.location.hash = `#${btoa(unescape(encodeURIComponent(JSON.stringify(value))))}`;
}

beforeEach(() => window.localStorage.clear());

afterEach(() => {
	cleanup();
	window.location.hash = "";
	vi.clearAllMocks();
});

function renderPage() {
	render(
		<MemoryRouter>
			<LinkedInReceivePage />
		</MemoryRouter>,
	);
}

describe("LinkedInReceivePage", () => {
	it("shows what was read, links the missing pages and sends the reading", async () => {
		receive({ page: "profile", profile: { profileUrl: "https://www.linkedin.com/in/ana/", headline: "Dev Java", about: "Sobre" } });
		vi.mocked(apiPostJson).mockResolvedValue({ unchanged: false, changedSections: ["HEADLINE"] });
		renderPage();

		await screen.findByText("O que foi lido");
		expect(screen.getAllByText("Sobre").length).toBeGreaterThan(0);
		expect(screen.getByRole("link", { name: "Competências" }).getAttribute("href")).toBe("https://www.linkedin.com/in/ana/details/skills/");

		fireEvent.click(screen.getByRole("button", { name: "Enviar e analisar" }));

		await screen.findByText("Perfil enviado. Mudou: Título.");
		expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/snapshots/bookmarklet", {
			profile: { profileUrl: "https://www.linkedin.com/in/ana/", headline: "Dev Java", about: "Sobre" },
		});
		expect(window.localStorage.getItem("linkedin-bookmarklet-draft")).toBeNull();
	});

	it("accumulates readings from several clicks of the bookmarklet", async () => {
		window.localStorage.setItem(
			"linkedin-bookmarklet-draft",
			JSON.stringify({ profile: { headline: "Dev Java" }, updatedAt: Date.now() }),
		);
		receive({ page: "details:skills", profile: { skills: ["Java", "Spring"] } });
		renderPage();

		await screen.findByText("O que foi lido");
		await waitFor(() => expect(screen.getByText("Competências").className).toContain("keyword-pill-found"));
		expect(screen.getByText("Título").className).toContain("keyword-pill-found");
	});

	it("explains what to do when nothing was received", async () => {
		renderPage();

		await screen.findByText(/Nenhuma leitura recebida ainda/);
		expect(screen.queryByRole("button", { name: "Enviar e analisar" })).toBeNull();
	});
});

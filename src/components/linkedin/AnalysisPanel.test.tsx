import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, apiPostForm, apiPostJson } from "../../api/client";
import type { LinkedInAnalysisResponse } from "../../api/linkedinTypes";
import { captureWithExtension, CaptureFailedError, pingExtension } from "../../lib/linkedinExtension";
import { AnalysisPanel } from "./AnalysisPanel";

vi.mock("../../api/client", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../api/client")>()),
	apiGet: vi.fn(),
	apiPostForm: vi.fn(),
	apiPostJson: vi.fn(),
}));
vi.mock("../../lib/linkedinExtension", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../lib/linkedinExtension")>()),
	pingExtension: vi.fn(),
	captureWithExtension: vi.fn(),
}));

const ANALYSIS: LinkedInAnalysisResponse = {
	id: "a1",
	snapshotId: "s1",
	createdAt: "2026-11-19T12:00:00Z",
	overallScore: 70,
	summary: "Perfil razoável.",
	topActions: [],
	recruiterKeywords: [],
	missingKeywords: [],
	sections: [],
	imagesAnalyzed: true,
};

beforeEach(() => {
	window.sessionStorage.clear();
	vi.mocked(apiGet).mockImplementation(async (path: string) => {
		if (path.endsWith("/snapshots/latest")) {
			return { id: "s1", capturedAt: "2026-11-19T11:00:00Z", profile: { profileUrl: "https://www.linkedin.com/in/ana/" } };
		}
		if (path.endsWith("/analyses/latest")) {
			throw new ApiError("não achou", 404);
		}
		return [];
	});
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

function renderPanel() {
	render(<AnalysisPanel hasProfile hasSnapshot onGoTo={() => {}} />);
}

describe("AnalysisPanel", () => {
	it("says which reading the analysis used and what that source leaves out", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/analyses/latest")) {
				return ANALYSIS;
			}
			if (path.endsWith("/snapshots/s1")) {
				return { id: "s1", source: "PDF", capturedAt: "2026-11-19T11:00:00Z", profile: {}, missingSections: ["PHOTO", "BANNER", "FEATURED"] };
			}
			return [];
		});
		renderPanel();

		await screen.findByText(/Esta análise usa a leitura de .* feita pelo PDF do perfil\./);
		expect(screen.getByText(/Sem leitura, e por isso fora da análise: Foto de perfil, Banner, Em destaque\./)).toBeTruthy();
		expect(screen.getByText(/Para uma análise completa, leia o perfil pela extensão\./)).toBeTruthy();
	});

	it("does not add warnings for a reading from the extension with every section", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/analyses/latest")) {
				return ANALYSIS;
			}
			if (path.endsWith("/snapshots/s1")) {
				return { id: "s1", source: "EXTENSION", capturedAt: "2026-11-19T11:00:00Z", profile: {}, missingSections: [] };
			}
			return [];
		});
		renderPanel();

		await screen.findByText(/Esta análise usa a leitura de .* feita pela extensão\./);
		expect(screen.queryByText(/Sem leitura/)).toBeNull();
		expect(screen.queryByText(/Para uma análise completa/)).toBeNull();
	});

	it("imports the exported pdf and analyzes the snapshot it produced", async () => {
		vi.mocked(pingExtension).mockResolvedValue(false);
		vi.mocked(apiPostForm).mockResolvedValue({ id: "s7", unchanged: false, changedSections: ["HEADLINE"] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));
		await screen.findByText(/Ou, sem instalar nada: importe o PDF do seu perfil/);

		fireEvent.change(screen.getByLabelText("PDF do perfil do LinkedIn"), {
			target: { files: [new File(["%PDF"], "Profile.pdf", { type: "application/pdf" })] },
		});

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s7" }));
		expect(apiPostForm).toHaveBeenCalledWith("/api/v1/linkedin/snapshots/pdf", expect.any(FormData));
		await screen.findByText("Mudou desde a última leitura: Título.");
	});

	it("shows the reason when the pdf cannot be read and keeps the options open", async () => {
		vi.mocked(pingExtension).mockResolvedValue(false);
		vi.mocked(apiPostForm).mockRejectedValue(new ApiError("Este arquivo não parece ser o PDF do seu perfil do LinkedIn.", 400));
		renderPanel();
		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));
		await screen.findByText(/Ou, sem instalar nada/);

		fireEvent.change(screen.getByLabelText("PDF do perfil do LinkedIn"), {
			target: { files: [new File(["x"], "Profile.pdf", { type: "application/pdf" })] },
		});

		await screen.findByText("Este arquivo não parece ser o PDF do seu perfil do LinkedIn.");
		expect(screen.getByText(/Ou, sem instalar nada/)).toBeTruthy();
		expect(apiPostJson).not.toHaveBeenCalled();
	});

	it("uses a reading imported in the last ten minutes when there is no extension", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/snapshots/latest")) {
				return { id: "s9", source: "PDF", capturedAt: new Date(Date.now() - 60_000).toISOString(), profile: {} };
			}
			if (path.endsWith("/analyses/latest")) {
				throw new ApiError("não achou", 404);
			}
			return [];
		});
		vi.mocked(pingExtension).mockResolvedValue(false);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s9" }));
		expect(screen.queryByText("Instale a extensão para ler o seu perfil sozinho")).toBeNull();
	});

	it("asks to update the extension when the user already read the profile through it before", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/snapshots/latest")) {
				return { id: "s1", source: "EXTENSION", capturedAt: "2026-11-19T11:00:00Z", profile: {} };
			}
			if (path.endsWith("/analyses/latest")) {
				throw new ApiError("não achou", 404);
			}
			return [];
		});
		vi.mocked(pingExtension).mockResolvedValue(false);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Atualize a extensão para ler o seu perfil sozinho");
		expect(screen.getByRole("button", { name: /Baixar a versão nova/ })).toBeTruthy();
	});

	it("starts the analysis on its own once the extension shows up", async () => {
		vi.mocked(pingExtension).mockResolvedValue(false);
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: false, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));
		await screen.findByText("Instale a extensão para ler o seu perfil sozinho");

		vi.mocked(pingExtension).mockResolvedValue(true);

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s2" }), { timeout: 6000 });
	}, 10000);

	it("offers to open LinkedIn when the user is not logged in and retries by itself when they come back", async () => {
		vi.mocked(pingExtension).mockResolvedValue(true);
		vi.mocked(captureWithExtension).mockRejectedValueOnce(new CaptureFailedError("Entre no LinkedIn neste navegador e tente de novo.", "login-required"));
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: false, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));
		await screen.findByRole("button", { name: "Abrir o LinkedIn" });
		expect(apiPostJson).not.toHaveBeenCalled();

		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s2" }));
	});

	it("reads the profile through the extension and then analyzes the fresh snapshot", async () => {
		vi.mocked(pingExtension).mockResolvedValue(true);
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: true, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue({ ...ANALYSIS, unchanged: true });
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText(/Seu perfil não mudou desde a última leitura/);
		expect(captureWithExtension).toHaveBeenCalledWith(expect.objectContaining({ profileUrl: "https://www.linkedin.com/in/ana/" }));
		expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s2" });
	});

	it("lists the sections that changed since the last reading", async () => {
		vi.mocked(pingExtension).mockResolvedValue(true);
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: false, changedSections: ["HEADLINE", "SKILLS"] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Mudou desde a última leitura: Título, Competências.");
	});

	it("does not analyze without a fresh reading when the extension is missing", async () => {
		vi.mocked(pingExtension).mockResolvedValue(false);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Instale a extensão para ler o seu perfil sozinho");
		expect(screen.getByRole("button", { name: /Baixar extensão/ })).toBeTruthy();
		expect(screen.queryByText("Ver como ler o perfil")).toBeNull();
		await waitFor(() => expect(apiPostJson).not.toHaveBeenCalled());
		expect(captureWithExtension).not.toHaveBeenCalled();
	});
});

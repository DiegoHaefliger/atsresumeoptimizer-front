import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, apiPostForm, apiPostJson } from "../../api/client";
import type { LinkedInAnalysisResponse } from "../../api/linkedinTypes";
import { captureWithExtension, CaptureFailedError, checkExtension, probeExtension, type ExtensionStatus } from "../../lib/linkedinExtension";
import { AnalysisPanel } from "./AnalysisPanel";

vi.mock("../../api/client", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../api/client")>()),
	apiGet: vi.fn(),
	apiPostForm: vi.fn(),
	apiPostJson: vi.fn(),
}));
vi.mock("../../lib/linkedinExtension", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../lib/linkedinExtension")>()),
	checkExtension: vi.fn(),
	probeExtension: vi.fn(),
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

function extensionIs(status: ExtensionStatus) {
	vi.mocked(checkExtension).mockResolvedValue(status);
	vi.mocked(probeExtension).mockResolvedValue({ status, version: status === "missing" ? null : status === "outdated" ? "0.2.0" : "0.2.2" });
}

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

function withoutAnySnapshot() {
	vi.mocked(apiGet).mockImplementation(async (path: string) => {
		if (path.endsWith("/snapshots/latest") || path.endsWith("/analyses/latest")) {
			throw new ApiError("não achou", 404);
		}
		return [];
	});
}

function renderPanel() {
	render(<AnalysisPanel hasProfile hasSnapshot onGoTo={() => {}} />);
}

describe("AnalysisPanel", () => {
	const READINGS = [
		{ id: "pdf1", source: "PDF", capturedAt: "2026-11-19T10:00:00Z" },
		{ id: "ext1", source: "EXTENSION", capturedAt: "2026-11-19T11:00:00Z" },
		{ id: "ext0", source: "EXTENSION", capturedAt: "2026-11-18T09:00:00Z" },
		{ id: "pdf0", source: "PDF", capturedAt: "2026-11-17T09:00:00Z" },
	];

	function withReadings() {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/snapshots")) {
				return READINGS;
			}
			if (path.endsWith("/snapshots/latest")) {
				return { id: "ext1", source: "EXTENSION", capturedAt: READINGS[1].capturedAt, profile: { profileUrl: "https://www.linkedin.com/in/ana/" } };
			}
			if (path.endsWith("/analyses/latest")) {
				throw new ApiError("não achou", 404);
			}
			return [];
		});
	}

	it("offers only the last pdf and the last extension reading, the most recent first and selected", async () => {
		withReadings();
		renderPanel();

		const options = await screen.findAllByRole("radio");

		expect(options).toHaveLength(2);
		expect(options[0].getAttribute("value")).toBe("ext1");
		expect((options[0] as HTMLInputElement).checked).toBe(true);
		expect(options[1].getAttribute("value")).toBe("pdf1");
		expect(screen.getByText(/mais recente/)).toBeTruthy();
	});

	it("does not block the analysis when the extension does not answer and a reading already exists", async () => {
		withReadings();
		extensionIs("missing");
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		await screen.findAllByRole("radio");

		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "ext1" }));
		await screen.findByText(/atualize-a na aba Dados do LinkedIn\), então usei a leitura da extensão de/);
		expect(screen.queryByText("Instale a extensão para ler o seu perfil sozinho")).toBeNull();
		expect(screen.queryByText("Atualize a extensão para ler o seu perfil sozinho")).toBeNull();
	});

	it("warns up front when the installed extension is outdated", async () => {
		withReadings();
		extensionIs("outdated");
		renderPanel();

		expect(await screen.findByText("Atualize a extensão do Chrome")).toBeTruthy();
		expect(screen.getByRole("button", { name: /Baixar extensão atualizada/ })).toBeTruthy();
	});

	it("shows the installed extension version", async () => {
		withReadings();
		extensionIs("current");
		renderPanel();

		expect((await screen.findByTestId("extension-version")).textContent).toBe("Extensão do Chrome: versão 0.2.2 (atualizada)");
	});

	it("does not read with an outdated extension and uses the existing reading, saying why", async () => {
		withReadings();
		extensionIs("outdated");
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		await screen.findAllByRole("radio");

		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "ext1" }));
		expect(captureWithExtension).not.toHaveBeenCalled();
		await screen.findByText(/a extensão está desatualizada e lê o perfil incompleto/);
	});

	it("falls back to the chosen reading when the extension cannot read the profile", async () => {
		withReadings();
		extensionIs("current");
		vi.mocked(captureWithExtension).mockRejectedValue(new CaptureFailedError("Entre no LinkedIn neste navegador.", "login-required"));
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		await screen.findAllByRole("radio");

		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "ext1" }));
		await screen.findByText(/Entre no LinkedIn neste navegador\.\), então usei a leitura da extensão de/);
	});

	it("says so when the readings could not be loaded instead of hiding the choice silently", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/snapshots")) {
				throw new ApiError("Invalid CORS request", 403);
			}
			if (path.endsWith("/analyses/latest")) {
				throw new ApiError("não achou", 404);
			}
			return [];
		});
		renderPanel();

		await screen.findByText("Não consegui carregar as leituras do LinkedIn para você escolher qual usar.");
		expect(screen.queryAllByRole("radio")).toHaveLength(0);
	});

	it("analyzes the chosen pdf reading as it is, without reading the profile again", async () => {
		withReadings();
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click((await screen.findAllByRole("radio"))[1]);
		vi.mocked(checkExtension).mockClear();
		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "pdf1" }));
		expect(checkExtension).not.toHaveBeenCalled();
		expect(captureWithExtension).not.toHaveBeenCalled();
	});

	it("reads the profile again through the extension when the extension reading is the chosen one", async () => {
		withReadings();
		extensionIs("current");
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "ext2", unchanged: false, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		await screen.findAllByRole("radio");

		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "ext2" }));
		expect(captureWithExtension).toHaveBeenCalled();
	});

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
		withoutAnySnapshot();
		extensionIs("missing");
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
		withoutAnySnapshot();
		extensionIs("missing");
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

	it("uses an extension reading sent in the last ten minutes when the bridge does not answer", async () => {
		vi.mocked(apiGet).mockImplementation(async (path: string) => {
			if (path.endsWith("/snapshots")) {
				return [{ id: "s9", source: "EXTENSION", capturedAt: new Date(Date.now() - 60_000).toISOString() }];
			}
			if (path.endsWith("/snapshots/latest")) {
				return { id: "s9", source: "EXTENSION", capturedAt: new Date(Date.now() - 60_000).toISOString(), profile: {} };
			}
			if (path.endsWith("/analyses/latest")) {
				throw new ApiError("não achou", 404);
			}
			return [];
		});
		extensionIs("missing");
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		await screen.findAllByRole("radio");

		fireEvent.click(screen.getByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s9" }));
		expect(screen.queryByText("Instale a extensão para ler o seu perfil sozinho")).toBeNull();
	});

	it("asks to update the extension only when there is no reading at all to analyze", async () => {
		withoutAnySnapshot();
		extensionIs("missing");
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Instale a extensão para ler o seu perfil sozinho");
		expect(apiPostJson).not.toHaveBeenCalled();
	});

	it("analyzes the latest reading when the selector has nothing but a snapshot exists and the extension does not answer", async () => {
		extensionIs("missing");
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s1" }));
	});

	it("starts the analysis on its own once the extension shows up", async () => {
		withoutAnySnapshot();
		extensionIs("missing");
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: false, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();
		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));
		await screen.findByText("Instale a extensão para ler o seu perfil sozinho");

		extensionIs("current");

		await waitFor(() => expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s2" }), { timeout: 6000 });
	}, 10000);

	it("offers to open LinkedIn when the user is not logged in and retries by itself when they come back", async () => {
		withoutAnySnapshot();
		extensionIs("current");
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
		extensionIs("current");
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: true, changedSections: [] } as never);
		vi.mocked(apiPostJson).mockResolvedValue({ ...ANALYSIS, unchanged: true });
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText(/Seu perfil não mudou desde a última leitura/);
		expect(captureWithExtension).toHaveBeenCalledWith(expect.objectContaining({ profileUrl: "https://www.linkedin.com/in/ana/" }));
		expect(apiPostJson).toHaveBeenCalledWith("/api/v1/linkedin/analyses", { snapshotId: "s2" });
	});

	it("lists the sections that changed since the last reading", async () => {
		extensionIs("current");
		vi.mocked(captureWithExtension).mockResolvedValue({ id: "s2", unchanged: false, changedSections: ["HEADLINE", "SKILLS"] } as never);
		vi.mocked(apiPostJson).mockResolvedValue(ANALYSIS);
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Mudou desde a última leitura: Título, Competências.");
	});

	it("does not analyze without a fresh reading when the extension is missing", async () => {
		withoutAnySnapshot();
		extensionIs("missing");
		renderPanel();

		fireEvent.click(await screen.findByRole("button", { name: /Analisar meu LinkedIn/ }));

		await screen.findByText("Instale a extensão para ler o seu perfil sozinho");
		expect(screen.getByRole("button", { name: /Baixar extensão/ })).toBeTruthy();
		expect(screen.queryByText("Ver como ler o perfil")).toBeNull();
		await waitFor(() => expect(apiPostJson).not.toHaveBeenCalled());
		expect(captureWithExtension).not.toHaveBeenCalled();
	});
});

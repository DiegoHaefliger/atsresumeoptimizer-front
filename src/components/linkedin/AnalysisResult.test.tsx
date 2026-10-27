import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { LinkedInAnalysisResponse } from "../../api/linkedinTypes";
import { AnalysisResult } from "./AnalysisResult";

afterEach(cleanup);

const ANALYSIS: LinkedInAnalysisResponse = {
	id: "a1",
	snapshotId: "s1",
	createdAt: "2026-10-27T12:00:00Z",
	overallScore: 62,
	summary: "Perfil razoável para o cargo.",
	targetFit: "Falta posicionamento de liderança.",
	topActions: ["Reescrever o título"],
	recruiterKeywords: ["Java"],
	missingKeywords: ["Liderança técnica"],
	imagesAnalyzed: false,
	sections: [
		{ section: "ABOUT", score: 80, diagnosis: "Bom texto.", suggestions: [] },
		{
			section: "HEADLINE",
			score: 30,
			diagnosis: "Título genérico.",
			suggestions: [{ priority: "HIGH", text: "Citar o cargo-alvo" }],
			rewrite: "Tech Lead Java | AWS",
		},
	],
};

describe("AnalysisResult", () => {
	it("reviews each experience on its own with its own rewrite", () => {
		render(<AnalysisResult analysis={{ ...ANALYSIS, sections: [
			{
				section: "EXPERIENCE",
				score: 70,
				diagnosis: "Cargos claros.",
				suggestions: [],
				items: [
					{
						title: "Porto - Desenvolvedor Sênior",
						score: 60,
						diagnosis: "Faltam métricas na Porto.",
						suggestions: [{ priority: "HIGH", text: "Abrir com o resultado da Porto" }],
						rewrite: "- Reduzi o tempo de resposta",
					},
					{ title: "Zup - Desenvolvedor", score: 85, diagnosis: "Claro na Zup.", suggestions: [] },
				],
			},
		] }} />);

		expect(screen.getByRole("heading", { name: "Porto - Desenvolvedor Sênior" })).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Zup - Desenvolvedor" })).toBeTruthy();
		expect(screen.getByText("Abrir com o resultado da Porto")).toBeTruthy();
		expect(screen.getByText("- Reduzi o tempo de resposta")).toBeTruthy();
		expect(screen.getByText("85/100")).toBeTruthy();
	});

	it("shows the score, the top actions and the rewrite ready to copy", () => {
		render(<AnalysisResult analysis={ANALYSIS} />);

		expect(screen.getByRole("img", { name: "Perfil: 62 de 100" })).toBeTruthy();
		expect(screen.getByText("Reescrever o título")).toBeTruthy();
		expect(screen.getByText("Tech Lead Java | AWS")).toBeTruthy();
		expect(screen.getByRole("button", { name: /Copiar/ })).toBeTruthy();
		expect(screen.getByText("Citar o cargo-alvo")).toBeTruthy();
	});

	it("puts the weakest section first and warns that the images were not evaluated", () => {
		render(<AnalysisResult analysis={ANALYSIS} />);

		const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
		expect(titles).toEqual(["Título", "Sobre"]);
		expect(screen.getByText(/foto e banner não foram avaliados/)).toBeTruthy();
	});

	it("shows the score change since the previous analysis", () => {
		render(<AnalysisResult analysis={ANALYSIS} previousScore={50} />);

		expect(screen.getByText(/\+12 pontos desde a anterior/)).toBeTruthy();
	});
});

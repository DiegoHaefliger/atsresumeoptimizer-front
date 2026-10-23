import type { ResumeSummary } from "../api/types";
import { assistantPath } from "./jobAssistantPaths";
import { rewritePath } from "./rewriteRoutes";

export type SummaryLink = { label: string; to: string };

export type SummaryStep = {
	key: "analysis" | "resume" | "cover-letter" | "questions" | "doubts";
	title: string;
	detail: string;
	done: boolean;
	links: SummaryLink[];
};

export type SummaryInput = {
	jobId: string;
	resumes: ResumeSummary[];
	coverLetters: number;
	interviewSets: number;
	candidateSets: number;
};

function plural(count: number, one: string, many: string): string {
	return `${count} ${count === 1 ? one : many}`;
}

export function buildSummary({ jobId, resumes, coverLetters, interviewSets, candidateSets }: SummaryInput): SummaryStep[] {
	const adapted = resumes.filter((resume) => resume.origin === "ADAPTED");
	const analysisIds = [...new Set(adapted.map((resume) => resume.sourceAnalysisId).filter((id): id is string => Boolean(id)))];

	return [
		{
			key: "analysis",
			title: "Análise da vaga",
			detail: analysisIds.length ? plural(analysisIds.length, "análise", "análises") : "Nenhuma análise com currículo adaptado",
			done: analysisIds.length > 0,
			links: analysisIds.map((id, index) => ({ label: `Análise ${index + 1}`, to: `/analyses/${id}` })),
		},
		{
			key: "resume",
			title: "Currículo adaptado",
			detail: adapted.length ? plural(adapted.length, "currículo adaptado", "currículos adaptados") : "Nenhum currículo adaptado",
			done: adapted.length > 0,
			links: adapted
				.filter((resume) => resume.sourceAnalysisId)
				.map((resume, index) => ({
					label: adapted.length > 1 ? `Adaptação ${index + 1}` : "Abrir adaptação",
					to: rewritePath(resume.sourceAnalysisId ?? "", true),
				})),
		},
		{
			key: "cover-letter",
			title: "Apresentação",
			detail: coverLetters ? plural(coverLetters, "versão gerada", "versões geradas") : "Nenhuma apresentação gerada",
			done: coverLetters > 0,
			links: [{ label: coverLetters ? "Ver apresentações" : "Gerar", to: assistantPath(jobId, "cover-letter") }],
		},
		{
			key: "questions",
			title: "Perguntas técnicas",
			detail: interviewSets ? plural(interviewSets, "conjunto gerado", "conjuntos gerados") : "Nenhuma pergunta gerada",
			done: interviewSets > 0,
			links: [{ label: interviewSets ? "Ver perguntas" : "Gerar", to: assistantPath(jobId, "questions") }],
		},
		{
			key: "doubts",
			title: "Dúvidas para a entrevista",
			detail: candidateSets ? plural(candidateSets, "conjunto gerado", "conjuntos gerados") : "Nenhuma dúvida gerada",
			done: candidateSets > 0,
			links: [{ label: candidateSets ? "Ver dúvidas" : "Gerar", to: assistantPath(jobId, "doubts") }],
		},
	];
}

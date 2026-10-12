import type { AiSettingsView, JobPreferenceResponse, RecentJobView, ResumeSummary } from "../api/types";

export type OnboardingStepId = "ai" | "resume" | "job" | "preferences" | "analysis";

export type OnboardingStep = {
	id: OnboardingStepId;
	title: string;
	description: string;
	action: { label: string; to: string };
	optional: boolean;
	done: boolean;
};

export type OnboardingData = {
	aiSettings: AiSettingsView;
	resumes: ResumeSummary[];
	jobs: RecentJobView[];
	preferences: JobPreferenceResponse;
};

function hasPreferences(preferences: JobPreferenceResponse): boolean {
	return Object.values(preferences).some((value) => (Array.isArray(value) ? value.length > 0 : value != null));
}

export function onboardingSteps({ aiSettings, resumes, jobs, preferences }: OnboardingData): OnboardingStep[] {
	return [
		{
			id: "ai",
			title: "Configurar a inteligência artificial",
			description: "Escolha um provedor (OpenAI, Gemini, Anthropic...) e cole a chave de API. Sem isso as análises não rodam.",
			action: { label: "Configurar", to: "/settings" },
			optional: false,
			done: (aiSettings.providers ?? []).some((provider) => provider.enabled),
		},
		{
			id: "resume",
			title: "Cadastrar seu currículo",
			description: "Importe o currículo em PDF ou DOCX, ou preencha direto na tela.",
			action: { label: "Adicionar currículo", to: "/resumes" },
			optional: false,
			done: resumes.length > 0,
		},
		{
			id: "job",
			title: "Cadastrar uma vaga",
			description: "Cole a descrição de uma vaga que te interessa. É contra ela que o currículo é comparado.",
			action: { label: "Cadastrar vaga", to: "/jobs/new" },
			optional: false,
			done: jobs.length > 0,
		},
		{
			id: "preferences",
			title: "Contar suas preferências",
			description: "Formato de trabalho, salário, benefícios e local entram na nota de aderência de cada vaga.",
			action: { label: "Preencher", to: "/preferences" },
			optional: true,
			done: hasPreferences(preferences),
		},
		{
			id: "analysis",
			title: "Fazer a primeira análise",
			description: "Em Vagas, clique em Analisar e escolha o currículo. No resultado, use Adaptar currículo para a IA ajustá-lo à vaga.",
			action: { label: "Ir para vagas", to: "/jobs" },
			optional: false,
			done: jobs.some((job) => job.atsScore != null),
		},
	];
}

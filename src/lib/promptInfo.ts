import type { PromptTemplateSummary } from "../api/types";

type PromptInfo = { label: string; group: string; description: string };

const GROUP_ORDER = ["Currículo", "Vaga", "Entrevista", "Chat", "Outras"];

const PROMPT_INFO: Record<string, PromptInfo> = {
	"resume-structuring": {
		label: "Adaptação do currículo",
		group: "Currículo",
		description: "Adapta o currículo à vaga e devolve o resultado estruturado.",
	},
	"bullet-review": {
		label: "Revisão de bullets",
		group: "Currículo",
		description: "Revisa os tópicos (bullets) do currículo.",
	},
	rewrite: {
		label: "Reescrita (legado)",
		group: "Currículo",
		description: "Versão antiga da reescrita do currículo, mantida por compatibilidade.",
	},
	"job-structuring": {
		label: "Estruturação da vaga",
		group: "Vaga",
		description: "Organiza o texto da vaga em campos, como título, empresa, requisitos e benefícios.",
	},
	"requirement-evidence": {
		label: "Evidência de exigências",
		group: "Vaga",
		description: "Procura no currículo a evidência de cada exigência da vaga.",
	},
	"cover-letter": {
		label: "Apresentação para a vaga",
		group: "Entrevista",
		description: "Escreve a apresentação do candidato para a vaga.",
	},
	"interview-questions": {
		label: "Perguntas técnicas da vaga",
		group: "Entrevista",
		description: "Gera as perguntas técnicas mais prováveis na entrevista da vaga.",
	},
	"candidate-questions": {
		label: "Perguntas para o recrutador (dúvidas)",
		group: "Entrevista",
		description: "Sugere dúvidas para você fazer ao recrutador.",
	},
	"chat-recruiter": {
		label: "Chat com a IA (recrutador)",
		group: "Chat",
		description: "Define como a IA responde no chat, no papel de recrutador.",
	},
};

export function promptLabel(key: string): string {
	return PROMPT_INFO[key]?.label ?? key;
}

export function promptDescription(key: string): string | null {
	return PROMPT_INFO[key]?.description ?? null;
}

export type PromptGroup = { title: string; items: PromptTemplateSummary[] };

export function groupPrompts(templates: PromptTemplateSummary[]): PromptGroup[] {
	const byGroup = new Map<string, PromptTemplateSummary[]>();
	for (const template of templates) {
		const group = PROMPT_INFO[template.key ?? ""]?.group ?? "Outras";
		byGroup.set(group, [...(byGroup.get(group) ?? []), template]);
	}
	return GROUP_ORDER.filter((title) => byGroup.has(title)).map((title) => ({
		title,
		items: (byGroup.get(title) ?? []).sort((a, b) => promptLabel(a.key ?? "").localeCompare(promptLabel(b.key ?? ""), "pt-BR")),
	}));
}

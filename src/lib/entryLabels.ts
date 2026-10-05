export type EntryLabels = {
	newItem: string;
	heading: string;
	subheading: string;
	context: string;
	bullets: string;
	add: string;
	startDate: string;
	endDate: string;
	currentLabel: string | null;
	endFutureYears: number;
	institutionFirst: boolean;
	contextLast: boolean;
	contextPlaceholder?: string;
	bulletsPlaceholder?: string;
	resultsPlaceholder?: string;
	hasResults: boolean;
	hasTechnologies: boolean;
};

const EXPERIENCE_LABELS: EntryLabels = {
	newItem: "Nova experiência",
	heading: "Cargo",
	subheading: "Empresa / local",
	context: "Atividades",
	bullets: "Responsabilidades",
	add: "Adicionar experiência",
	startDate: "Data inicial",
	endDate: "Data final",
	currentLabel: "Trabalho aqui atualmente",
	endFutureYears: 0,
	institutionFirst: false,
	contextLast: true,
	contextPlaceholder: "Atividade, projeto ou processo que demonstre seu conhecimento técnico",
	bulletsPlaceholder: "Responsabilidade relevante utilizando termos relacionados à vaga",
	resultsPlaceholder:
		"Sempre que possível, mostre um resultado: ganho de produtividade, volume atendido, melhoria de indicador etc.",
	hasResults: true,
	hasTechnologies: true,
};

const EDUCATION_LABELS: EntryLabels = {
	newItem: "Nova formação",
	heading: "Curso / grau",
	subheading: "Instituição",
	context: "Observações",
	bullets: "Destaques (TCC, disciplinas, atividades)",
	add: "Adicionar formação",
	startDate: "Início",
	endDate: "Conclusão (ou previsão)",
	currentLabel: null,
	endFutureYears: 10,
	institutionFirst: true,
	contextLast: false,
	hasResults: false,
	hasTechnologies: false,
};

const PROJECT_LABELS: EntryLabels = {
	newItem: "Novo projeto",
	heading: "Nome do projeto",
	subheading: "Papel / organização",
	context: "Descrição",
	bullets: "Entregas e resultados",
	add: "Adicionar projeto",
	startDate: "Data inicial",
	endDate: "Data final",
	currentLabel: "Projeto em andamento",
	endFutureYears: 0,
	institutionFirst: false,
	contextLast: false,
	hasResults: false,
	hasTechnologies: true,
};

export function entryLabelsFor(semanticType: string | undefined): EntryLabels {
	switch (semanticType) {
		case "EDUCATION":
			return EDUCATION_LABELS;
		case "PROJECTS":
			return PROJECT_LABELS;
		default:
			return EXPERIENCE_LABELS;
	}
}

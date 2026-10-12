export type ReleaseChangeKind = "feat" | "fix" | "improvement";

export interface ReleaseChange {
	kind: ReleaseChangeKind;
	text: string;
}

export interface ReleaseNote {
	version: string;
	date: string;
	summary: string;
	changes: ReleaseChange[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
	{
		version: "1.1.0",
		date: "2026-10-12",
		summary: "Perguntas para fazer ao recrutador no fim da entrevista.",
		changes: [
			{ kind: "feat", text: "Nova aba no assistente da vaga com até 7 perguntas para o fim da entrevista: 5 técnicas e 2 não técnicas, baseadas na descrição e nos benefícios." },
			{ kind: "improvement", text: "Tela de instruções sem o botão de nova instrução; o prompt das perguntas pode ser editado ali." },
		],
	},
	{
		version: "1.0.0",
		date: "2026-10-12",
		summary: "Primeira versão estável, com instaladores para Windows, macOS e Linux.",
		changes: [
			{ kind: "feat", text: "Análise ATS de currículo a partir de uma vaga ou como avaliação geral." },
			{ kind: "feat", text: "Adaptação do currículo à vaga, com preview destacando as alterações e escolha de até 10 palavras-chave." },
			{ kind: "feat", text: "Processo seletivo com etapas, histórico, contato e acompanhamento por vaga." },
			{ kind: "feat", text: "Agendamento de etapas, central de notificações e agenda com conflito de horários." },
			{ kind: "feat", text: "Integração com o Google Agenda." },
			{ kind: "feat", text: "Banco de dados externo no app desktop." },
			{ kind: "feat", text: "Aviso de nova versão disponível." },
			{ kind: "feat", text: "Guia de primeiros passos." },
			{ kind: "improvement", text: "Novo layout com tema claro e escuro." },
			{ kind: "improvement", text: "Paginação na lista de vagas e ordenação pela etapa do processo." },
		],
	},
];

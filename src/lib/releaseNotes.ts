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
		version: "1.1.2",
		date: "2026-10-14",
		summary: "Notas na vaga e uma nota pessoal, ambas só suas e fora das análises de IA.",
		changes: [
			{ kind: "feat", text: "Nota em cada vaga, aberta pelo ícone de caderno no card, com negrito, itálico, sublinhado e listas. É um texto único, sem histórico." },
			{ kind: "feat", text: "Nova tela Notas no menu lateral para anotar seus pontos fortes e comportamentos. Não fica ligada a vaga nem a currículo." },
			{ kind: "improvement", text: "As notas nunca são lidas pela IA, em nenhuma análise ou adaptação." },
			{ kind: "improvement", text: "Em Sobre, as versões antigas ficam recolhidas e só a mais recente aparece aberta." },
		],
	},
	{
		version: "1.1.1",
		date: "2026-10-13",
		summary: "Google Agenda configurável pelo app, etapa Entrevista RH e correção no campo de anotação.",
		changes: [
			{ kind: "feat", text: "Credenciais do Google Agenda (ID do cliente e chave secreta) agora são informadas na própria tela da integração, sem editar arquivo .env." },
			{ kind: "feat", text: "Nova etapa Entrevista RH no processo seletivo, logo após a Triagem." },
			{ kind: "fix", text: "Campo Anotação ao mover a etapa do processo não aparece mais cortado." },
		],
	},
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

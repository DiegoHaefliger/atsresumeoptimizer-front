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
		version: "1.1.6",
		date: "2026-10-23",
		summary: "Reordene as experiências, edite o currículo adaptado como num documento e acompanhe cada candidatura em telas novas, com resumo, custo de IA e linha do tempo.",
		changes: [
			{ kind: "feat", text: "No currículo adaptado, a aba Editar documento mostra a folha como sairá na impressão, com o texto editável direto, incluindo tópicos, negrito, itálico e sublinhado." },
			{ kind: "feat", text: "Na edição por campos, cada experiência (e formação ou projeto) ganhou botões para subir e descer, para você escolher a ordem depois da análise da IA." },
			{ kind: "improvement", text: "As abas do currículo adaptado agora se chamam Prévia, Editar documento e Editar campos." },
			{ kind: "feat", text: "Nova tela de resumo da candidatura, aberta pelo ícone de lista no card da vaga: mostra o progresso das etapas (análise, currículo adaptado, apresentação, perguntas técnicas e dúvidas), com atalhos para cada uma, o processo seletivo, o custo de IA e as notas da vaga." },
			{ kind: "feat", text: "Nova tela de custo de IA por candidatura, em reais ou dólar, separada em análise da vaga, adaptação do currículo e preparação para a entrevista. Mostra tokens, modelos usados e avisa quando o valor é estimado. Respostas em cache não custam nada." },
			{ kind: "improvement", text: "O card da vaga ficou só com resumo, editar e remover. Prévia, currículos gerados, assistente de IA, processo seletivo e notas agora são acessados pelo resumo." },
			{ kind: "improvement", text: "A prévia da vaga virou uma página, com notas de aderência e ATS, modelo de trabalho, senioridade, contrato, remuneração, benefícios e sobre a empresa. Os links do anúncio e da candidatura ganharam botões de destaque no topo." },
			{ kind: "improvement", text: "O processo seletivo foi reorganizado: a situação e a próxima etapa ficam em uma barra no topo, com os detalhes e o histórico lado a lado." },
			{ kind: "feat", text: "O histórico do processo virou uma linha do tempo por etapa, com o tempo em cada uma, os agendamentos dentro da etapa e os próximos em destaque. Etapas concluídas ficam marcadas, e as antigas podem ser recolhidas." },
			{ kind: "improvement", text: "Nas telas abertas a partir do resumo, o botão Voltar retorna ao resumo." },
			{ kind: "improvement", text: "Tela de Instruções da IA reorganizada: instruções agrupadas por assunto com uma descrição de cada uma, histórico de versões na lateral, botão de salvar sempre visível e contador de caracteres. Os marcadores entre chaves viram botões que inserem no cursor, e o app avisa se algum sumiu do texto." },
			{ kind: "improvement", text: "Nas Instruções da IA, trocar de instrução ou de versão com alterações não salvas agora pede confirmação, e Ctrl+S salva a nova versão." },
		],
	},
	{
		version: "1.1.5",
		date: "2026-10-22",
		summary: "Chat com a IA para conversar sobre suas vagas, anexos nas mensagens e campo Sobre a empresa.",
		changes: [
			{ kind: "feat", text: "Nova tela de chat com a IA, com a resposta aparecendo conforme é escrita, conversas salvas e opção de regenerar a última resposta." },
			{ kind: "feat", text: "No chat, digite @ para anexar vagas e outras conversas. A IA consulta os dados da vaga anexada e cita o código como aparece no app (V0012)." },
			{ kind: "feat", text: "No chat, anexe imagens e documentos pelo clipe, arrastando ou colando, com prévia e miniaturas." },
			{ kind: "improvement", text: "Quando o provedor de IA falha, o chat mostra uma mensagem clara em português." },
			{ kind: "feat", text: "Novo campo opcional Sobre a empresa na vaga, para registrar cultura e dados úteis para a entrevista. O chat também usa esse texto." },
			{ kind: "improvement", text: "Descrição e Benefícios da vaga agora usam o editor de texto formatado, com a barra de formatação completa. Comparações e análises da IA usam o texto limpo." },
		],
	},
	{
		version: "1.1.3",
		date: "2026-10-14",
		summary: "Editor de texto formatado nas notas e no currículo, e tela de abertura nova.",
		changes: [
			{ kind: "improvement", text: "Nas notas e nos campos de texto do editor de currículo, o negrito, o itálico, o sublinhado, os tópicos e a numeração aparecem formatados enquanto você escreve." },
			{ kind: "feat", text: "Nas notas, novo botão para inserir uma linha separadora entre trechos." },
			{ kind: "improvement", text: "Tela de abertura do app instalado redesenhada, com barra de progresso animada e aviso de que a primeira abertura pode demorar." },
		],
	},
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

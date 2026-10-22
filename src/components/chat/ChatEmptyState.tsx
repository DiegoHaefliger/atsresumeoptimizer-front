import { AtSignIcon, SparklesIcon } from "../icons";

export type Suggestion = { text: string; sendNow: boolean };

const SUGGESTIONS: Suggestion[] = [
	{ text: "Qual das minhas vagas combina mais comigo?", sendNow: true },
	{ text: "Como me preparo para uma entrevista de fit cultural?", sendNow: true },
	{ text: "Me ajude a me preparar para a entrevista da vaga @", sendNow: false },
	{ text: "Quais são as lacunas do meu currículo para a vaga @", sendNow: false },
	{ text: "Compare a vaga @", sendNow: false },
];

type ChatEmptyStateProps = {
	onSuggest: (suggestion: Suggestion) => void;
};

export function ChatEmptyState({ onSuggest }: ChatEmptyStateProps) {
	return (
		<div className="chat-empty">
			<span className="chat-empty-icon">
				<SparklesIcon />
			</span>
			<h2>Converse com seu recrutador de bolso</h2>
			<p>Tire dúvidas sobre uma vaga, prepare entrevistas, fit cultural ou revise um assunto técnico.</p>
			<p className="chat-empty-tip">
				<AtSignIcon /> Digite <kbd>@</kbd> para buscar uma vaga. A IA passa a ver a vaga e o currículo gerado para ela.
				Sem vaga anexada, ela ainda consulta suas vagas sozinha quando precisar. Também dá para anexar imagens e documentos
				(PDF, DOCX, TXT) com o clipe, arrastando ou colando.
			</p>
			<ul className="chat-suggestions" aria-label="Sugestões de pergunta">
				{SUGGESTIONS.map((suggestion) => (
					<li key={suggestion.text}>
						<button type="button" className="btn-secondary chat-suggestion" onClick={() => onSuggest(suggestion)}>
							{suggestion.text}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

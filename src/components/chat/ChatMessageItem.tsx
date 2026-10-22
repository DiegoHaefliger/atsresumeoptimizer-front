import { memo } from "react";
import type { ChatMessage } from "../../lib/chatTypes";
import { useCopyFeedback } from "../../lib/useCopyFeedback";
import { CheckCircleIcon, CopyIcon, RefreshIcon } from "../icons";
import { Markdown } from "./Markdown";
import { MessageFiles } from "./MessageFiles";

type ChatMessageItemProps = {
	message: ChatMessage;
	sources: string[];
	canRegenerate: boolean;
	onRegenerate: () => void;
};

const costFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: 4 });

function ChatMessageItemView({ message, sources, canRegenerate, onRegenerate }: ChatMessageItemProps) {
	const { copied, copy } = useCopyFeedback();

	if (message.role === "USER") {
		return (
			<article className="chat-message chat-message-user" aria-label="Você disse">
				<MessageFiles files={message.files} />
				{message.content && <div className="chat-bubble">{message.content}</div>}
			</article>
		);
	}

	return (
		<article className="chat-message chat-message-assistant" aria-label="Resposta da IA">
			{sources.length > 0 && (
				<ul className="chat-sources" aria-label="Dados consultados">
					{sources.map((source, index) => (
						<li key={`${source}-${index}`}>{source}</li>
					))}
				</ul>
			)}
			<div className="chat-bubble">
				<Markdown text={message.content} />
				{message.interrupted && <p className="chat-interrupted">Resposta interrompida.</p>}
			</div>
			<div className="chat-message-footer">
				<button
					type="button"
					className="btn-icon btn-small"
					onClick={() => void copy(message.content)}
					aria-label={copied ? "Resposta copiada" : "Copiar resposta"}
					title="Copiar resposta"
				>
					{copied ? <CheckCircleIcon /> : <CopyIcon />}
				</button>
				{canRegenerate && (
					<button type="button" className="btn-icon btn-small" onClick={onRegenerate} aria-label="Gerar a resposta de novo" title="Gerar de novo">
						<RefreshIcon />
					</button>
				)}
				{message.aiModel && (
					<span className="chat-meta">
						{message.aiModel}
						{message.costUsd > 0 && ` · ${costFormat.format(message.costUsd)}`}
					</span>
				)}
			</div>
		</article>
	);
}

export const ChatMessageItem = memo(ChatMessageItemView);

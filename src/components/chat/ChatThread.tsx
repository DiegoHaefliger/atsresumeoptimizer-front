import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ChatDraft, ChatMessage } from "../../lib/chatTypes";
import { isMissingProviderError } from "../../lib/chatLabels";
import { ArrowDownIcon, RefreshIcon } from "../icons";
import { ChatDraftItem } from "./ChatDraftItem";
import { ChatEmptyState, type Suggestion } from "./ChatEmptyState";
import { ChatMessageItem } from "./ChatMessageItem";

const NEAR_BOTTOM_PX = 80;

type ChatThreadProps = {
	messages: ChatMessage[];
	draft: ChatDraft | null;
	sources: Record<string, string[]>;
	error: string | null;
	canRetry: boolean;
	onRegenerate: () => void;
	onSuggest: (suggestion: Suggestion) => void;
};

export function ChatThread({ messages, draft, sources, error, canRetry, onRegenerate, onSuggest }: ChatThreadProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stickToBottom = useRef(true);
	const [showJump, setShowJump] = useState(false);
	const last = messages.at(-1);
	const lastAnswerId = last?.role === "ASSISTANT" ? last.id : null;

	useLayoutEffect(() => {
		if (last?.role === "USER") {
			stickToBottom.current = true;
		}
	}, [last]);

	useLayoutEffect(() => {
		const element = containerRef.current;
		if (element && stickToBottom.current) {
			element.scrollTop = element.scrollHeight;
		}
	}, [messages, draft?.text, draft?.tools.length, error]);

	function handleScroll() {
		const element = containerRef.current;
		if (!element) {
			return;
		}
		const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
		stickToBottom.current = nearBottom;
		setShowJump(!nearBottom);
	}

	function jumpToEnd() {
		const element = containerRef.current;
		if (element) {
			stickToBottom.current = true;
			element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
		}
	}

	if (messages.length === 0 && !draft && !error) {
		return (
			<div className="chat-thread">
				<ChatEmptyState onSuggest={onSuggest} />
			</div>
		);
	}

	return (
		<div className="chat-thread-wrap">
			<div
				ref={containerRef}
				className="chat-thread"
				role="log"
				aria-label="Conversa"
				aria-live="polite"
				aria-relevant="additions"
				onScroll={handleScroll}
			>
				<div className="chat-thread-inner">
					{messages.map((message) => (
						<ChatMessageItem
							key={message.id}
							message={message}
							sources={sources[message.id] ?? []}
							canRegenerate={!draft && message.id === lastAnswerId}
							onRegenerate={onRegenerate}
						/>
					))}
					{draft && <ChatDraftItem draft={draft} />}
					{error && (
						<div className="alert alert-error chat-error" role="alert">
							<span>{error}</span>
							{isMissingProviderError(error) ? (
								<Link to="/settings" className="link">
									Abrir Configurações
								</Link>
							) : (
								canRetry && (
									<button type="button" className="btn-secondary btn-small" onClick={onRegenerate}>
										<RefreshIcon /> Tentar de novo
									</button>
								)
							)}
						</div>
					)}
				</div>
			</div>
			{showJump && (
				<button type="button" className="btn-secondary chat-jump" onClick={jumpToEnd} aria-label="Ir para o fim da conversa">
					<ArrowDownIcon /> Ir para o fim
				</button>
			)}
		</div>
	);
}

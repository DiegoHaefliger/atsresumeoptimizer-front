import { useState } from "react";
import { Link } from "react-router-dom";
import type { ChatConversationSummary } from "../../api/types";
import { relativeDay } from "../../lib/chatLabels";
import { errorMessage } from "../../api/client";
import { PencilIcon, PlusIcon, TrashIcon } from "../icons";
import { Skeleton } from "../Skeleton";
import { StateMessage } from "../StateMessage";

type ConversationListProps = {
	conversations: ChatConversationSummary[] | null;
	failed: boolean;
	activeId: string | null;
	open: boolean;
	onNew: () => void;
	onNavigate: () => void;
	onRename: (conversationId: string, title: string) => Promise<void>;
	onDelete: (conversation: ChatConversationSummary) => void;
};

export function ConversationList({ conversations, failed, activeId, open, onNew, onNavigate, onRename, onDelete }: ConversationListProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [renameError, setRenameError] = useState<string | null>(null);

	async function commitRename(conversationId: string, original: string) {
		const next = title.trim();
		if (!next || next === original) {
			setEditingId(null);
			return;
		}
		try {
			await onRename(conversationId, next);
			setRenameError(null);
			setEditingId(null);
		} catch (failure) {
			setRenameError(errorMessage(failure, "Não deu para renomear a conversa."));
		}
	}

	return (
		<aside className={`chat-list${open ? " is-open" : ""}`} aria-label="Conversas">
			<button type="button" className="chat-new" onClick={onNew}>
				<PlusIcon /> Nova conversa
			</button>
			{renameError && (
				<p className="alert alert-error" role="alert">
					<span>{renameError}</span>
				</p>
			)}
			{failed ? (
				<StateMessage message="Não deu pra carregar as conversas." />
			) : conversations === null ? (
				<div role="status" aria-busy="true" className="chat-list-loading">
					<span className="sr-only">Carregando conversas...</span>
					<Skeleton width="100%" height={44} radius="var(--radius-md)" />
					<Skeleton width="100%" height={44} radius="var(--radius-md)" />
					<Skeleton width="100%" height={44} radius="var(--radius-md)" />
				</div>
			) : conversations.length === 0 ? (
				<p className="chat-list-empty">Suas conversas aparecem aqui.</p>
			) : (
				<ul className="chat-list-items">
					{conversations.map((conversation) => {
						const id = conversation.id ?? "";
						const name = conversation.title ?? "Conversa";
						return (
							<li key={id} className={`chat-list-item${id === activeId ? " is-active" : ""}`}>
								{editingId === id ? (
									<input
										className="chat-rename"
										value={title}
										maxLength={120}
										aria-label="Novo nome da conversa"
										autoFocus
										onChange={(event) => setTitle(event.target.value)}
										onBlur={() => void commitRename(id, name)}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												event.currentTarget.blur();
											} else if (event.key === "Escape") {
												setTitle(name);
												setEditingId(null);
											}
										}}
									/>
								) : (
									<>
										<Link to={`/chat/${id}`} className="chat-list-link" aria-current={id === activeId ? "page" : undefined} onClick={onNavigate}>
											<span className="chat-list-title">{name}</span>
											<span className="chat-list-date">{relativeDay(conversation.updatedAt)}</span>
										</Link>
										<span className="chat-list-actions">
											<button
												type="button"
												className="btn-icon btn-small"
												aria-label={`Renomear ${name}`}
												onClick={() => {
													setTitle(name);
													setEditingId(id);
												}}
											>
												<PencilIcon />
											</button>
											<button type="button" className="btn-icon btn-small" aria-label={`Excluir ${name}`} onClick={() => onDelete(conversation)}>
												<TrashIcon />
											</button>
										</span>
									</>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</aside>
	);
}

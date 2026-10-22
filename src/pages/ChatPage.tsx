import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import type { ChatConversationSummary } from "../api/types";
import { ChatComposer, type Prefill } from "../components/chat/ChatComposer";
import type { Suggestion } from "../components/chat/ChatEmptyState";
import { ChatThread } from "../components/chat/ChatThread";
import { ContextBar } from "../components/chat/ContextBar";
import { ConversationList } from "../components/chat/ConversationList";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlertCircleIcon, MessagesIcon } from "../components/icons";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { useAiAvailability } from "../lib/useAiAvailability";
import { useChat } from "../lib/useChat";
import { useConversations } from "../lib/useConversations";
import { useJobs } from "../lib/useJobs";

const NEW_CONVERSATION_TITLE = "Nova conversa";

export function ChatPage() {
	const { conversationId: routeId } = useParams<{ conversationId: string }>();
	const navigate = useNavigate();
	const { jobs } = useJobs();
	const list = useConversations();
	const aiAvailable = useAiAvailability();
	const drafts = useRef(new Map<string, string>());
	const [composerKey, setComposerKey] = useState(routeId ?? "new");
	const [prefill, setPrefill] = useState<Prefill | null>(null);
	const [listOpen, setListOpen] = useState(false);
	const [deleting, setDeleting] = useState<ChatConversationSummary | null>(null);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const reloadList = list.reload;
	const handleCreated = useCallback((id: string) => navigate(`/chat/${id}`, { replace: true }), [navigate]);
	const chat = useChat({ onConversationCreated: handleCreated, onConversationsChanged: reloadList });
	const { select, conversationId: activeId, unsentText, clearUnsent } = chat;

	useEffect(() => {
		if ((routeId ?? null) !== activeId) {
			select(routeId ?? null);
			setComposerKey(routeId ?? `new-${Date.now()}`);
		}
		// só reage à troca de rota; o id ativo muda por dentro quando a conversa é criada
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeId]);

	useEffect(() => {
		if (unsentText !== null) {
			setPrefill({ text: unsentText, nonce: Date.now() });
			clearUnsent();
		}
	}, [unsentText, clearUnsent]);

	const title = list.conversations?.find((conversation) => conversation.id === activeId)?.title ?? NEW_CONVERSATION_TITLE;
	const attachedIds = chat.attachments.map((attachment) => attachment.jobId);
	const lastIsAnswerable = chat.messages.some((message) => message.role === "USER" && !message.id.startsWith("pending-"));

	function suggest(suggestion: Suggestion) {
		if (suggestion.sendNow) {
			void chat.send(suggestion.text);
		} else {
			setPrefill({ text: suggestion.text, nonce: Date.now() });
		}
	}

	async function confirmDelete() {
		if (!deleting?.id) {
			return;
		}
		setDeleteBusy(true);
		setDeleteError(null);
		try {
			await list.remove(deleting.id);
			if (deleting.id === activeId) {
				navigate("/chat");
			}
			setDeleting(null);
		} catch (failure) {
			setDeleteError(errorMessage(failure, "Não deu para excluir a conversa."));
		} finally {
			setDeleteBusy(false);
		}
	}

	return (
		<div className="chat-page">
			<ConversationList
				conversations={list.conversations}
				failed={list.failed}
				activeId={activeId}
				open={listOpen}
				onNew={() => {
					setListOpen(false);
					navigate("/chat");
				}}
				onNavigate={() => setListOpen(false)}
				onRename={list.rename}
				onDelete={(conversation) => {
					setDeleteError(null);
					setDeleting(conversation);
				}}
			/>

			<section className="chat-main" aria-label="Chat com a IA">
				<header className="chat-header">
					<button type="button" className="btn-secondary btn-small chat-list-toggle" onClick={() => setListOpen((open) => !open)} aria-expanded={listOpen}>
						<MessagesIcon /> Conversas
					</button>
					<h1 className="chat-title">{title}</h1>
				</header>

				{aiAvailable === false && (
					<p className="alert alert-warning chat-banner" role="status">
						<AlertCircleIcon />
						<span>
							Nenhum provedor de IA está configurado. <Link to="/settings" className="link">Configure a chave em Configurações</Link> para conversar.
						</span>
					</p>
				)}

				{chat.status === "loading" ? (
					<div className="chat-thread" role="status" aria-busy="true">
						<span className="sr-only">Carregando conversa...</span>
						<div className="chat-thread-inner">
							<Skeleton width="60%" height={56} radius="var(--radius-lg)" />
							<Skeleton width="80%" height={96} radius="var(--radius-lg)" />
						</div>
					</div>
				) : chat.status === "failed" ? (
					<div className="chat-thread">
						<StateMessage
							variant="error"
							layout="page"
							message="Não deu pra carregar essa conversa."
							action={{ label: "Voltar pro chat", to: "/chat" }}
						/>
					</div>
				) : (
					<ChatThread
						key={activeId ?? "new"}
						messages={chat.messages}
						draft={chat.draft}
						sources={chat.sources}
						error={chat.error}
						canRetry={lastIsAnswerable}
						onRegenerate={() => void chat.regenerate()}
						onSuggest={suggest}
					/>
				)}

				<div className="chat-footer">
					<ContextBar
						attachments={chat.attachments}
						jobs={jobs}
						onDetach={(jobId) => void chat.detach(jobId)}
						onResume={(jobId, resumeVersionId) => void chat.attach(jobId, resumeVersionId)}
					/>
					<ChatComposer
						key={composerKey}
						jobs={jobs}
						attachedIds={attachedIds}
						streaming={chat.streaming}
						blocked={aiAvailable === false}
						initialText={drafts.current.get(composerKey) ?? ""}
						prefill={prefill}
						onTextChange={(text) => drafts.current.set(composerKey, text)}
						onSend={(text) => void chat.send(text)}
						onStop={chat.stop}
						onAttach={(job) => {
							void chat.attach(job.id, null);
						}}
					/>
					<p className="chat-privacy">A IA vê as vagas e o currículo que você anexar; o conteúdo é enviado ao provedor configurado. Notas pessoais nunca são enviadas.</p>
				</div>
			</section>

			<ConfirmDialog
				open={deleting !== null}
				title="Excluir conversa"
				confirmLabel="Excluir"
				busy={deleteBusy}
				onConfirm={() => void confirmDelete()}
				onCancel={() => setDeleting(null)}
			>
				<p>
					Excluir <strong>{deleting?.title}</strong>? As mensagens somem para sempre. As vagas e os currículos não são afetados.
				</p>
				{deleteError && (
					<p className="alert alert-error" role="alert">
						<span>{deleteError}</span>
					</p>
				)}
			</ConfirmDialog>
		</div>
	);
}

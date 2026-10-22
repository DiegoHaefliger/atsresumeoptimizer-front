import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiDelete, apiGet, apiPostJson, apiPostStream, apiPutJson, errorMessage } from "../api/client";
import type { ChatConversationDetail, ChatConversationSummary } from "../api/types";
import { attachmentPath, CONVERSATIONS_PATH, conversationPath, messagesPath, regeneratePath } from "./chatPaths";
import { readChatStream } from "./chatStream";
import { isImage } from "./chatFiles";
import { toChatAttachment, toChatMessage, type ChatAttachment, type ChatDraft, type ChatFile, type ChatMessage } from "./chatTypes";

const CONNECTION_ERROR = "Não deu para falar com o servidor. Confira se o app está rodando e tente de novo.";
const RELOAD_AFTER_ABORT_MS = 1500;
const EMPTY_DRAFT: ChatDraft = { text: "", tools: [], notice: null };

export type UnsentMessage = { text: string; files: File[] };

function releasePreviews(messages: ChatMessage[]) {
	for (const message of messages) {
		for (const file of message.files) {
			if (file.imageUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(file.imageUrl);
			}
		}
	}
}

export type ChatStatus = "idle" | "loading" | "failed";

type UseChatOptions = {
	onConversationCreated: (conversationId: string) => void;
	onConversationsChanged: () => void;
};

export function useChat({ onConversationCreated, onConversationsChanged }: UseChatOptions) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
	const [status, setStatus] = useState<ChatStatus>("idle");
	const [draft, setDraft] = useState<ChatDraft | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [unsent, setUnsent] = useState<UnsentMessage | null>(null);
	const [sources, setSources] = useState<Record<string, string[]>>({});
	const activeIdRef = useRef<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const attachmentsRef = useRef<ChatAttachment[]>([]);
	const tokenBufferRef = useRef("");
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		attachmentsRef.current = attachments;
	}, [attachments]);

	const flushTokens = useCallback(() => {
		frameRef.current = null;
		const pending = tokenBufferRef.current;
		tokenBufferRef.current = "";
		if (pending) {
			setDraft((current) => (current ? { ...current, text: current.text + pending } : current));
		}
	}, []);

	const cancelFrame = useCallback(() => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
	}, []);

	const load = useCallback(async (id: string) => {
		try {
			const detail = await apiGet<ChatConversationDetail>(conversationPath(id));
			if (activeIdRef.current !== id) {
				return;
			}
			setMessages((detail.messages ?? []).map(toChatMessage));
			setAttachments((detail.attachments ?? []).map(toChatAttachment));
			setStatus("idle");
		} catch {
			if (activeIdRef.current === id) {
				setStatus("failed");
			}
		}
	}, []);

	const select = useCallback(
		(id: string | null) => {
			abortRef.current?.abort();
			cancelFrame();
			tokenBufferRef.current = "";
			activeIdRef.current = id;
			setConversationId(id);
			setDraft(null);
			setError(null);
			setUnsent(null);
			setMessages([]);
			setAttachments([]);
			if (id) {
				setStatus("loading");
				void load(id);
			} else {
				setStatus("idle");
			}
		},
		[cancelFrame, load],
	);

	useEffect(
		() => () => {
			abortRef.current?.abort();
			cancelFrame();
		},
		[cancelFrame],
	);

	const ensureConversation = useCallback(async (): Promise<string> => {
		if (activeIdRef.current) {
			return activeIdRef.current;
		}
		const created = await apiPostJson<ChatConversationSummary>(CONVERSATIONS_PATH, {});
		const id = created.id ?? "";
		activeIdRef.current = id;
		setConversationId(id);
		await Promise.all(
			attachmentsRef.current.map((attachment) =>
				apiPutJson(attachmentPath(id, attachment.jobId), { resumeVersionId: attachment.resumeVersionId }),
			),
		);
		onConversationCreated(id);
		return id;
	}, [onConversationCreated]);

	const runStream = useCallback(
		async (id: string, path: string, body: unknown, retryDraft?: UnsentMessage) => {
			const controller = new AbortController();
			abortRef.current = controller;
			setError(null);
			setDraft(EMPTY_DRAFT);
			let finalMessage: ChatMessage | null = null;
			let streamError: string | null = null;
			let streamed = "";
			let userSaved = false;
			const toolsUsed: string[] = [];
			try {
				const response = await apiPostStream(path, body, controller.signal);
				for await (const event of readChatStream(response)) {
					if (activeIdRef.current !== id) {
						break;
					}
					switch (event.type) {
						case "user":
							userSaved = true;
							setMessages((current) => {
								releasePreviews(current.filter((message) => message.id.startsWith("pending-")));
								return [...current.filter((message) => !message.id.startsWith("pending-")), toChatMessage(event.message)];
							});
							break;
						case "token":
							streamed += event.text;
							tokenBufferRef.current += event.text;
							if (frameRef.current === null) {
								frameRef.current = requestAnimationFrame(flushTokens);
							}
							break;
						case "tool":
							toolsUsed.push(event.label);
							setDraft((current) => (current ? { ...current, tools: [...current.tools, event.label] } : current));
							break;
						case "notice":
							setDraft((current) => (current ? { ...current, notice: event.message } : current));
							break;
						case "done":
							finalMessage = toChatMessage(event.message);
							break;
						case "error":
							streamError = event.message;
							break;
					}
				}
			} catch (failure) {
				if (controller.signal.aborted) {
					streamError = null;
				} else {
					streamError = failure instanceof ApiError ? failure.message : CONNECTION_ERROR;
				}
			}
			cancelFrame();
			tokenBufferRef.current = "";
			if (activeIdRef.current !== id) {
				return;
			}
			setDraft(null);
			if (finalMessage) {
				const answer = finalMessage;
				setMessages((current) => [...current.filter((message) => message.id !== answer.id), answer]);
				if (toolsUsed.length > 0) {
					setSources((current) => ({ ...current, [answer.id]: toolsUsed }));
				}
			} else if (controller.signal.aborted) {
				if (streamed) {
					setMessages((current) => [
						...current,
						{ id: `local-${Date.now()}`, role: "ASSISTANT", content: streamed, interrupted: true, aiModel: null, costUsd: 0, files: [] },
					]);
				}
				window.setTimeout(() => {
					if (activeIdRef.current === id) {
						void load(id);
					}
				}, RELOAD_AFTER_ABORT_MS);
			} else {
				setError(streamError ?? CONNECTION_ERROR);
				if (!userSaved && retryDraft) {
					setUnsent(retryDraft);
				}
				await load(id);
			}
			onConversationsChanged();
		},
		[cancelFrame, flushTokens, load, onConversationsChanged],
	);

	const send = useCallback(
		async (text: string, files: File[] = []) => {
			let id: string;
			try {
				id = await ensureConversation();
			} catch (failure) {
				setError(errorMessage(failure, "Não deu para criar a conversa."));
				return;
			}
			const previews: ChatFile[] = files.map((file, index) => ({
				id: `local-${index}`,
				kind: isImage(file) ? "IMAGE" : "DOCUMENT",
				fileName: file.name,
				sizeBytes: file.size,
				imageUrl: isImage(file) ? URL.createObjectURL(file) : null,
			}));
			setMessages((current) => [
				...current,
				{ id: `pending-${Date.now()}`, role: "USER", content: text, interrupted: false, aiModel: null, costUsd: 0, files: previews },
			]);
			const form = new FormData();
			form.append("content", text);
			files.forEach((file) => form.append("files", file));
			await runStream(id, messagesPath(id), form, { text, files });
		},
		[ensureConversation, runStream],
	);

	const regenerate = useCallback(async () => {
		const id = activeIdRef.current;
		if (!id) {
			return;
		}
		setMessages((current) => (current.at(-1)?.role === "ASSISTANT" ? current.slice(0, -1) : current));
		await runStream(id, regeneratePath(id), undefined);
	}, [runStream]);

	const stop = useCallback(() => abortRef.current?.abort(), []);

	const attach = useCallback(async (jobId: string, resumeVersionId: string | null) => {
		const id = activeIdRef.current;
		setAttachments((current) => [...current.filter((item) => item.jobId !== jobId), { jobId, resumeVersionId }]);
		if (id) {
			try {
				await apiPutJson(attachmentPath(id, jobId), { resumeVersionId });
			} catch (failure) {
				setAttachments((current) => current.filter((item) => item.jobId !== jobId));
				setError(errorMessage(failure, "Não deu para anexar a vaga."));
			}
		}
	}, []);

	const detach = useCallback(async (jobId: string) => {
		const id = activeIdRef.current;
		setAttachments((current) => current.filter((item) => item.jobId !== jobId));
		if (id) {
			try {
				await apiDelete(attachmentPath(id, jobId));
			} catch (failure) {
				setError(errorMessage(failure, "Não deu para remover a vaga."));
				void load(id);
			}
		}
	}, [load]);

	return {
		conversationId,
		messages,
		attachments,
		status,
		draft,
		streaming: draft !== null,
		error,
		unsent,
		clearUnsent: () => setUnsent(null),
		sources,
		clearError: () => setError(null),
		select,
		send,
		regenerate,
		stop,
		attach,
		detach,
		reload: () => (conversationId ? load(conversationId) : undefined),
	};
}

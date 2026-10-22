import { useCallback } from "react";
import { apiDelete, apiPatchJson } from "../api/client";
import type { ChatConversationSummary } from "../api/types";
import { CONVERSATIONS_PATH, conversationPath } from "./chatPaths";
import { useApiResource } from "./useApiResource";

export function useConversations() {
	const { data, setData, failed, reload } = useApiResource<ChatConversationSummary[]>(CONVERSATIONS_PATH);

	const rename = useCallback(
		async (conversationId: string, title: string) => {
			const renamed = await apiPatchJson<ChatConversationSummary>(conversationPath(conversationId), { title });
			setData((current) => (current ?? []).map((item) => (item.id === conversationId ? renamed : item)));
		},
		[setData],
	);

	const remove = useCallback(
		async (conversationId: string) => {
			await apiDelete(conversationPath(conversationId));
			setData((current) => (current ?? []).filter((item) => item.id !== conversationId));
		},
		[setData],
	);

	return { conversations: data, failed, reload, rename, remove };
}

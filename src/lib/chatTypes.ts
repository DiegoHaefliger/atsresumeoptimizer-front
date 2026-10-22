import type { ChatAttachmentResponse, ChatMessageResponse } from "../api/types";

export type ChatRole = "USER" | "ASSISTANT";

export type ChatMessage = {
	id: string;
	role: ChatRole;
	content: string;
	interrupted: boolean;
	aiModel: string | null;
	costUsd: number;
};

export type ChatAttachment = {
	jobId: string;
	resumeVersionId: string | null;
};

export type ChatDraft = {
	text: string;
	tools: string[];
	notice: string | null;
};

export function toChatMessage(message: ChatMessageResponse): ChatMessage {
	return {
		id: message.id ?? crypto.randomUUID(),
		role: message.role === "USER" ? "USER" : "ASSISTANT",
		content: message.content ?? "",
		interrupted: message.interrupted ?? false,
		aiModel: message.aiModel ?? null,
		costUsd: message.costUsd ?? 0,
	};
}

export function toChatAttachment(attachment: ChatAttachmentResponse): ChatAttachment {
	return { jobId: attachment.jobPostingId ?? "", resumeVersionId: attachment.resumeVersionId ?? null };
}

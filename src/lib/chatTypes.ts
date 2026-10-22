import { apiUrl } from "../api/client";
import type { ChatAttachmentResponse, ChatMessageResponse } from "../api/types";

export type ChatRole = "USER" | "ASSISTANT";

export type ChatFile = {
	id: string;
	kind: "IMAGE" | "DOCUMENT";
	fileName: string;
	sizeBytes: number;
	imageUrl: string | null;
};

export type ChatMessage = {
	id: string;
	role: ChatRole;
	content: string;
	interrupted: boolean;
	aiModel: string | null;
	costUsd: number;
	files: ChatFile[];
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

export function chatFileUrl(fileId: string): string {
	return apiUrl(`/api/v1/chat/files/${fileId}`);
}

export function toChatMessage(message: ChatMessageResponse): ChatMessage {
	return {
		id: message.id ?? crypto.randomUUID(),
		role: message.role === "USER" ? "USER" : "ASSISTANT",
		content: message.content ?? "",
		interrupted: message.interrupted ?? false,
		aiModel: message.aiModel ?? null,
		costUsd: message.costUsd ?? 0,
		files: (message.files ?? []).map((file) => ({
			id: file.id ?? "",
			kind: file.kind === "IMAGE" ? "IMAGE" : "DOCUMENT",
			fileName: file.fileName ?? "arquivo",
			sizeBytes: file.sizeBytes ?? 0,
			imageUrl: file.kind === "IMAGE" && file.id ? chatFileUrl(file.id) : null,
		})),
	};
}

export function toChatAttachment(attachment: ChatAttachmentResponse): ChatAttachment {
	return { jobId: attachment.jobPostingId ?? "", resumeVersionId: attachment.resumeVersionId ?? null };
}

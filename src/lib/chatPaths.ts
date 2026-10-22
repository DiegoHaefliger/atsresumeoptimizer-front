export const CONVERSATIONS_PATH = "/api/v1/chat/conversations";

export function conversationPath(conversationId: string): string {
	return `${CONVERSATIONS_PATH}/${conversationId}`;
}

export function messagesPath(conversationId: string): string {
	return `${conversationPath(conversationId)}/messages`;
}

export function regeneratePath(conversationId: string): string {
	return `${messagesPath(conversationId)}/regenerate`;
}

export function attachmentPath(conversationId: string, jobId: string): string {
	return `${conversationPath(conversationId)}/jobs/${jobId}`;
}

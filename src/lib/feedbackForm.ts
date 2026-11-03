import type { FeedbackRequest } from "./feedbackApi";

export const MAX_MESSAGE = 5000;

export const MESSAGE_PLACEHOLDER = "Conte como foi sua experiência, o que podemos melhorar ou que recurso você gostaria de ver.";

export const RATING_LABELS = ["Ruim", "Fraco", "Regular", "Bom", "Excelente"] as const;

export type FeedbackDraft = {
	rating: number;
	message: string;
	contact: string;
	allowPublish: boolean;
};

export const EMPTY_DRAFT: FeedbackDraft = {
	rating: 0,
	message: "",
	contact: "",
	allowPublish: false,
};

export function canSubmit(draft: FeedbackDraft): boolean {
	return draft.rating >= 1 && draft.rating <= 5;
}

export function toRequest(draft: FeedbackDraft, appVersion: string | null): FeedbackRequest {
	const message = draft.message.trim() || null;
	return {
		rating: draft.rating,
		message,
		contact: draft.contact.trim() || null,
		allowPublish: message !== null && draft.allowPublish,
		appVersion,
	};
}

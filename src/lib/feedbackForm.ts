import type { FeedbackKind, FeedbackRequest } from "./feedbackApi";

export const MAX_MESSAGE = 4000;

export const KIND_OPTIONS: { value: FeedbackKind; label: string }[] = [
	{ value: "GENERAL", label: "Comentário" },
	{ value: "SUGGESTION", label: "Sugestão" },
	{ value: "IMPROVEMENT", label: "Melhoria" },
	{ value: "TESTIMONIAL", label: "Depoimento" },
];

export const MESSAGE_PLACEHOLDERS: Record<FeedbackKind, string> = {
	GENERAL: "Quer comentar algo? (opcional)",
	SUGGESTION: "Que recurso ou ajuste você gostaria de ver?",
	IMPROVEMENT: "O que poderia funcionar melhor, ou o que atrapalhou?",
	TESTIMONIAL: "Conte como o app te ajudou.",
};

export const RATING_LABELS = ["Ruim", "Fraco", "Regular", "Bom", "Excelente"] as const;

export type FeedbackDraft = {
	kind: FeedbackKind;
	rating: number;
	messages: Record<FeedbackKind, string>;
	contact: string;
	allowPublish: boolean;
};

export const EMPTY_DRAFT: FeedbackDraft = {
	kind: "GENERAL",
	rating: 0,
	messages: { GENERAL: "", SUGGESTION: "", IMPROVEMENT: "", TESTIMONIAL: "" },
	contact: "",
	allowPublish: false,
};

export function messageRequired(kind: FeedbackKind): boolean {
	return kind !== "GENERAL";
}

export function canSubmit(draft: FeedbackDraft): boolean {
	if (draft.rating < 1 || draft.rating > 5) {
		return false;
	}
	return !messageRequired(draft.kind) || draft.messages[draft.kind].trim().length > 0;
}

export function toRequest(draft: FeedbackDraft, appVersion: string | null): FeedbackRequest {
	return {
		kind: draft.kind,
		rating: draft.rating,
		message: draft.messages[draft.kind].trim() || null,
		contact: draft.contact.trim() || null,
		allowPublish: draft.kind === "TESTIMONIAL" && draft.allowPublish,
		appVersion,
	};
}

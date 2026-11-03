import { apiPostForm } from "../api/client";

export const FEEDBACK_PATH = "/api/v1/feedback";

export type FeedbackKind = "GENERAL" | "SUGGESTION" | "IMPROVEMENT" | "TESTIMONIAL";

export type FeedbackRequest = {
	kind: FeedbackKind;
	rating: number;
	message: string | null;
	contact: string | null;
	allowPublish: boolean;
	appVersion: string | null;
};

export type FeedbackReceipt = {
	createdAt: string;
	delivered: boolean;
};

export function submitFeedback(request: FeedbackRequest, files: File[]): Promise<FeedbackReceipt> {
	const form = new FormData();
	Object.entries(request).forEach(([name, value]) => {
		if (value !== null) {
			form.append(name, String(value));
		}
	});
	files.forEach((file) => form.append("files", file));
	return apiPostForm(FEEDBACK_PATH, form);
}

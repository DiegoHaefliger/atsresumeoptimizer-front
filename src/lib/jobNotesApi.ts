import { apiPutJson } from "../api/client";
import type { NoteText } from "../api/types";

export function jobNotePath(jobId: string): string {
	return `/api/v1/jobs/${jobId}/note`;
}

export function saveJobNote(jobId: string, content: string): Promise<NoteText> {
	return apiPutJson(jobNotePath(jobId), { content });
}

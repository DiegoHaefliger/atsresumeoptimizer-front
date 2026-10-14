import { apiPutJson } from "../api/client";
import type { NoteText } from "../api/types";

export const PERSONAL_NOTE_PATH = "/api/v1/personal-note";

export function savePersonalNote(content: string): Promise<NoteText> {
	return apiPutJson(PERSONAL_NOTE_PATH, { content });
}

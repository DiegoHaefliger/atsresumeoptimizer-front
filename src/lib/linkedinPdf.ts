import { apiPostForm } from "../api/client";
import type { LinkedInCaptureResponse } from "../api/linkedinTypes";

const PDF_PATH = "/api/v1/linkedin/snapshots/pdf";
const PDF_TYPE = "application/pdf";
const PDF_EXTENSION = ".pdf";

export function isPdf(file: File): boolean {
	return file.type === PDF_TYPE || file.name.toLowerCase().endsWith(PDF_EXTENSION);
}

export function uploadLinkedInPdf(file: File): Promise<LinkedInCaptureResponse> {
	const form = new FormData();
	form.append("file", file);
	return apiPostForm<LinkedInCaptureResponse>(PDF_PATH, form);
}

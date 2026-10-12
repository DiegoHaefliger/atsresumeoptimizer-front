import { apiDownload } from "./client";

export type ResumeExportFormat = "PDF" | "DOCX";

export function exportResume(resumeId: string | undefined, versionId: string | undefined, format: ResumeExportFormat) {
	return apiDownload(`/api/v1/resumes/${resumeId}/versions/${versionId}/export?format=${format}`);
}

export async function downloadResume(resumeId: string | undefined, versionId: string | undefined, format: ResumeExportFormat): Promise<void> {
	const { blob, fileName } = await exportResume(resumeId, versionId, format);
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
}

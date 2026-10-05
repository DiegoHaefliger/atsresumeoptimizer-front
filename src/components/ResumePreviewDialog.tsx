import { useCallback } from "react";
import { apiDownload } from "../api/client";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { versionLabel } from "../lib/resumeLabels";
import { Dialog } from "./Dialog";
import { PdfFrame } from "./PdfFrame";

type ResumePreviewDialogProps = {
	resume: ResumeSummary;
	version: ResumeVersionSummary;
	onClose: () => void;
};

export function ResumePreviewDialog({ resume, version, onClose }: ResumePreviewDialogProps) {
	const load = useCallback(
		async () =>
			(await apiDownload(`/api/v1/resumes/${resume.id}/versions/${version.id}/export?format=PDF`)).blob,
		[resume.id, version.id],
	);

	return (
		<Dialog
			open
			title={`Prévia — ${resume.title ?? "currículo"} · ${versionLabel(version)}`}
			onClose={onClose}
			size="large"
		>
			<div className="dialog-content">
				<PdfFrame title={`Prévia de ${resume.title ?? "currículo"}`} load={load} />
			</div>
		</Dialog>
	);
}

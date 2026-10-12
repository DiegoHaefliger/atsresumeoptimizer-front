import { useState } from "react";
import { errorMessage } from "../api/client";
import { downloadResume, type ResumeExportFormat } from "../api/resumeExport";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { versionLabel } from "../lib/resumeLabels";
import { BusyLabel } from "./BusyLabel";
import { Dialog } from "./Dialog";
import { DownloadIcon } from "./icons";
import { StateMessage } from "./StateMessage";

const FORMATS: { value: ResumeExportFormat; label: string }[] = [
	{ value: "PDF", label: "PDF" },
	{ value: "DOCX", label: "Word (DOCX)" },
];

type ResumeDownloadDialogProps = {
	resume: ResumeSummary;
	version: ResumeVersionSummary;
	onClose: () => void;
};

export function ResumeDownloadDialog({ resume, version, onClose }: ResumeDownloadDialogProps) {
	const [downloading, setDownloading] = useState<ResumeExportFormat | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function download(format: ResumeExportFormat) {
		setDownloading(format);
		setError(null);
		try {
			await downloadResume(resume.id, version.id, format);
			onClose();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra baixar o arquivo."));
			setDownloading(null);
		}
	}

	return (
		<Dialog open title="Baixar currículo" onClose={onClose}>
			<p>
				<strong>{resume.title}</strong> · {versionLabel(version)}
			</p>
			<p>Em qual formato você quer baixar?</p>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="dialog-actions">
				{FORMATS.map((format) => (
					<button
						key={format.value}
						type="button"
						disabled={downloading !== null}
						aria-busy={downloading === format.value}
						onClick={() => download(format.value)}
					>
						<BusyLabel busy={downloading === format.value} busyText="Gerando...">
							<DownloadIcon /> {format.label}
						</BusyLabel>
					</button>
				))}
			</div>
		</Dialog>
	);
}

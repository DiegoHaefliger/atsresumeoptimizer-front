import { useState } from "react";
import { apiDownload, errorMessage } from "../api/client";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { versionLabel } from "../lib/resumeLabels";
import { BusyLabel } from "./BusyLabel";
import { Dialog } from "./Dialog";
import { DownloadIcon } from "./icons";
import { StateMessage } from "./StateMessage";

type DownloadFormat = "PDF" | "DOCX";

const FORMATS: { value: DownloadFormat; label: string }[] = [
	{ value: "PDF", label: "PDF" },
	{ value: "DOCX", label: "Word (DOCX)" },
];

type ResumeDownloadDialogProps = {
	resume: ResumeSummary;
	version: ResumeVersionSummary;
	onClose: () => void;
};

export function ResumeDownloadDialog({ resume, version, onClose }: ResumeDownloadDialogProps) {
	const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function download(format: DownloadFormat) {
		setDownloading(format);
		setError(null);
		try {
			const { blob, fileName } = await apiDownload(
				`/api/v1/resumes/${resume.id}/versions/${version.id}/export?format=${format}`,
			);
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			link.click();
			URL.revokeObjectURL(url);
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

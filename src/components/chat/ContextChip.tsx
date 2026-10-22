import { useEffect, useMemo, useRef } from "react";
import type { ResumeSummary } from "../../api/types";
import type { ChatAttachment } from "../../lib/chatTypes";
import { jobResumesPath } from "../../lib/jobAssistantPaths";
import { jobLabel } from "../../lib/jobCode";
import { resumeVersionOptions } from "../../lib/resumeVersionOptions";
import type { Job } from "../../lib/useJobs";
import { useApiResource } from "../../lib/useApiResource";
import { XIcon } from "../icons";

type ContextChipProps = {
	attachment: ChatAttachment;
	job: Job | null;
	onDetach: (jobId: string) => void;
	onResume: (jobId: string, resumeVersionId: string | null) => void;
};

const NO_RESUME = "";

export function ContextChip({ attachment, job, onDetach, onResume }: ContextChipProps) {
	const { data: resumes } = useApiResource<ResumeSummary[]>(jobResumesPath(attachment.jobId));
	const options = useMemo(() => resumeVersionOptions(resumes ?? []), [resumes]);
	const autoPicked = useRef(false);
	const label = job ? jobLabel(job.code, job.title, job.company) : "Vaga indisponível";

	useEffect(() => {
		if (!autoPicked.current && options.length > 0 && attachment.resumeVersionId === null) {
			autoPicked.current = true;
			onResume(attachment.jobId, options[0].versionId);
		}
	}, [options, attachment, onResume]);

	return (
		<li className="chat-chip">
			<span className="chat-chip-label" title={label}>
				{label}
			</span>
			{options.length > 0 && (
				<select
					className="chat-chip-select"
					aria-label={`Currículo usado pela IA na vaga ${label}`}
					value={attachment.resumeVersionId ?? NO_RESUME}
					onChange={(event) => {
						autoPicked.current = true;
						onResume(attachment.jobId, event.target.value || null);
					}}
				>
					<option value={NO_RESUME}>Sem currículo</option>
					{options.map((option) => (
						<option key={option.versionId} value={option.versionId}>
							{option.label}
						</option>
					))}
				</select>
			)}
			<button type="button" className="chat-chip-remove" onClick={() => onDetach(attachment.jobId)} aria-label={`Remover ${label} da conversa`}>
				<XIcon />
			</button>
		</li>
	);
}

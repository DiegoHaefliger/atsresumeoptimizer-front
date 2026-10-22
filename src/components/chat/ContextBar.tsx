import type { ChatAttachment } from "../../lib/chatTypes";
import type { Job } from "../../lib/useJobs";
import { ContextChip } from "./ContextChip";

type ContextBarProps = {
	attachments: ChatAttachment[];
	jobs: Job[] | null;
	onDetach: (jobId: string) => void;
	onResume: (jobId: string, resumeVersionId: string | null) => void;
};

export function ContextBar({ attachments, jobs, onDetach, onResume }: ContextBarProps) {
	if (attachments.length === 0) {
		return (
			<p className="chat-context-empty">
				Nenhuma vaga anexada · digite <kbd>@</kbd> para adicionar uma
			</p>
		);
	}
	return (
		<ul className="chat-context" aria-label="Vagas anexadas à conversa">
			{attachments.map((attachment) => (
				<ContextChip
					key={attachment.jobId}
					attachment={attachment}
					job={jobs?.find((job) => job.id === attachment.jobId) ?? null}
					onDetach={onDetach}
					onResume={onResume}
				/>
			))}
		</ul>
	);
}

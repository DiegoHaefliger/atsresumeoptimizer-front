import { jobLabel } from "../lib/jobCode";
import type { Job } from "../lib/useJobs";
import { Dialog } from "./Dialog";
import { JobNotes } from "./JobNotes";

type JobNotesDialogProps = {
	job: Job | null;
	onClose: () => void;
};

export function JobNotesDialog({ job, onClose }: JobNotesDialogProps) {
	return (
		<Dialog
			open={job !== null}
			title={`Notas · ${job ? jobLabel(job.code, job.title, null) : ""}`}
			onClose={onClose}
			size="medium"
		>
			<div className="dialog-content">{job && <JobNotes key={job.id} jobId={job.id} />}</div>
		</Dialog>
	);
}

import { jobLabel } from "../lib/jobCode";
import type { Job } from "../lib/useJobs";
import { Dialog } from "./Dialog";
import { JobPreview } from "./JobPreview";

type JobPreviewDialogProps = {
	job: Job | null;
	onClose: () => void;
};

export function JobPreviewDialog({ job, onClose }: JobPreviewDialogProps) {
	return (
		<Dialog open={job !== null} title={job ? jobLabel(job.code, job.title, null) : ""} onClose={onClose} size="large">
			<div className="dialog-content">
				<JobPreview job={job} />
			</div>
		</Dialog>
	);
}

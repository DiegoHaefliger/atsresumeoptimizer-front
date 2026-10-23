import { Dialog } from "./Dialog";
import { JobCostSection } from "./JobCostSection";

type JobCostDialogProps = {
	jobId: string;
	open: boolean;
	onClose: () => void;
};

export function JobCostDialog({ jobId, open, onClose }: JobCostDialogProps) {
	return (
		<Dialog open={open} title="Custo de IA" onClose={onClose} size="medium">
			<div className="dialog-content">
				<JobCostSection jobId={jobId} />
			</div>
		</Dialog>
	);
}

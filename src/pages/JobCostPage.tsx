import { useParams } from "react-router-dom";
import { JobHeader } from "../components/JobHeader";
import { JobCostSection } from "../components/JobCostSection";
import { useJobs } from "../lib/useJobs";

export function JobCostPage() {
	const { jobId = "" } = useParams<{ jobId: string }>();
	const { jobs } = useJobs();
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;

	return (
		<div className="page">
			<JobHeader jobId={jobId} job={job} />
			<JobCostSection jobId={jobId} />
		</div>
	);
}

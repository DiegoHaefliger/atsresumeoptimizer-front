import { useParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { JobCode } from "../components/JobCode";
import { JobCostSection } from "../components/JobCostSection";
import { useJobs } from "../lib/useJobs";

export function JobCostPage() {
	const { jobId = "" } = useParams<{ jobId: string }>();
	const { jobs } = useJobs();
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Custo de IA</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Custo de IA"}</h1>
					{job?.company && <p className="page-subtitle">{job.company}</p>}
				</div>
				<BackLink fallback="/jobs" />
			</header>
			<JobCostSection jobId={jobId} />
		</div>
	);
}

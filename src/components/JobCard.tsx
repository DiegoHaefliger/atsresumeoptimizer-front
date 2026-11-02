import type { SelectionProcess } from "../api/types";
import { jobDetails } from "../lib/jobMeta";
import type { Job } from "../lib/useJobs";
import { JobActions, type JobActionHandlers } from "./JobActions";
import { JobCode } from "./JobCode";
import { Badge } from "./Badge";
import { StageAge } from "./StageAge";
import { StageBadge } from "./StageBadge";
import { ClipboardCheckIcon } from "./icons";
import { JobCardAttention } from "./JobCardAttention";
import { JobCardMatch } from "./JobCardMatch";

type JobCardProps = JobActionHandlers & {
	job: Job;
	process?: SelectionProcess;
	removing: boolean;
};

export function JobCard({ job, process, removing, onAnalyze, onSummary, ...actions }: JobCardProps) {
	const title = job.title ?? "Vaga sem título";
	return (
		<article className="job-card">
			<header className="job-card-top">
				<JobCode code={job.code} />
				{process && <StageBadge stage={process.stage} />}
				{job.origin === "AUTOMATIC_SEARCH" && <Badge tone="info">Auto</Badge>}
				{job.origin === "MANUAL" && <Badge tone="neutral">Manual</Badge>}
				{process && <StageAge process={process} />}
			</header>
			<div className="job-card-heading">
				<h3 className="job-card-title">
					{onSummary ? (
						<button type="button" className="job-card-link" onClick={() => onSummary(job)}>
							{title}
						</button>
					) : (
						title
					)}
				</h3>
				{job.company && <p className="job-card-company">{job.company}</p>}
				<p className="job-card-details">{jobDetails(job)}</p>
			</div>
			<JobCardMatch job={job} />
			<footer className="job-card-footer">
				{onAnalyze && (
					<button
						type="button"
						className={`btn-small job-card-analyze${process ? " btn-secondary" : ""}`}
						onClick={() => onAnalyze(job)}
					>
						<ClipboardCheckIcon /> Analisar
					</button>
				)}
				<JobActions job={job} removing={removing} {...actions} />
				{process && <JobCardAttention process={process} />}
			</footer>
		</article>
	);
}

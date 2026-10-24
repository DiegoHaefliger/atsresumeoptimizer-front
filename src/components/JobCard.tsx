import type { SelectionProcess } from "../api/types";
import { jobDetails } from "../lib/jobMeta";
import type { Job } from "../lib/useJobs";
import { JobScore } from "./JobScore";
import { JobActions, type JobActionHandlers } from "./JobActions";
import { JobCode } from "./JobCode";
import { Badge } from "./Badge";
import { StageBadge } from "./StageBadge";
import { ClipboardCheckIcon } from "./icons";

type JobCardProps = JobActionHandlers & {
	job: Job;
	process?: SelectionProcess;
	removing: boolean;
};

export function JobCard({ job, process, removing, onAnalyze, ...actions }: JobCardProps) {
	return (
		<article className="job-card">
			<header className="job-card-top">
				<JobCode code={job.code} />
				{job.origin === "AUTOMATIC_SEARCH" && <Badge tone="info">Busca automática</Badge>}
				{process && <StageBadge stage={process.stage} />}
			</header>
			<div className="job-card-heading">
				<h3 className="job-card-title">{job.title ?? "Vaga sem título"}</h3>
				{job.company && <p className="job-card-company">{job.company}</p>}
				<p className="job-card-details">{jobDetails(job)}</p>
			</div>
			<dl className="job-card-scores">
				<JobScore label="Aderência" score={job.preferenceScore} />
				<JobScore label="Nota ATS" score={job.atsScore} />
			</dl>
			<footer className="job-card-footer">
				{onAnalyze && (
					<button type="button" className="btn-small job-card-analyze" onClick={() => onAnalyze(job)}>
						<ClipboardCheckIcon /> Analisar
					</button>
				)}
				<JobActions job={job} removing={removing} {...actions} />
			</footer>
		</article>
	);
}

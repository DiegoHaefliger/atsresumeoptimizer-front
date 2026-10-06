import { JobCode } from "./JobCode";
import { workModelLabel } from "../lib/jobLabels";
import type { Job } from "../lib/useJobs";

export function JobPreview({ job }: { job: Job | null }) {
	if (!job) {
		return (
			<div className="aside-card">
				<span className="aside-card-title">Nenhuma vaga escolhida</span>
				<p className="aside-card-note">
					Escolha uma vaga da lista. O currículo vai ser comparado com o texto dela. Vagas novas se cadastram no menu Vagas.
				</p>
			</div>
		);
	}

	const facts = [job.company, job.workModel && workModelLabel(job.workModel)].filter(Boolean).join(" · ");
	return (
		<div className="aside-card">
			<div>
				<span className="aside-card-title">
					<JobCode code={job.code} /> {job.title ?? "Vaga sem título"}
				</span>
				{facts && <p className="aside-card-note">{facts}</p>}
			</div>
			{job.sourceUrl && (
				<a href={job.sourceUrl} target="_blank" rel="noreferrer" className="link">
					Abrir anúncio da vaga
				</a>
			)}
			{job.interviewUrl && (
				<a href={job.interviewUrl} target="_blank" rel="noreferrer" className="link">
					Abrir link da entrevista
				</a>
			)}
			<p className="job-preview-text">{job.jobDescription}</p>
		</div>
	);
}

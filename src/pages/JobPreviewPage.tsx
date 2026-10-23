import { useParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { JobCode } from "../components/JobCode";
import { JobScore } from "../components/JobScore";
import { RichTextView } from "../components/RichTextView";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { ExternalLinkIcon } from "../components/icons";
import { CONTRACT_TYPE_LABELS, workModelLabel } from "../lib/jobLabels";
import { useJobs, type Job } from "../lib/useJobs";

const TRAILING_PUNCTUATION = /[;.,\s]+$/;

function facts(job: Job): { label: string; value: string }[] {
	return [
		{ label: "Modelo de trabalho", value: job.workModel ? workModelLabel(job.workModel) : "" },
		{ label: "Senioridade", value: job.seniority ?? "" },
		{ label: "Contrato", value: job.contractType ? CONTRACT_TYPE_LABELS[job.contractType] : "" },
		{ label: "Remuneração", value: job.salary != null ? `R$ ${job.salary.toLocaleString("pt-BR")}` : "" },
	].filter((fact) => fact.value);
}

export function JobPreviewPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { jobs, failed } = useJobs();
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Prévia da vaga</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Prévia da vaga"}</h1>
					{job?.company && <p className="page-subtitle">{job.company}</p>}
				</div>
				<BackLink fallback="/jobs" />
			</header>

			{failed || (jobs !== null && !job) ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra carregar essa vaga."
					action={{ label: "Voltar pras vagas", to: "/jobs" }}
				/>
			) : !job ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando vaga...</span>
					<Skeleton width="100%" height={320} radius="var(--radius-lg)" />
				</div>
			) : (
				<div className="job-preview-layout">
					<section className="panel panel-body job-preview-main" aria-label="Descrição da vaga">
						<h2 className="process-section-title">Descrição</h2>
						{job.jobDescription ? (
							<div className="job-preview-description">
								<RichTextView markup={job.jobDescription} />
							</div>
						) : (
							<StateMessage variant="empty" message="Esta vaga não tem descrição cadastrada." />
						)}
					</section>
					<aside className="job-preview-side">
						<section className="panel panel-body" aria-label="Resumo da vaga">
							<h2 className="process-section-title">Resumo</h2>
							<dl className="job-preview-scores">
								<JobScore label="Aderência" score={job.preferenceScore} />
								<JobScore label="Nota ATS" score={job.atsScore} />
							</dl>
							{facts(job).length > 0 && (
								<dl className="process-facts">
									{facts(job).map((fact) => (
										<div className="process-fact" key={fact.label}>
											<dt>{fact.label}</dt>
											<dd>{fact.value}</dd>
										</div>
									))}
								</dl>
							)}
							{job.benefits && job.benefits.length > 0 && (
								<div className="job-preview-benefits">
									<span className="process-section-title">Benefícios</span>
									<ul>
										{job.benefits.map((benefit) => (
											<li key={benefit} className="job-summary-chip">
												{benefit.replace(TRAILING_PUNCTUATION, "")}
											</li>
										))}
									</ul>
								</div>
							)}
							{(job.sourceUrl || job.interviewUrl) && (
								<div className="job-preview-links">
									{job.sourceUrl && (
										<a href={job.sourceUrl} target="_blank" rel="noreferrer" className="job-summary-chip job-summary-chip-primary">
											Abrir anúncio <ExternalLinkIcon />
										</a>
									)}
									{job.interviewUrl && (
										<a href={job.interviewUrl} target="_blank" rel="noreferrer" className="job-summary-chip">
											Link da entrevista <ExternalLinkIcon />
										</a>
									)}
								</div>
							)}
						</section>
						{job.companyInfo && (
							<section className="panel panel-body" aria-label="Sobre a empresa">
								<h2 className="process-section-title">Sobre a empresa</h2>
								<div className="job-preview-description">
									<RichTextView markup={job.companyInfo} />
								</div>
							</section>
						)}
					</aside>
				</div>
			)}
		</div>
	);
}

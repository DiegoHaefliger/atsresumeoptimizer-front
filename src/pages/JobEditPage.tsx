import { Link, useNavigate, useParams } from "react-router-dom";
import { apiPutJson } from "../api/client";
import { ArrowLeftIcon } from "../components/icons";
import { JobForm } from "../components/JobForm";
import { benefitsToText, jobRequest, type JobDraft } from "../lib/jobDraft";
import { matchingOption, SENIORITY_OPTIONS } from "../lib/jobLabels";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { useJobs } from "../lib/useJobs";

export function JobEditPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { jobs, failed } = useJobs();
	const navigate = useNavigate();
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;

	async function save(draft: JobDraft) {
		await apiPutJson(`/api/v1/jobs/${jobId}`, jobRequest(draft));
		navigate("/jobs");
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Vagas</span>
					<h1>Editar vaga</h1>
					<p className="page-subtitle">Se mudar o texto da vaga, a IA lê de novo pra atualizar título e requisitos.</p>
				</div>
				<Link to="/jobs" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
			</header>

			{failed || (jobs !== null && !job) ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra encontrar essa vaga."
					action={{ label: "Voltar pras vagas", to: "/jobs" }}
				/>
			) : job ? (
				<JobForm
					initial={{
						title: job.title ?? "",
						seniority: matchingOption(SENIORITY_OPTIONS, job.seniority ?? "") ?? "",
						contractType: job.contractType ?? "",
						text: job.jobDescription ?? "",
						company: job.company ?? "",
						sourceUrl: job.sourceUrl ?? "",
						workModel: job.workModel ?? "",
						interviewUrl: job.interviewUrl ?? "",
						salary: job.salary != null ? String(job.salary) : "",
						benefits: benefitsToText(job.benefits),
					}}
					submitLabel="Salvar alterações"
					onSave={save}
				/>
			) : (
				<div className="form form-narrow" role="status" aria-busy="true">
					<span className="sr-only">Carregando vaga...</span>
					<Skeleton width="100%" height={260} radius="var(--radius-lg)" />
					<Skeleton width="100%" height={160} radius="var(--radius-lg)" />
				</div>
			)}
		</div>
	);
}

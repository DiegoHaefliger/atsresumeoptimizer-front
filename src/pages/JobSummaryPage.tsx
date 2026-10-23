import { useState } from "react";
import { useParams } from "react-router-dom";
import { AnalyzeJobDialog } from "../components/AnalyzeJobDialog";
import { BackLink } from "../components/BackLink";
import { JobNotes } from "../components/JobNotes";
import { JobPreviewDialog } from "../components/JobPreviewDialog";
import { JobResumesDialog } from "../components/JobResumesDialog";
import { JobSummary } from "../components/JobSummaryContent";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { useJobs } from "../lib/useJobs";
import { useProcesses } from "../lib/useProcesses";

type OpenDialog = "analyze" | "preview" | "resumes" | null;

export function JobSummaryPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { jobs, failed } = useJobs();
	const { processes } = useProcesses();
	const [dialog, setDialog] = useState<OpenDialog>(null);
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;
	const process = processes?.find((candidate) => candidate.jobPostingId === jobId);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Candidatura</span>
					<h1>Resumo da candidatura</h1>
					<p className="page-subtitle">O que já foi feito nesta vaga e atalhos para cada etapa.</p>
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
				<section className="panel panel-body job-summary-page">
					<JobSummary
						job={job}
						process={process}
						onAnalyze={() => setDialog("analyze")}
						onPreview={() => setDialog("preview")}
						onResumes={() => setDialog("resumes")}
					/>
				</section>
			)}
			{job && (
				<section className="panel panel-body job-summary-notes" aria-labelledby="job-summary-notes-heading">
					<h2 id="job-summary-notes-heading">Notas da vaga</h2>
					<JobNotes jobId={job.id} />
				</section>
			)}
			<AnalyzeJobDialog job={dialog === "analyze" ? job : null} onClose={() => setDialog(null)} />
			<JobPreviewDialog job={dialog === "preview" ? job : null} onClose={() => setDialog(null)} />
			<JobResumesDialog
				job={dialog === "resumes" ? job : null}
				onClose={() => setDialog(null)}
				onAnalyze={() => {
					setDialog("analyze");
				}}
			/>
		</div>
	);
}

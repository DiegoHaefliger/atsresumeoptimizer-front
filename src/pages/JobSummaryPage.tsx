import { useState } from "react";
import { useParams } from "react-router-dom";
import { AnalyzeJobDialog } from "../components/AnalyzeJobDialog";
import { BackLink } from "../components/BackLink";
import { JobCode } from "../components/JobCode";
import { JobResumesDialog } from "../components/JobResumesDialog";
import { JobSummary } from "../components/JobSummaryContent";
import { Skeleton } from "../components/Skeleton";
import { StageBadge } from "../components/StageBadge";
import { StateMessage } from "../components/StateMessage";
import { useJobs } from "../lib/useJobs";
import { useProcesses } from "../lib/useProcesses";

type OpenDialog = "analyze" | "resumes" | null;

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
					<span className="eyebrow">Resumo da candidatura</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Resumo da candidatura"}</h1>
					{job && (job.company || process) && (
						<p className="page-subtitle job-summary-subtitle">
							{job.company}
							{process && <StageBadge stage={process.stage} />}
						</p>
					)}
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
				<JobSummary
					job={job}
					process={process}
					onAnalyze={() => setDialog("analyze")}
					onResumes={() => setDialog("resumes")}
				/>
			)}
			<AnalyzeJobDialog job={dialog === "analyze" ? job : null} onClose={() => setDialog(null)} />
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

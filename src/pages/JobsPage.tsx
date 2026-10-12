import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnalyzeJobDialog } from "../components/AnalyzeJobDialog";
import { JobResumesDialog } from "../components/JobResumesDialog";
import { JobPreviewDialog } from "../components/JobPreviewDialog";
import { JobList } from "../components/JobList";
import { StateMessage } from "../components/StateMessage";
import { useJobs, type Job } from "../lib/useJobs";
import { useProcesses } from "../lib/useProcesses";

export type JobsPageState = { analyzeJobId?: string };

export function JobsPage() {
	const location = useLocation();
	const { jobs, failed, reload, remove } = useJobs();
	const { processes } = useProcesses();
	const processByJob = useMemo(() => new Map((processes ?? []).map((process) => [process.jobPostingId, process])), [processes]);
	const [previewing, setPreviewing] = useState<Job | null>(null);
	const [viewingResumes, setViewingResumes] = useState<Job | null>(null);
	const [analyzingId, setAnalyzingId] = useState<string | null>(
		() => (location.state as JobsPageState | null)?.analyzeJobId ?? null,
	);
	const analyzing = jobs?.find((job) => job.id === analyzingId) ?? null;
	const navigate = useNavigate();

	function closeAnalyze() {
		setAnalyzingId(null);
		navigate(location.pathname, { replace: true, state: null });
	}

	return (
		<div className="page jobs-page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Vagas</span>
					<h1>Vagas cadastradas</h1>
					<p className="page-subtitle">
						Cadastre as vagas que te interessam. Elas ficam disponíveis pra analisar qualquer currículo e são
						cruzadas com suas preferências.
					</p>
				</div>
				<Link to="/jobs/new" className="button-link">
					Cadastrar vaga
				</Link>
			</header>

			{jobs !== null && jobs.length === 0 && !failed ? (
				<StateMessage
					variant="empty"
					layout="page"
					message="Nenhuma vaga cadastrada ainda."
					action={{ label: "Cadastrar a primeira vaga", to: "/jobs/new" }}
				/>
			) : (
				<JobList
					view="cards"
					jobs={jobs}
					failed={failed}
					onRetry={reload}
					onRemove={remove}
					onAnalyze={(job) => setAnalyzingId(job.id)}
					onPreview={setPreviewing}
					onResumes={setViewingResumes}
					processes={processByJob}
					onProcess={(job) => navigate(`/jobs/${job.id}/process`)}
					onAssistant={(job) => navigate(`/jobs/${job.id}/assistant`)}
					onEdit={(job) => navigate(`/jobs/${job.id}/edit`)}
				/>
			)}
			<JobResumesDialog
				job={viewingResumes}
				onClose={() => setViewingResumes(null)}
				onAnalyze={(job) => {
					setViewingResumes(null);
					setAnalyzingId(job.id);
				}}
			/>
			<AnalyzeJobDialog job={analyzing} onClose={closeAnalyze} />
			<JobPreviewDialog job={previewing} onClose={() => setPreviewing(null)} />
		</div>
	);
}

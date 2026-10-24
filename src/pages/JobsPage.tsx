import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnalyzeJobDialog } from "../components/AnalyzeJobDialog";
import { JobResumesDialog } from "../components/JobResumesDialog";
import { JobSuggestionsPanel } from "../components/JobSuggestionsPanel";
import { PageTabs } from "../components/PageTabs";
import { JobList } from "../components/JobList";
import { StateMessage } from "../components/StateMessage";
import { useJobs, type Job } from "../lib/useJobs";
import { useNewSuggestionCount } from "../lib/useJobSuggestions";
import { useProcesses } from "../lib/useProcesses";

export type JobsPageState = { analyzeJobId?: string };

const JOBS_PER_PAGE = 30;
const PAGE_SIZE_OPTIONS = [30, 60, 100] as const;

type JobsTab = "registered" | "suggestions";

const SUBTITLES: Record<JobsTab, string> = {
	registered:
		"Cadastre as vagas que te interessam. Elas ficam disponíveis pra analisar qualquer currículo e são cruzadas com suas preferências.",
	suggestions:
		"Vagas achadas pela busca automática ou importadas de postagens. Só viram vagas cadastradas quando você promove.",
};

export function JobsPage() {
	const location = useLocation();
	const { jobs, failed, reload, remove } = useJobs();
	const { processes } = useProcesses();
	const processByJob = useMemo(() => new Map((processes ?? []).map((process) => [process.jobPostingId, process])), [processes]);
	const [viewingResumes, setViewingResumes] = useState<Job | null>(null);
	const [analyzingId, setAnalyzingId] = useState<string | null>(
		() => (location.state as JobsPageState | null)?.analyzeJobId ?? null,
	);
	const analyzing = jobs?.find((job) => job.id === analyzingId) ?? null;
	const navigate = useNavigate();
	const [params, setParams] = useSearchParams();
	const { count: newSuggestions, reload: reloadSuggestionCount } = useNewSuggestionCount();
	const tab: JobsTab = params.get("tab") === "suggestions" ? "suggestions" : "registered";

	function selectTab(next: JobsTab) {
		setParams(next === "suggestions" ? { tab: next } : {}, { replace: true });
	}

	function handlePromoted() {
		reload();
		selectTab("registered");
	}

	function closeAnalyze() {
		setAnalyzingId(null);
		navigate(location.pathname, { replace: true, state: null });
	}

	return (
		<div className="page jobs-page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Vagas</span>
					<h1>{tab === "suggestions" ? "Sugestões de vagas" : "Vagas cadastradas"}</h1>
					<p className="page-subtitle">{SUBTITLES[tab]}</p>
				</div>
				<Link to="/jobs/new" className="button-link">
					Cadastrar vaga
				</Link>
			</header>

			<PageTabs
				label="Vagas"
				options={[
					{ value: "registered", label: "Cadastradas" },
					{ value: "suggestions", label: newSuggestions > 0 ? `Sugestões (${newSuggestions})` : "Sugestões" },
				]}
				value={tab}
				onChange={selectTab}
			/>

			{tab === "suggestions" ? (
				<JobSuggestionsPanel onChanged={reloadSuggestionCount} onPromoted={handlePromoted} />
			) : jobs !== null && jobs.length === 0 && !failed ? (
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
					onSummary={(job) => navigate(`/jobs/${job.id}/summary`)}
					processes={processByJob}
					pageSize={JOBS_PER_PAGE}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
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
		</div>
	);
}

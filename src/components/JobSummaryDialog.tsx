import { Link } from "react-router-dom";
import type { CandidateQuestionSet, CoverLetter, InterviewQuestionSet, ResumeSummary, SelectionProcess } from "../api/types";
import { candidateQuestionsPath, coverLettersPath, interviewQuestionsPath, jobResumesPath } from "../lib/jobAssistantPaths";
import { buildSummary, summaryProgress } from "../lib/jobSummary";
import { formatCost } from "../lib/costFormat";
import { useApiResource } from "../lib/useApiResource";
import { useJobCost } from "../lib/useJobCost";
import type { Job } from "../lib/useJobs";
import { Dialog } from "./Dialog";
import { ArrowRightIcon, ClipboardCheckIcon, CoinsIcon, EyeIcon, KanbanIcon } from "./icons";
import { JobCode } from "./JobCode";
import { JobSummaryStep } from "./JobSummaryStep";
import { LoadFailed } from "./LoadFailed";
import { Skeleton } from "./Skeleton";
import { StageBadge } from "./StageBadge";

type JobSummaryDialogProps = {
	job: Job | null;
	process?: SelectionProcess;
	onClose: () => void;
	onAnalyze: () => void;
	onPreview: () => void;
	onResumes: () => void;
	onOpenCost: () => void;
};

type JobSummaryProps = Omit<JobSummaryDialogProps, "job"> & { job: Job };

export function JobSummaryDialog({ job, ...handlers }: JobSummaryDialogProps) {
	return (
		<Dialog open={job !== null} title="Resumo da candidatura" onClose={handlers.onClose} size="medium">
			<div className="dialog-content">{job && <JobSummary key={job.id} job={job} {...handlers} />}</div>
		</Dialog>
	);
}

function JobSummary({ job, process, onClose, onAnalyze, onPreview, onResumes, onOpenCost }: JobSummaryProps) {
	const resumes = useApiResource<ResumeSummary[]>(jobResumesPath(job.id));
	const letters = useApiResource<CoverLetter[]>(coverLettersPath(job.id));
	const questions = useApiResource<InterviewQuestionSet[]>(interviewQuestionsPath(job.id));
	const doubts = useApiResource<CandidateQuestionSet[]>(candidateQuestionsPath(job.id));
	const { cost } = useJobCost(job.id);

	function reload() {
		resumes.reload();
		letters.reload();
		questions.reload();
		doubts.reload();
	}

	const header = (
		<header className="job-summary-header">
			<div className="job-summary-title">
				<JobCode code={job.code} />
				<strong>{job.title ?? "Vaga sem título"}</strong>
				{process && <StageBadge stage={process.stage} />}
			</div>
			{job.company && <span className="job-summary-company">{job.company}</span>}
		</header>
	);

	if (resumes.failed || letters.failed || questions.failed || doubts.failed) {
		return (
			<>
				{header}
				<LoadFailed message="Não deu pra carregar o resumo desta vaga." onRetry={reload} />
			</>
		);
	}
	if (!resumes.data || !letters.data || !questions.data || !doubts.data) {
		return (
			<>
				{header}
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando resumo...</span>
					<Skeleton width="100%" height={280} radius="var(--radius-lg)" />
				</div>
			</>
		);
	}

	const steps = buildSummary({
		jobId: job.id,
		resumes: resumes.data,
		coverLetters: letters.data.length,
		interviewSets: questions.data.length,
		candidateSets: doubts.data.length,
	});
	const { done, total } = summaryProgress(steps);
	const spent = cost?.stages.some((stage) => stage.executed) ? formatCost(cost.totalCostBrl, "BRL") : null;

	return (
		<>
			{header}
			<div className="job-summary-progress" role="group" aria-label={`${done} de ${total} etapas concluídas`}>
				<div className="job-summary-progress-text">
					<strong>
						{done} de {total}
					</strong>{" "}
					etapas concluídas
				</div>
				<div className="job-summary-progress-track" aria-hidden="true">
					<div className="job-summary-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
				</div>
			</div>
			<ol className="job-summary">
				{steps.map((step) => (
					<JobSummaryStep
						key={step.key}
						step={step}
						onNavigate={onClose}
						actions={
							<>
								{step.key === "analysis" && !step.done && (
									<button type="button" className="job-summary-chip job-summary-chip-primary" onClick={onAnalyze}>
										<ClipboardCheckIcon /> Analisar esta vaga
									</button>
								)}
								{step.key === "resume" && step.done && (
									<button type="button" className="job-summary-chip" onClick={onResumes}>
										Ver currículos gerados
									</button>
								)}
							</>
						}
					/>
				))}
			</ol>
			<div className="job-summary-shortcuts">
				<button type="button" className="job-summary-shortcut" onClick={onPreview}>
					<EyeIcon />
					<span>
						<strong>Vaga</strong>
						<small>Ver prévia da descrição</small>
					</span>
					<ArrowRightIcon />
				</button>
				<Link to={`/jobs/${job.id}/process`} className="job-summary-shortcut" onClick={onClose}>
					<KanbanIcon />
					<span>
						<strong>Processo seletivo</strong>
						<small>{process ? "Acompanhar etapas e agenda" : "Cadastrar processo"}</small>
					</span>
					<ArrowRightIcon />
				</Link>
				<button type="button" className="job-summary-shortcut" onClick={onOpenCost}>
					<CoinsIcon />
					<span>
						<strong>Custo de IA</strong>
						<small>{spent ? `${spent} gastos até agora` : "Quanto cada etapa consumiu"}</small>
					</span>
					<ArrowRightIcon />
				</button>
			</div>
		</>
	);
}

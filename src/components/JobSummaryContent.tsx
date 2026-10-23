import { Link } from "react-router-dom";
import type { CandidateQuestionSet, CoverLetter, InterviewQuestionSet, ResumeSummary, SelectionProcess } from "../api/types";
import { candidateQuestionsPath, coverLettersPath, interviewQuestionsPath, jobResumesPath } from "../lib/jobAssistantPaths";
import { buildSummary, summaryProgress } from "../lib/jobSummary";
import { formatCost } from "../lib/costFormat";
import { STAGE_LABELS } from "../lib/processLabels";
import { useFromHere } from "../lib/backTarget";
import { useApiResource } from "../lib/useApiResource";
import { useJobCost } from "../lib/useJobCost";
import type { Job } from "../lib/useJobs";
import { ArrowRightIcon, ClipboardCheckIcon, CoinsIcon, EyeIcon, KanbanIcon } from "./icons";
import { JobNotes } from "./JobNotes";
import { JobSummaryStep } from "./JobSummaryStep";
import { LoadFailed } from "./LoadFailed";
import { Skeleton } from "./Skeleton";

type JobSummaryProps = {
	job: Job;
	process?: SelectionProcess;
	onAnalyze: () => void;
	onPreview: () => void;
	onResumes: () => void;
};

export function JobSummary({ job, process, onAnalyze, onPreview, onResumes }: JobSummaryProps) {
	const from = useFromHere();
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

	if (resumes.failed || letters.failed || questions.failed || doubts.failed) {
		return (
			<LoadFailed message="Não deu pra carregar o resumo desta vaga." onRetry={reload} />
		);
	}
	if (!resumes.data || !letters.data || !questions.data || !doubts.data) {
		return (
			<div role="status" aria-busy="true">
				<span className="sr-only">Carregando resumo...</span>
				<Skeleton width="100%" height={320} radius="var(--radius-lg)" />
			</div>
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
		<div className="job-summary-layout">
			<section className="panel panel-body job-summary-main" aria-label="Etapas da candidatura">
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
			</section>
			<div className="job-summary-side">
				<section className="panel job-summary-shortcuts" aria-label="Atalhos">
					<button type="button" className="job-summary-shortcut" onClick={onPreview}>
						<EyeIcon />
						<span>
							<strong>Vaga</strong>
							<small>Ver prévia da descrição</small>
						</span>
						<ArrowRightIcon />
					</button>
					<Link to={`/jobs/${job.id}/process`} className="job-summary-shortcut" state={from}>
						<KanbanIcon />
						<span>
							<strong>Processo seletivo</strong>
							<small>{process ? `${STAGE_LABELS[process.stage]} · acompanhar etapas e agenda` : "Cadastrar processo"}</small>
						</span>
						<ArrowRightIcon />
					</Link>
					<Link to={`/jobs/${job.id}/cost`} className="job-summary-shortcut" state={from}>
						<CoinsIcon />
						<span>
							<strong>Custo de IA</strong>
							<small>{spent ? `${spent} gastos até agora` : "Quanto cada etapa consumiu"}</small>
						</span>
						<ArrowRightIcon />
					</Link>
				</section>
				<section className="panel panel-body job-summary-notes" aria-labelledby="job-summary-notes-heading">
					<h2 id="job-summary-notes-heading">Notas da vaga</h2>
					<JobNotes jobId={job.id} />
				</section>
			</div>
		</div>
	);
}

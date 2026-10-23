import { Link } from "react-router-dom";
import type { CoverLetter, InterviewQuestionSet, CandidateQuestionSet, ResumeSummary } from "../api/types";
import { candidateQuestionsPath, coverLettersPath, interviewQuestionsPath, jobResumesPath } from "../lib/jobAssistantPaths";
import { buildSummary } from "../lib/jobSummary";
import { useApiResource } from "../lib/useApiResource";
import { Dialog } from "./Dialog";
import { CheckCircleIcon, CoinsIcon } from "./icons";
import { LoadFailed } from "./LoadFailed";
import { Skeleton } from "./Skeleton";

type JobSummaryDialogProps = {
	jobId: string;
	open: boolean;
	onClose: () => void;
	onOpenCost: () => void;
};

export function JobSummaryDialog({ jobId, open, onClose, onOpenCost }: JobSummaryDialogProps) {
	return (
		<Dialog open={open} title="Resumo da candidatura" onClose={onClose} size="medium">
			<div className="dialog-content">
				<JobSummary jobId={jobId} onNavigate={onClose} onOpenCost={onOpenCost} />
			</div>
		</Dialog>
	);
}

type JobSummaryProps = {
	jobId: string;
	onNavigate: () => void;
	onOpenCost: () => void;
};

function JobSummary({ jobId, onNavigate, onOpenCost }: JobSummaryProps) {
	const resumes = useApiResource<ResumeSummary[]>(jobResumesPath(jobId));
	const letters = useApiResource<CoverLetter[]>(coverLettersPath(jobId));
	const questions = useApiResource<InterviewQuestionSet[]>(interviewQuestionsPath(jobId));
	const doubts = useApiResource<CandidateQuestionSet[]>(candidateQuestionsPath(jobId));

	function reload() {
		resumes.reload();
		letters.reload();
		questions.reload();
		doubts.reload();
	}

	if (resumes.failed || letters.failed || questions.failed || doubts.failed) {
		return <LoadFailed message="Não deu pra carregar o resumo desta vaga." onRetry={reload} />;
	}
	if (!resumes.data || !letters.data || !questions.data || !doubts.data) {
		return (
			<div role="status" aria-busy="true">
				<span className="sr-only">Carregando resumo...</span>
				<Skeleton width="100%" height={280} radius="var(--radius-lg)" />
			</div>
		);
	}

	const steps = buildSummary({
		jobId,
		resumes: resumes.data,
		coverLetters: letters.data.length,
		interviewSets: questions.data.length,
		candidateSets: doubts.data.length,
	});

	return (
		<ol className="job-summary">
			{steps.map((step) => (
				<li key={step.key} className={`job-summary-step${step.done ? " job-summary-step-done" : ""}`}>
					<span className="job-summary-mark" aria-hidden="true">
						{step.done ? <CheckCircleIcon /> : <span className="job-summary-dot" />}
					</span>
					<div className="job-summary-body">
						<strong>{step.title}</strong>
						<span className="job-summary-detail">{step.detail}</span>
						<div className="job-summary-links">
							{step.links.map((link) => (
								<Link key={link.to + link.label} to={link.to} className="job-summary-link" onClick={onNavigate}>
									{link.label}
								</Link>
							))}
						</div>
					</div>
				</li>
			))}
			<li className="job-summary-step job-summary-step-done">
				<span className="job-summary-mark" aria-hidden="true">
					<CoinsIcon />
				</span>
				<div className="job-summary-body">
					<strong>Custo de IA</strong>
					<span className="job-summary-detail">Quanto cada etapa consumiu</span>
					<div className="job-summary-links">
						<button type="button" className="job-summary-link" onClick={onOpenCost}>
							Ver custo
						</button>
					</div>
				</div>
			</li>
		</ol>
	);
}

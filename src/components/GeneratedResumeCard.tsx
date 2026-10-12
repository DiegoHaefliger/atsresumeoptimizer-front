import { Link } from "react-router-dom";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { adaptedBaseTitle, generatedMeta } from "../lib/resumeLabels";
import { rewritePath } from "../lib/rewriteRoutes";
import { scoreTone } from "../lib/score";
import { ArrowRightIcon, ClipboardCheckIcon, DownloadIcon, EyeIcon, TrashIcon } from "./icons";

type GeneratedResumeCardProps = {
	resume: ResumeSummary;
	onPreview: (resume: ResumeSummary, version: ResumeVersionSummary) => void;
	onDownload: (resume: ResumeSummary, version: ResumeVersionSummary) => void;
	onDelete: (resume: ResumeSummary) => void;
};

export function GeneratedResumeCard({ resume, onPreview, onDownload, onDelete }: GeneratedResumeCardProps) {
	const version = resume.versions?.[0];
	const score = resume.atsScore;
	const baseTitle = adaptedBaseTitle(resume.title);
	return (
		<article className="generated-resume">
			<div className="generated-resume-main">
				<div className="generated-resume-score">
					{score != null ? (
						<>
							<span className={`job-card-score-value job-card-score-${scoreTone(score)}`}>{score}</span>
							<span className="job-card-score-track" aria-hidden="true">
								<span className={`job-card-score-fill job-card-score-${scoreTone(score)}`} style={{ width: `${score}%` }} />
							</span>
							<span className="generated-resume-score-label">Nota ATS</span>
						</>
					) : (
						<span className="job-card-score-empty">Sem nota</span>
					)}
				</div>
				<div className="generated-resume-text">
					<span className="generated-resume-source">A partir de</span>
					<h3 className="generated-resume-title">{baseTitle}</h3>
					<span className="generated-resume-meta">{generatedMeta(resume)}</span>
				</div>
			</div>
			<footer className="generated-resume-actions">
				{resume.sourceAnalysisId && (
					<Link to={rewritePath(resume.sourceAnalysisId, true)} className="button-link btn-small">
						Abrir currículo e apresentação <ArrowRightIcon />
					</Link>
				)}
				{version && (
					<>
						<button type="button" className="btn-secondary btn-small" onClick={() => onPreview(resume, version)}>
							<EyeIcon /> Prévia
						</button>
						<button type="button" className="btn-secondary btn-small" onClick={() => onDownload(resume, version)}>
							<DownloadIcon /> Baixar
						</button>
					</>
				)}
				{resume.sourceAnalysisId && (
					<Link to={`/analyses/${resume.sourceAnalysisId}`} className="button-link button-link-secondary btn-small">
						<ClipboardCheckIcon /> Ver análise
					</Link>
				)}
				<button
					type="button"
					className="btn-icon generated-resume-delete"
					onClick={() => onDelete(resume)}
					aria-label={`Excluir currículo gerado a partir de ${baseTitle}`}
					title="Excluir currículo gerado"
				>
					<TrashIcon />
				</button>
			</footer>
		</article>
	);
}

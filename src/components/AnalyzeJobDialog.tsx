import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import { startAnalysis } from "../lib/analysisApi";
import { jobLabel } from "../lib/jobCode";
import { initialSelection } from "../lib/resumeSelection";
import type { Job } from "../lib/useJobs";
import { useResumes } from "../lib/useResumes";
import { BusyLabel } from "./BusyLabel";
import { Dialog } from "./Dialog";
import { LoadFailed } from "./LoadFailed";
import { SavedResumePicker, type SavedResumeSelection } from "./SavedResumePicker";
import { StateMessage } from "./StateMessage";

type AnalyzeJobDialogProps = {
	job: Job | null;
	onClose: () => void;
};

export function AnalyzeJobDialog({ job, onClose }: AnalyzeJobDialogProps) {
	return (
		<Dialog
			open={job !== null}
			title={job ? `Analisar · ${jobLabel(job.code, job.title, null)}` : ""}
			onClose={onClose}
			size="medium"
		>
			{job?.id && <AnalyzeJob key={job.id} jobId={job.id} />}
		</Dialog>
	);
}

function AnalyzeJob({ jobId }: { jobId: string }) {
	const { resumes, failed: resumesFailed, reload: reloadResumes } = useResumes();
	const [chosen, setChosen] = useState<SavedResumeSelection | null>(null);
	const selection = chosen ?? (resumes ? initialSelection(resumes) : null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	async function analyze() {
		if (!selection) {
			setError("Escolhe um currículo primeiro.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			navigate(`/analyses/${await startAnalysis(selection, { jobId })}`);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra iniciar a análise. Tenta de novo."));
			setSubmitting(false);
		}
	}

	return (
		<div className="dialog-content analyze-dialog">
			<section className="analyze-dialog-section" aria-labelledby="analyze-job-resume">
				<h3 id="analyze-job-resume" className="analyze-dialog-title">
					Qual currículo comparar com a vaga?
				</h3>
				{resumesFailed ? (
					<LoadFailed message="Não deu pra carregar os currículos." onRetry={reloadResumes} />
				) : resumes !== null && resumes.length === 0 ? (
					<div className="empty-resumes">
						<p>Nenhum currículo cadastrado ainda.</p>
						<Link to="/resumes" className="button-link">
							Cadastrar currículo
						</Link>
					</div>
				) : (
					<SavedResumePicker resumes={resumes} selected={selection} onSelect={setChosen} />
				)}
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="form-actions">
					<button type="button" onClick={analyze} disabled={submitting || !selection} aria-busy={submitting}>
						<BusyLabel busy={submitting} busyText="Iniciando...">
							Analisar para esta vaga
						</BusyLabel>
					</button>
				</div>
			</section>
		</div>
	);
}

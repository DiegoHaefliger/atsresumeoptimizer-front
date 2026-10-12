import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import { startAnalysis } from "../lib/analysisApi";
import { useJobs, type Job } from "../lib/useJobs";
import { AnalysisModeChoice, type AnalysisKind } from "./AnalysisModeChoice";
import { BusyLabel } from "./BusyLabel";
import { Dialog } from "./Dialog";
import { JobList } from "./JobList";
import { JobPreviewDialog } from "./JobPreviewDialog";
import type { SavedResumeSelection } from "./SavedResumePicker";
import { StateMessage } from "./StateMessage";

export type ResumeToAnalyze = SavedResumeSelection & { title: string; version: number };

type AnalyzeResumeDialogProps = {
	resume: ResumeToAnalyze | null;
	onClose: () => void;
};

const JOBS_PAGE_SIZE = 5;

const SUBMIT_LABELS: Record<AnalysisKind, string> = {
	job: "Analisar para a vaga",
	general: "Fazer avaliação geral",
};

export function AnalyzeResumeDialog({ resume, onClose }: AnalyzeResumeDialogProps) {
	return (
		<Dialog
			open={resume !== null}
			title={resume ? `Analisar · ${resume.title} (versão ${resume.version})` : ""}
			onClose={onClose}
			size="medium"
		>
			{resume && <AnalyzeResume key={resume.versionId} resume={resume} />}
		</Dialog>
	);
}

function AnalyzeResume({ resume }: { resume: ResumeToAnalyze }) {
	const [kind, setKind] = useState<AnalysisKind>("job");
	const { jobs, failed: jobsFailed, reload: reloadJobs } = useJobs();
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const [previewingJob, setPreviewingJob] = useState<Job | null>(null);
	const [targetRole, setTargetRole] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	async function analyze() {
		if (kind === "job" && !selectedJobId) {
			setError("Escolhe uma vaga da lista. Sem vaga, use a avaliação geral.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const target = kind === "job" && selectedJobId ? { jobId: selectedJobId } : { targetRole: targetRole.trim() || undefined };
			navigate(`/analyses/${await startAnalysis(resume, target)}`);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra iniciar a análise. Tenta de novo."));
			setSubmitting(false);
		}
	}

	return (
		<div className="dialog-content analyze-dialog">
			<section className="analyze-dialog-section" aria-labelledby="analyze-resume-kind">
				<h3 id="analyze-resume-kind" className="analyze-dialog-title">
					Que tipo de análise?
				</h3>
				<AnalysisModeChoice value={kind} onChange={setKind} />
			</section>
			<section className="analyze-dialog-section" aria-labelledby="analyze-resume-target">
				<h3 id="analyze-resume-target" className="analyze-dialog-title">
					{kind === "job" ? "Escolha a vaga" : "Cargo-alvo (opcional)"}
				</h3>
				{kind === "job" ? (
					jobs !== null && jobs.length === 0 && !jobsFailed ? (
						<StateMessage variant="empty" layout="inline" message="Nenhuma vaga cadastrada. Cadastre pelo menu Vagas." />
					) : (
						<JobList
							jobs={jobs}
							failed={jobsFailed}
							onRetry={reloadJobs}
							pageSize={JOBS_PAGE_SIZE}
							selectedId={selectedJobId}
							onSelect={(job) => setSelectedJobId(job.id)}
							onPreview={setPreviewingJob}
						/>
					)
				) : (
					<label>
						<span className="sr-only">Cargo-alvo</span>
						<input
							value={targetRole}
							onChange={(event) => setTargetRole(event.target.value)}
							placeholder="Ex.: Desenvolvedor Backend Java"
						/>
						<span className="field-hint">
							Usado pra montar um perfil típico do cargo e orientar a reescrita depois. A nota continua sendo a da
							avaliação geral.
						</span>
					</label>
				)}
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="form-actions">
					<button type="button" onClick={analyze} disabled={submitting} aria-busy={submitting}>
						<BusyLabel busy={submitting} busyText="Iniciando...">
							{SUBMIT_LABELS[kind]}
						</BusyLabel>
					</button>
				</div>
			</section>
			<JobPreviewDialog job={previewingJob} onClose={() => setPreviewingJob(null)} />
		</div>
	);
}

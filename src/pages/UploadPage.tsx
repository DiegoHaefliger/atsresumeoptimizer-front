import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPostJson, errorMessage } from "../api/client";
import type { AnalysisCreatedResponse, ResumeSummary } from "../api/types";
import { AnalysisModeChoice, type AnalysisKind } from "../components/AnalysisModeChoice";
import { GeneralAnalysisAside } from "../components/GeneralAnalysisAside";
import { JobPreview } from "../components/JobPreview";
import { JobsTable } from "../components/JobsTable";
import { LoadFailed } from "../components/LoadFailed";
import { SavedResumePicker, type SavedResumeSelection } from "../components/SavedResumePicker";
import { BusyLabel } from "../components/BusyLabel";
import { StateMessage } from "../components/StateMessage";
import { splitByOrigin } from "../lib/resumeLabels";
import { useJobs, type Job } from "../lib/useJobs";
import { useResumes } from "../lib/useResumes";

const SUBMIT_LABELS: Record<AnalysisKind, string> = {
	job: "Analisar para a vaga",
	general: "Fazer avaliação geral",
};

export type UploadPageState = { resumeId?: string };

function initialSelection(resumes: ResumeSummary[], preferredResumeId?: string): SavedResumeSelection | null {
	const resume =
		resumes.find((candidate) => candidate.id === preferredResumeId) ?? splitByOrigin(resumes).base[0] ?? resumes[0];
	const versionId = resume?.versions?.[0]?.id;
	return resume?.id && versionId ? { resumeId: resume.id, versionId } : null;
}

export function UploadPage() {
	const location = useLocation();
	const preferredResumeId = (location.state as UploadPageState | null)?.resumeId;
	const { resumes: savedResumes, failed: resumesFailed, reload: reloadResumes } = useResumes();
	const [chosenResume, setChosenResume] = useState<SavedResumeSelection | null>(null);
	const savedResume = chosenResume ?? (savedResumes ? initialSelection(savedResumes, preferredResumeId) : null);
	const [kind, setKind] = useState<AnalysisKind>("job");
	const { jobs, failed: jobsFailed, reload: reloadJobs } = useJobs();
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const selectedJob = jobs?.find((job) => job.id === selectedJobId) ?? null;
	const [targetRole, setTargetRole] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();

	function analyzeSavedResume(selection: SavedResumeSelection, job: Job | null) {
		return apiPostJson<AnalysisCreatedResponse>(`/api/v1/resumes/${selection.resumeId}/analyses`, {
			resumeVersionId: selection.versionId,
			jobId: job?.id,
			targetRole: job ? undefined : targetRole.trim() || undefined,
		});
	}

	function validationError(): string | null {
		if (!savedResume) {
			return "Escolhe um dos currículos cadastrados primeiro.";
		}
		if (kind === "job" && !selectedJob) {
			return "Escolhe uma vaga da lista. Sem vaga, use a avaliação geral.";
		}
		return null;
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const invalid = validationError();
		if (invalid || !savedResume) {
			setError(invalid);
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const job = kind === "job" ? selectedJob : null;
			const created = await analyzeSavedResume(savedResume, job);
			navigate(`/analyses/${created.id}`);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra enviar o currículo. Tenta de novo."));
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Nova análise</span>
					<h1>Analisar currículo</h1>
					<p className="page-subtitle">
						Escolha o currículo e diga se quer compará-lo com uma vaga cadastrada ou só avaliar o currículo em si.
					</p>
				</div>
			</header>

			<div className="workspace-layout">
				<form onSubmit={handleSubmit} className="panel panel-body form">
					<section className="form-step" aria-labelledby="step-resume">
						<h2 id="step-resume" className="form-step-title">
							<span className="form-step-number">1</span> Currículo
						</h2>
						{resumesFailed ? (
							<LoadFailed message="Não deu pra carregar os currículos cadastrados." onRetry={reloadResumes} />
						) : savedResumes !== null && savedResumes.length === 0 ? (
							<div className="empty-resumes">
								<p>Nenhum currículo cadastrado ainda.</p>
								<Link to="/resumes" className="button-link">
									Cadastrar currículo
								</Link>
							</div>
						) : (
							<SavedResumePicker
								resumes={savedResumes}
								selected={savedResume}
								onSelect={setChosenResume}
							/>
						)}
					</section>

					<section className="form-step" aria-labelledby="step-kind">
						<h2 id="step-kind" className="form-step-title">
							<span className="form-step-number">2</span> Tipo de análise
						</h2>
						<AnalysisModeChoice value={kind} onChange={setKind} />
					</section>

					<section className="form-step" aria-labelledby="step-target">
						<h2 id="step-target" className="form-step-title">
							<span className="form-step-number">3</span>
							{kind === "job" ? "Escolha a vaga" : "Cargo-alvo (opcional)"}
						</h2>
						{kind === "job" ? (
							jobs !== null && jobs.length === 0 && !jobsFailed ? (
								<StateMessage
									variant="empty"
									layout="inline"
									message={
										<>
											Nenhuma vaga cadastrada. Cadastre pelo menu <Link to="/jobs">Vagas</Link>.
										</>
									}
								/>
							) : (
								<JobsTable
									jobs={jobs}
									failed={jobsFailed}
									onRetry={reloadJobs}
									selectedId={selectedJobId}
									onSelect={(job) => setSelectedJobId(job.id)}
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
					</section>

					{error && <StateMessage variant="error" layout="inline" message={error} />}

					<button type="submit" disabled={submitting} className="btn-block" aria-busy={submitting}>
						<BusyLabel busy={submitting} busyText="Enviando...">{SUBMIT_LABELS[kind]}</BusyLabel>
					</button>
				</form>
				<aside className="workspace-aside">
					{kind === "job" ? (
						<JobPreview job={selectedJob} />
					) : (
						<GeneralAnalysisAside />
					)}
				</aside>
			</div>
		</div>
	);
}

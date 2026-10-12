import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, errorMessage } from "../api/client";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { jobLabel } from "../lib/jobCode";
import { adaptedBaseTitle } from "../lib/resumeLabels";
import type { Job } from "../lib/useJobs";
import { ConfirmDialog } from "./ConfirmDialog";
import { Dialog } from "./Dialog";
import { GeneratedResumeCard } from "./GeneratedResumeCard";
import { ClipboardCheckIcon, FileTextIcon } from "./icons";
import { LoadFailed } from "./LoadFailed";
import { ResumeDownloadDialog } from "./ResumeDownloadDialog";
import { ResumeListSkeleton } from "./ResumeListSkeleton";
import { ResumePreviewDialog } from "./ResumePreviewDialog";
import { StateMessage } from "./StateMessage";

type JobResumesDialogProps = {
	job: Job | null;
	onClose: () => void;
	onAnalyze: (job: Job) => void;
};

type OpenVersion = { resume: ResumeSummary; version: ResumeVersionSummary };

export function JobResumesDialog({ job, onClose, onAnalyze }: JobResumesDialogProps) {
	return (
		<Dialog
			open={job !== null}
			title={`Currículos gerados · ${job ? jobLabel(job.code, job.title, null) : ""}`}
			onClose={onClose}
			size="medium"
		>
			<div className="dialog-content">{job && <JobResumes key={job.id} job={job} onAnalyze={onAnalyze} />}</div>
		</Dialog>
	);
}

function JobResumes({ job, onAnalyze }: { job: Job; onAnalyze: (job: Job) => void }) {
	const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
	const [failed, setFailed] = useState(false);
	const [previewing, setPreviewing] = useState<OpenVersion | null>(null);
	const [downloading, setDownloading] = useState<OpenVersion | null>(null);
	const [confirming, setConfirming] = useState<ResumeSummary | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(() => {
		apiGet<ResumeSummary[]>(`/api/v1/jobs/${job.id}/resumes`)
			.then((loaded) => {
				setFailed(false);
				setResumes(loaded);
			})
			.catch(() => setFailed(true));
	}, [job.id]);

	useEffect(load, [load]);

	async function remove(resume: ResumeSummary) {
		if (!resume.id) {
			return;
		}
		setDeleting(true);
		setError(null);
		try {
			await apiDelete(`/api/v1/resumes/${resume.id}`);
			setConfirming(null);
			load();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra excluir o currículo."));
		} finally {
			setDeleting(false);
		}
	}

	if (failed) {
		return <LoadFailed message="Não deu pra carregar os currículos gerados." onRetry={load} />;
	}
	if (resumes === null) {
		return <ResumeListSkeleton />;
	}
	if (resumes.length === 0) {
		return (
			<div className="generated-resumes-empty">
				<span className="generated-resumes-empty-icon" aria-hidden="true">
					<FileTextIcon />
				</span>
				<strong>Nenhum currículo gerado para esta vaga</strong>
				<p>Analise um currículo para esta vaga e use “Adaptar currículo” no resultado. A versão adaptada aparece aqui.</p>
				<button type="button" onClick={() => onAnalyze(job)}>
					<ClipboardCheckIcon /> Analisar esta vaga
				</button>
			</div>
		);
	}

	return (
		<div className="generated-resumes">
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{resumes.map((resume) => (
				<GeneratedResumeCard
					key={resume.id}
					resume={resume}
					onPreview={(item, version) => setPreviewing({ resume: item, version })}
					onDownload={(item, version) => setDownloading({ resume: item, version })}
					onDelete={setConfirming}
				/>
			))}
			<ConfirmDialog
				open={confirming !== null}
				title="Excluir currículo gerado?"
				confirmLabel="Excluir"
				busy={deleting}
				onConfirm={() => confirming && remove(confirming)}
				onCancel={() => setConfirming(null)}
			>
				<p>
					O currículo adaptado a partir de {adaptedBaseTitle(confirming?.title)} e todas as versões dele serão
					excluídos. O currículo base e a análise continuam. Não dá pra desfazer.
				</p>
			</ConfirmDialog>
			{previewing && (
				<ResumePreviewDialog resume={previewing.resume} version={previewing.version} onClose={() => setPreviewing(null)} />
			)}
			{downloading && (
				<ResumeDownloadDialog
					resume={downloading.resume}
					version={downloading.version}
					onClose={() => setDownloading(null)}
				/>
			)}
		</div>
	);
}

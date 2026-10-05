import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import type { ResumeSummary, ResumeVersionSummary } from "../api/types";
import { resumeMeta, versionLabel } from "../lib/resumeLabels";
import { DownloadIcon, EyeIcon, FileTextIcon, PencilIcon, SpinnerIcon, StarIcon, TrashIcon } from "./icons";
import { Badge } from "./Badge";
import { LoadFailed } from "./LoadFailed";
import { ResumeDownloadDialog } from "./ResumeDownloadDialog";
import { ResumePreviewDialog } from "./ResumePreviewDialog";
import { ResumeListSkeleton } from "./ResumeListSkeleton";
import { StateMessage } from "./StateMessage";

type ResumeLibraryProps = {
	resumes: ResumeSummary[] | null;
	failed: boolean;
	onRetry: () => void;
	onDelete: (resumeId: string) => Promise<void>;
	onDeleteVersion: (resumeId: string, versionId: string) => Promise<void>;
	emptyMessage: string;
	onToggleFavorite?: (resumeId: string, favorite: boolean) => Promise<void>;
};

type Previewing = { resume: ResumeSummary; version: ResumeVersionSummary };

export function ResumeLibrary({
	resumes,
	failed,
	onRetry,
	onDelete,
	onDeleteVersion,
	emptyMessage,
	onToggleFavorite,
}: ResumeLibraryProps) {
	const [confirmingId, setConfirmingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [previewing, setPreviewing] = useState<Previewing | null>(null);
	const [downloading, setDownloading] = useState<Previewing | null>(null);
	const [selectedVersionIds, setSelectedVersionIds] = useState<Record<string, string>>({});
	const navigate = useNavigate();

	function selectedVersion(resume: ResumeSummary): ResumeVersionSummary | undefined {
		const versions = resume.versions ?? [];
		const selectedId = resume.id ? selectedVersionIds[resume.id] : undefined;
		return versions.find((version) => version.id === selectedId) ?? versions[0];
	}

	function selectVersion(resume: ResumeSummary, versionId: string) {
		const resumeId = resume.id;
		if (resumeId) {
			setSelectedVersionIds((current) => ({ ...current, [resumeId]: versionId }));
			setConfirmingId(null);
		}
	}

	function edit(resume: ResumeSummary) {
		const versionId = selectedVersion(resume)?.id;
		if (resume.id && versionId) {
			navigate(`/resumes/${resume.id}/edit?version=${versionId}`);
		}
	}

	async function toggleFavorite(resume: ResumeSummary) {
		if (!resume.id || !onToggleFavorite) {
			return;
		}
		setError(null);
		try {
			await onToggleFavorite(resume.id, !resume.favorite);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra atualizar o favorito."));
		}
	}

	async function confirmDelete(resume: ResumeSummary) {
		const resumeId = resume.id;
		const version = selectedVersion(resume);
		if (!resumeId || !version?.id) {
			return;
		}
		setDeletingId(resumeId);
		setError(null);
		try {
			if ((resume.versions ?? []).length > 1) {
				await onDeleteVersion(resumeId, version.id);
			} else {
				await onDelete(resumeId);
			}
		} catch (err) {
			setError(errorMessage(err, "Não deu pra excluir o currículo."));
		} finally {
			setDeletingId(null);
			setConfirmingId(null);
		}
	}

	if (failed) {
		return <LoadFailed message="Não deu pra carregar os currículos." onRetry={onRetry} />;
	}

	if (resumes === null) {
		return <ResumeListSkeleton />;
	}

	if (resumes.length === 0) {
		return <StateMessage variant="empty" layout="inline" message={emptyMessage} />;
	}

	const canFavorite = onToggleFavorite !== undefined && resumes.length > 1;

	return (
		<div className="saved-resumes saved-resumes-library">
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{resumes.map((resume) => {
				const versions = resume.versions ?? [];
				const version = selectedVersion(resume);
				const hasManyVersions = versions.length > 1;
				return (
					<div key={resume.id} className="saved-resume-card">
						<div className="saved-resume-row">
							<span className="saved-resume-option">
								<FileTextIcon />
								<span className="saved-resume-text">
									<span className="saved-resume-title">{resume.title}</span>
									<span className="saved-resume-meta">{resumeMeta(resume)}</span>
									{resume.sourceAnalysisId && (
										<Link to={`/analyses/${resume.sourceAnalysisId}`} className="link saved-resume-meta">
											Ver análise de origem
										</Link>
									)}
								</span>
								{resume.favorite && <Badge tone="info">Favorito</Badge>}
							</span>
							{resume.id && confirmingId !== resume.id && (
								<div className="saved-resume-actions">
									{canFavorite && (
										<button
											type="button"
											className="btn-icon"
											onClick={() => toggleFavorite(resume)}
											aria-pressed={resume.favorite ?? false}
											aria-label={resume.favorite ? `Desmarcar ${resume.title} como favorito` : `Marcar ${resume.title} como favorito`}
											title={resume.favorite ? "Desmarcar favorito" : "Marcar como favorito"}
										>
											<StarIcon filled={resume.favorite ?? false} />
										</button>
									)}
									<button
										type="button"
										className="btn-icon"
										onClick={() => version && setPreviewing({ resume, version })}
										aria-label={`Ver prévia de ${resume.title}`}
										title="Ver prévia"
									>
										<EyeIcon />
									</button>
									<button
										type="button"
										className="btn-icon"
										onClick={() => version && setDownloading({ resume, version })}
										aria-label={`Baixar ${resume.title}`}
										title="Baixar currículo"
									>
										<DownloadIcon />
									</button>
									<button
										type="button"
										className="btn-icon"
										onClick={() => edit(resume)}
										aria-label={`Editar ${resume.title}`}
										title="Editar currículo"
									>
										<PencilIcon />
									</button>
									<button
										type="button"
										className="btn-icon"
										onClick={() => setConfirmingId(resume.id ?? null)}
										aria-label={`Excluir ${resume.title}`}
										title={hasManyVersions ? "Excluir versão" : "Excluir currículo"}
									>
										<TrashIcon />
									</button>
								</div>
							)}
						</div>
						{resume.id && hasManyVersions && version && (
							<label className="saved-resume-version">
								Versão
								<select
									value={version.id}
									onChange={(event) => selectVersion(resume, event.target.value)}
								>
									{versions.map((option) => (
										<option key={option.id} value={option.id}>
											{versionLabel(option)}
										</option>
									))}
								</select>
							</label>
						)}
						{resume.id && confirmingId === resume.id && (
							<div className="saved-resume-confirm" role="alert">
								<span>
									{hasManyVersions && version
										? `Excluir a ${versionLabel(version)}? Não dá pra desfazer.`
										: "Excluir esse currículo? Não dá pra desfazer."}
								</span>
								<div className="saved-resume-confirm-actions">
									<button
										type="button"
										className="btn-secondary btn-small"
										onClick={() => setConfirmingId(null)}
										disabled={deletingId === resume.id}
									>
										Cancelar
									</button>
									<button
										type="button"
										className="btn-danger btn-small"
										onClick={() => confirmDelete(resume)}
										disabled={deletingId === resume.id}
										aria-busy={deletingId === resume.id}
									>
										{deletingId === resume.id ? <SpinnerIcon /> : <TrashIcon />} Excluir
									</button>
								</div>
							</div>
						)}
					</div>
				);
			})}
			{downloading && (
				<ResumeDownloadDialog
					resume={downloading.resume}
					version={downloading.version}
					onClose={() => setDownloading(null)}
				/>
			)}
			{previewing && (
				<ResumePreviewDialog
					resume={previewing.resume}
					version={previewing.version}
					onClose={() => setPreviewing(null)}
				/>
			)}
		</div>
	);
}

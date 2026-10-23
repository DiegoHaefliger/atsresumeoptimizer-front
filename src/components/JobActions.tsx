import type { Job } from "../lib/useJobs";
import { EyeIcon, FileTextIcon, ListChecksIcon, PencilIcon, SpinnerIcon, TrashIcon } from "./icons";

export type JobActionHandlers = {
	onAnalyze?: (job: Job) => void;
	onPreview?: (job: Job) => void;
	onResumes?: (job: Job) => void;
	onSummary?: (job: Job) => void;
	onEdit?: (job: Job) => void;
	onRemove?: (job: Job) => void;
};

type JobActionsProps = JobActionHandlers & {
	job: Job;
	removing: boolean;
};

export function JobActions({ job, removing, onPreview, onResumes, onSummary, onEdit, onRemove }: JobActionsProps) {
	const name = job.title ?? "vaga";
	return (
		<div className="job-actions">
			{onPreview && (
				<button type="button" className="btn-icon" aria-label={`Ver prévia de ${name}`} title="Ver prévia" onClick={() => onPreview(job)}>
					<EyeIcon />
				</button>
			)}
			{onResumes && (
				<button
					type="button"
					className="btn-icon"
					aria-label={`Ver currículos gerados para ${name}`}
					title="Currículos gerados para esta vaga"
					onClick={() => onResumes(job)}
				>
					<FileTextIcon />
				</button>
			)}
			{onSummary && (
				<button
					type="button"
					className="btn-icon"
					aria-label={`Resumo da candidatura de ${name}`}
					title="Resumo da candidatura"
					onClick={() => onSummary(job)}
				>
					<ListChecksIcon />
				</button>
			)}
			{onEdit && (
				<button type="button" className="btn-icon" aria-label={`Editar ${name}`} title="Editar vaga" onClick={() => onEdit(job)}>
					<PencilIcon />
				</button>
			)}
			{onRemove && (
				<button
					type="button"
					className="btn-icon job-actions-remove"
					aria-label={`Remover ${name} da lista`}
					title="Remover da lista"
					disabled={removing}
					onClick={() => onRemove(job)}
				>
					{removing ? <SpinnerIcon /> : <TrashIcon />}
				</button>
			)}
		</div>
	);
}

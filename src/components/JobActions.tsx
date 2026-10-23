import type { Job } from "../lib/useJobs";
import { EyeIcon, FileTextIcon, KanbanIcon, ListChecksIcon, NotebookIcon, PencilIcon, SparklesIcon, SpinnerIcon, TrashIcon } from "./icons";

export type JobActionHandlers = {
	onAnalyze?: (job: Job) => void;
	onPreview?: (job: Job) => void;
	onResumes?: (job: Job) => void;
	onAssistant?: (job: Job) => void;
	onNotes?: (job: Job) => void;
	onSummary?: (job: Job) => void;
	onProcess?: (job: Job) => void;
	onEdit?: (job: Job) => void;
	onRemove?: (job: Job) => void;
};

type JobActionsProps = JobActionHandlers & {
	job: Job;
	removing: boolean;
};

export function JobActions({ job, removing, onPreview, onResumes, onAssistant, onNotes, onSummary, onProcess, onEdit, onRemove }: JobActionsProps) {
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
			{onAssistant && (
				<button
					type="button"
					className="btn-icon"
					aria-label={`Assistente de IA para ${name}`}
					title="Assistente de IA: perguntas técnicas e apresentação"
					onClick={() => onAssistant(job)}
				>
					<SparklesIcon />
				</button>
			)}
			{onNotes && (
				<button type="button" className="btn-icon" aria-label={`Notas de ${name}`} title="Notas da vaga" onClick={() => onNotes(job)}>
					<NotebookIcon />
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
			{onProcess && (
				<button type="button" className="btn-icon" aria-label={`Processo seletivo de ${name}`} title="Processo seletivo" onClick={() => onProcess(job)}>
					<KanbanIcon />
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

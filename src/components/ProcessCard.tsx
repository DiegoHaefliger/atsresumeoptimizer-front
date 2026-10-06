import { Link } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import { formatDate } from "../lib/processLabels";
import { ArrowRightIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from "./icons";

type ProcessCardProps = {
	process: SelectionProcess;
	onMove: (process: SelectionProcess) => void;
	onRemove: (process: SelectionProcess) => void;
};

export function ProcessCard({ process, onMove, onRemove }: ProcessCardProps) {
	return (
		<article className="process-card">
			<h3 className="process-card-title">{process.jobTitle}</h3>
			<span className="process-card-company">{process.company}</span>
			<div className="process-card-links">
				{process.jobUrl && (
					<a href={process.jobUrl} target="_blank" rel="noopener noreferrer" className="link">
						Vaga <ExternalLinkIcon />
					</a>
				)}
				{process.processUrl && (
					<a href={process.processUrl} target="_blank" rel="noopener noreferrer" className="link">
						Processo <ExternalLinkIcon />
					</a>
				)}
			</div>
			{process.nextStepOn && <span className="process-card-meta">Próxima etapa em {formatDate(process.nextStepOn)}</span>}
			{process.appliedOn && <span className="process-card-meta">Candidatura em {formatDate(process.appliedOn)}</span>}
			<div className="process-card-actions">
				<button type="button" className="btn-secondary btn-small" onClick={() => onMove(process)}>
					Mover etapa <ArrowRightIcon />
				</button>
				<Link
					to={`/processes/${process.id}/edit`}
					className="btn-icon"
					aria-label={`Editar ${process.jobTitle}`}
					title="Editar"
				>
					<PencilIcon />
				</Link>
				<button
					type="button"
					className="btn-icon"
					aria-label={`Remover ${process.jobTitle}`}
					title="Remover"
					onClick={() => onRemove(process)}
				>
					<TrashIcon />
				</button>
			</div>
		</article>
	);
}

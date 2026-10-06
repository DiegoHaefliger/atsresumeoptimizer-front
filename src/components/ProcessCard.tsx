import { Link } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import { formatDate } from "../lib/processLabels";
import { StageBadge } from "./StageBadge";
import { ArrowRightIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from "./icons";

type ProcessCardProps = {
	process: SelectionProcess;
	onMove: (process: SelectionProcess) => void;
	onRemove: (process: SelectionProcess) => void;
};

export function ProcessCard({ process, onMove, onRemove }: ProcessCardProps) {
	const label = process.company ?? "processo";
	return (
		<article className="process-card">
			<div className="process-card-main">
				<StageBadge stage={process.stage} />
				{process.processUrl && (
					<a href={process.processUrl} target="_blank" rel="noopener noreferrer" className="link process-card-link">
						Processo seletivo <ExternalLinkIcon />
					</a>
				)}
				{process.appliedOn && <span className="process-card-meta">Candidatura em {formatDate(process.appliedOn)}</span>}
				{process.nextStepOn && <span className="process-card-meta">Próxima etapa em {formatDate(process.nextStepOn)}</span>}
				{process.contactName && <span className="process-card-meta">Contato: {process.contactName}</span>}
			</div>
			<div className="process-card-actions">
				<button type="button" className="process-action" onClick={() => onMove(process)}>
					Mover etapa <ArrowRightIcon />
				</button>
				<Link to={`/processes/${process.id}/edit`} className="process-action process-action-icon" aria-label={`Editar processo de ${label}`} title="Editar">
					<PencilIcon />
				</Link>
				<button
					type="button"
					className="process-action process-action-icon"
					aria-label={`Remover processo de ${label}`}
					title="Remover"
					onClick={() => onRemove(process)}
				>
					<TrashIcon />
				</button>
			</div>
		</article>
	);
}

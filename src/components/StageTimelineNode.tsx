import type { ReactNode } from "react";
import type { SelectionStage, StageMovement } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import type { StageNode } from "../lib/stageTimeline";

type StageTimelineNodeProps = {
	node: StageNode;
	currentStage: SelectionStage;
	canDelete: boolean;
	onPick?: (stage: SelectionStage) => void;
	onDelete: (movement: StageMovement) => void;
	children: ReactNode;
};

function stayLabel(node: StageNode): string | null {
	if (node.daysInStage === null) {
		return null;
	}
	if (node.current) {
		return node.daysInStage === 0 ? "desde hoje" : `há ${node.daysInStage} ${node.daysInStage === 1 ? "dia" : "dias"} nesta etapa`;
	}
	return node.daysInStage === 0 ? "menos de 1 dia" : `durou ${node.daysInStage} ${node.daysInStage === 1 ? "dia" : "dias"}`;
}

export function StageTimelineNode({ node, currentStage, canDelete, onPick, onDelete, children }: StageTimelineNodeProps) {
	const stay = stayLabel(node);
	const header = (
		<>
			<strong>{STAGE_LABELS[node.stage]}</strong>
			<span className="stage-node-meta">
				{node.movement ? formatDateTime(node.movement.movedAt) : formatDateTime(node.at)}
				{stay && ` · ${stay}`}
			</span>
			{node.movement?.stageAt && <span className="stage-node-meta">Etapa em {formatDateTime(node.movement.stageAt)}</span>}
		</>
	);

	return (
		<li className={`stage-node${node.current ? " stage-node-current" : ""}${node.movement ? "" : " stage-node-implicit"}`}>
			<span className="stage-node-marker" aria-hidden="true" />
			<div className="stage-node-card">
				{node.movement ? (
					<details className="stage-node-details">
						<summary>{header}</summary>
						<p className="process-history-note">{node.movement.note ?? "Sem anotação."}</p>
						<div className="process-history-actions">
							{onPick && node.stage !== currentStage && (
								<button type="button" className="btn-secondary btn-small" onClick={() => onPick(node.stage)}>
									Voltar para esta etapa
								</button>
							)}
							{canDelete && (
								<button
									type="button"
									className="btn-secondary btn-small"
									onClick={() => node.movement && onDelete(node.movement)}
								>
									Excluir etapa
								</button>
							)}
						</div>
					</details>
				) : (
					<div className="stage-node-header">{header}</div>
				)}
				{node.schedules.length > 0 && <ul className="stage-node-schedules">{children}</ul>}
			</div>
		</li>
	);
}

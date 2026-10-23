import type { ReactNode } from "react";
import type { SelectionStage, StageMovement } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import type { StageNode } from "../lib/stageTimeline";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

type StageTimelineNodeProps = {
	node: StageNode;
	currentStage: SelectionStage;
	canDelete: boolean;
	expanded: boolean;
	onToggle: () => void;
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

export function StageTimelineNode({ node, currentStage, canDelete, expanded, onToggle, onPick, onDelete, children }: StageTimelineNodeProps) {
	const stay = stayLabel(node);
	const moment = formatDateTime(node.movement ? node.movement.movedAt : node.at);
	const done = node.movement !== null && !node.current;
	const status = done ? "Etapa concluída" : node.current ? "Etapa atual" : "Etapa sem registro de entrada";
	const marker = (
		<span className={`stage-node-marker${done ? " stage-node-marker-done" : ""}`} title={status}>
			<span className="sr-only">{status}</span>
		</span>
	);
	const scheduleCount = node.schedules.length;
	const hints = [
		scheduleCount > 0 ? `${scheduleCount} ${scheduleCount === 1 ? "agendamento" : "agendamentos"}` : null,
		node.movement?.note ? "anotação" : null,
	].filter((hint): hint is string => hint !== null);
	const itemClass = `stage-node${node.current ? " stage-node-current" : ""}${node.movement ? "" : " stage-node-implicit"}`;

	if (!expanded) {
		return (
			<li className={itemClass}>
				{marker}
				<button type="button" className="stage-node-collapsed" aria-expanded="false" onClick={onToggle}>
					<strong>{STAGE_LABELS[node.stage]}</strong>
					<span className="stage-node-meta">{moment}</span>
					{hints.length > 0 && <span className="stage-node-hint">{hints.join(" · ")}</span>}
					<ChevronDownIcon />
				</button>
			</li>
		);
	}

	return (
		<li className={itemClass}>
			{marker}
			<div className="stage-node-card">
				<button type="button" className="stage-node-collapsed stage-node-title" aria-expanded="true" onClick={onToggle}>
					<span className="stage-node-title-row">
						<strong>{STAGE_LABELS[node.stage]}</strong>
						<ChevronUpIcon />
					</span>
					<span className="stage-node-meta">
						{moment}
						{stay && ` · ${stay}`}
					</span>
					{node.movement?.stageAt && <span className="stage-node-meta">Etapa em {formatDateTime(node.movement.stageAt)}</span>}
				</button>
				{node.movement && (
					<>
						{node.movement.note && <p className="process-history-note">{node.movement.note}</p>}
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
					</>
				)}
				{node.schedules.length > 0 && <ul className="stage-node-schedules">{children}</ul>}
			</div>
		</li>
	);
}

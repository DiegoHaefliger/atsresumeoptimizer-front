import type { SelectionProcess } from "../api/types";
import { STAGE_LABELS, STAGES, stageTone } from "../lib/processLabels";
import { Badge } from "./Badge";
import { ProcessCard } from "./ProcessCard";

type ProcessBoardProps = {
	processes: SelectionProcess[];
	onMove: (process: SelectionProcess) => void;
	onRemove: (process: SelectionProcess) => void;
};

export function ProcessBoard({ processes, onMove, onRemove }: ProcessBoardProps) {
	return (
		<div className="process-board">
			{STAGES.map((stage) => {
				const inStage = processes.filter((process) => process.stage === stage);
				return (
					<section key={stage} className="process-column" aria-label={STAGE_LABELS[stage]}>
						<header className="process-column-header">
							<Badge tone={stageTone(stage)}>{STAGE_LABELS[stage]}</Badge>
							<span className="process-column-count">{inStage.length}</span>
						</header>
						{inStage.map((process) => (
							<ProcessCard key={process.id} process={process} onMove={onMove} onRemove={onRemove} />
						))}
					</section>
				);
			})}
		</div>
	);
}

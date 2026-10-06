import type { SelectionProcess, SelectionStage } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { useApiResource } from "../lib/useApiResource";
import { PROCESSES_PATH } from "../lib/useProcesses";

type ProcessHistoryProps = {
	processId: string;
	currentStage: SelectionStage;
	onPick?: (stage: SelectionStage) => void;
};

export function ProcessHistory({ processId, currentStage, onPick }: ProcessHistoryProps) {
	const { data: detail } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	return (
		<>
			<h3 className="process-history-title">Histórico</h3>
			<ol className="process-history">
				{[...(detail?.history ?? [])].reverse().map((movement) => (
					<li key={`${movement.movedAt}-${movement.stage}`}>
						<details className="process-history-item">
							<summary>
								<strong>{STAGE_LABELS[movement.stage]}</strong>
								<span className="process-history-date">{formatDateTime(movement.movedAt)}</span>
							</summary>
							<p className="process-history-note">{movement.note ?? "Sem anotação."}</p>
							{onPick && movement.stage !== currentStage && (
								<button type="button" className="btn-secondary btn-small" onClick={() => onPick(movement.stage)}>
									Voltar para esta etapa
								</button>
							)}
						</details>
					</li>
				))}
			</ol>
		</>
	);
}

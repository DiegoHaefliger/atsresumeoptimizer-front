import { useState } from "react";
import { apiDelete, errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage, StageMovement } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { useApiResource } from "../lib/useApiResource";
import { PROCESSES_PATH } from "../lib/useProcesses";
import { ConfirmDialog } from "./ConfirmDialog";
import { StateMessage } from "./StateMessage";

type ProcessHistoryProps = {
	processId: string;
	currentStage: SelectionStage;
	onPick?: (stage: SelectionStage) => void;
};

export function ProcessHistory({ processId, currentStage, onPick }: ProcessHistoryProps) {
	const { data: detail, reload } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	const [confirming, setConfirming] = useState<StageMovement | null>(null);
	const [removing, setRemoving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const movements = [...(detail?.history ?? [])].reverse();

	async function remove(movement: StageMovement) {
		setError(null);
		setRemoving(true);
		try {
			await apiDelete(`${PROCESSES_PATH}/${processId}/history/${movement.id}`);
			setConfirming(null);
			reload();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra excluir a etapa. Tenta de novo."));
		} finally {
			setRemoving(false);
		}
	}

	return (
		<>
			<h3 className="process-history-title">Histórico</h3>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<ol className="process-history">
				{movements.map((movement, index) => (
					<li key={movement.id}>
						<details className="process-history-item">
							<summary>
								<strong>{STAGE_LABELS[movement.stage]}</strong>
								<span className="process-history-date">{formatDateTime(movement.movedAt)}</span>
							</summary>
							<p className="process-history-note">{movement.note ?? "Sem anotação."}</p>
							<div className="process-history-actions">
								{onPick && movement.stage !== currentStage && (
									<button type="button" className="btn-secondary btn-small" onClick={() => onPick(movement.stage)}>
										Voltar para esta etapa
									</button>
								)}
								{index > 0 && (
									<button type="button" className="btn-secondary btn-small" onClick={() => setConfirming(movement)}>
										Excluir etapa
									</button>
								)}
							</div>
						</details>
					</li>
				))}
			</ol>
			<ConfirmDialog
				open={confirming !== null}
				title="Excluir etapa do histórico?"
				confirmLabel="Excluir etapa"
				busy={removing}
				onConfirm={() => confirming && remove(confirming)}
				onCancel={() => setConfirming(null)}
			>
				<p>
					A etapa <strong>{confirming ? STAGE_LABELS[confirming.stage] : ""}</strong> sai do histórico do processo. Não dá
					pra desfazer.
				</p>
			</ConfirmDialog>
		</>
	);
}

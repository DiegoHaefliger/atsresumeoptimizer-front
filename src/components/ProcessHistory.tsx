import { useState } from "react";
import { apiDelete, errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { useApiResource } from "../lib/useApiResource";
import { PROCESSES_PATH } from "../lib/useProcesses";
import { StateMessage } from "./StateMessage";

type ProcessHistoryProps = {
	processId: string;
	currentStage: SelectionStage;
	onPick?: (stage: SelectionStage) => void;
};

export function ProcessHistory({ processId, currentStage, onPick }: ProcessHistoryProps) {
	const { data: detail, reload } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	const [confirming, setConfirming] = useState<string | null>(null);
	const [removing, setRemoving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const movements = [...(detail?.history ?? [])].reverse();

	async function remove(movementId: string) {
		setError(null);
		setRemoving(true);
		try {
			await apiDelete(`${PROCESSES_PATH}/${processId}/history/${movementId}`);
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
								{index > 0 &&
									(confirming === movement.id ? (
										<>
											<span className="process-history-confirm">
												Excluir a etapa {STAGE_LABELS[movement.stage]} do histórico?
											</span>
											<button type="button" className="btn-secondary btn-small" onClick={() => setConfirming(null)} disabled={removing}>
												Cancelar
											</button>
											<button type="button" className="btn-danger btn-small" onClick={() => remove(movement.id)} disabled={removing} aria-busy={removing}>
												Excluir
											</button>
										</>
									) : (
										<button type="button" className="btn-secondary btn-small" onClick={() => setConfirming(movement.id)}>
											Excluir etapa
										</button>
									))}
							</div>
						</details>
					</li>
				))}
			</ol>
		</>
	);
}

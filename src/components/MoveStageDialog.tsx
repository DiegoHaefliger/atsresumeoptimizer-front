import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { formatDateTime, STAGE_LABELS, STAGES } from "../lib/processLabels";
import { useApiResource } from "../lib/useApiResource";
import { PROCESSES_PATH } from "../lib/useProcesses";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { Dialog } from "./Dialog";
import { StateMessage } from "./StateMessage";

type MoveStageDialogProps = {
	process: SelectionProcess | null;
	onClose: () => void;
	onMove: (processId: string, stage: SelectionStage, note: string) => Promise<void>;
};

export function MoveStageDialog({ process, onClose, onMove }: MoveStageDialogProps) {
	return (
		<Dialog open={process !== null} title={process ? [process.jobTitle, process.company].filter(Boolean).join(" · ") || "Processo seletivo" : ""} onClose={onClose}>
			{process && <MoveStageForm key={process.id} process={process} onClose={onClose} onMove={onMove} />}
		</Dialog>
	);
}

type MoveStageFormProps = {
	process: SelectionProcess;
	onClose: () => void;
	onMove: MoveStageDialogProps["onMove"];
};

function MoveStageForm({ process, onClose, onMove }: MoveStageFormProps) {
	const [stage, setStage] = useState<SelectionStage>(process.stage);
	const [note, setNote] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: detail } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${process.id}`);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onMove(process.id, stage, note);
			onClose();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra mudar a etapa. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<div className="dialog-content">
			<form onSubmit={handleSubmit} className="form">
				<label>
					Etapa atual: {STAGE_LABELS[process.stage]}. Mover para
					<select value={stage} onChange={(event) => setStage(event.target.value as SelectionStage)} disabled={saving}>
						{STAGES.map((option) => (
							<option key={option} value={option}>
								{STAGE_LABELS[option]}
							</option>
						))}
					</select>
				</label>
				<label>
					Anotação (opcional)
					<AutoGrowTextarea
						value={note}
						onChange={(event) => setNote(event.target.value)}
						rows={3}
						maxLength={2000}
						placeholder="Ex.: entrevista marcada para sexta, 14h"
						disabled={saving}
					/>
				</label>
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="dialog-actions">
					<button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
						Cancelar
					</button>
					<button type="submit" disabled={saving || stage === process.stage} aria-busy={saving}>
						Mover etapa
					</button>
				</div>
			</form>
			<h3 className="process-history-title">Histórico</h3>
			<ol className="process-history">
				{[...(detail?.history ?? [])].reverse().map((movement) => (
					<li key={`${movement.movedAt}-${movement.stage}`}>
						<strong>{STAGE_LABELS[movement.stage]}</strong>
						<span className="process-history-date">{formatDateTime(movement.movedAt)}</span>
						{movement.note && <span className="process-history-note">{movement.note}</span>}
					</li>
				))}
			</ol>
		</div>
	);
}

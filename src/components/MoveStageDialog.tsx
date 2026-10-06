import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { jobLabel } from "../lib/jobCode";
import { STAGE_LABELS, STAGES } from "../lib/processLabels";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { Dialog } from "./Dialog";
import { ProcessHistory } from "./ProcessHistory";
import { StateMessage } from "./StateMessage";

type MoveStageDialogProps = {
	process: SelectionProcess | null;
	onClose: () => void;
	onMove: (processId: string, stage: SelectionStage, note: string, scheduledAt: string) => Promise<void>;
};

export function MoveStageDialog({ process, onClose, onMove }: MoveStageDialogProps) {
	return (
		<Dialog open={process !== null} title={process ? jobLabel(process.jobCode, process.jobTitle, process.company) : ""} onClose={onClose}>
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
	const [scheduledAt, setScheduledAt] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onMove(process.id, stage, note, scheduledAt);
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
					Data e hora da etapa (opcional)
					<input
						type="datetime-local"
						value={scheduledAt}
						onChange={(event) => setScheduledAt(event.target.value)}
						disabled={saving}
					/>
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
			<ProcessHistory processId={process.id} currentStage={process.stage} onPick={saving ? undefined : setStage} />
		</div>
	);
}

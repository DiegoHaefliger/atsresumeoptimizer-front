import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionStage } from "../api/types";
import { STAGE_LABELS, STAGES } from "../lib/processLabels";
import type { ScheduleDraft } from "../lib/scheduleDraft";
import { useScheduleConflicts } from "../lib/useScheduleConflicts";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { ConflictWarning } from "./ConflictWarning";
import { Dialog } from "./Dialog";
import { StateMessage } from "./StateMessage";

const MAX_DURATION_MINUTES = 1440;

type ScheduleDialogProps = {
	title: string;
	initial: ScheduleDraft | null;
	ignoreScheduleId?: string;
	onClose: () => void;
	onSave: (draft: ScheduleDraft) => Promise<void>;
};

export function ScheduleDialog({ title, initial, ignoreScheduleId, onClose, onSave }: ScheduleDialogProps) {
	return (
		<Dialog open={initial !== null} title={title} onClose={onClose}>
			{initial && <ScheduleForm initial={initial} ignoreScheduleId={ignoreScheduleId} onClose={onClose} onSave={onSave} />}
		</Dialog>
	);
}

type ScheduleFormProps = {
	initial: ScheduleDraft;
	ignoreScheduleId?: string;
	onClose: () => void;
	onSave: ScheduleDialogProps["onSave"];
};

function ScheduleForm({ initial, ignoreScheduleId, onClose, onSave }: ScheduleFormProps) {
	const [draft, setDraft] = useState<ScheduleDraft>(initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const conflicts = useScheduleConflicts(draft.scheduledAt, draft.durationMinutes, ignoreScheduleId);

	function update<K extends keyof ScheduleDraft>(field: K, value: ScheduleDraft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onSave(draft);
			onClose();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar o agendamento. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="form dialog-content">
			<fieldset className="job-details" disabled={saving}>
				<div className="form-row">
					<label>
						Etapa
						<select value={draft.stage} onChange={(event) => update("stage", event.target.value as SelectionStage)}>
							{STAGES.map((stage) => (
								<option key={stage} value={stage}>
									{STAGE_LABELS[stage]}
								</option>
							))}
						</select>
					</label>
					<label>
						Data e hora
						<input
							type="datetime-local"
							required
							value={draft.scheduledAt}
							onChange={(event) => update("scheduledAt", event.target.value)}
						/>
					</label>
					<label>
						Duração (minutos)
						<input
							type="number"
							inputMode="numeric"
							min={1}
							max={MAX_DURATION_MINUTES}
							value={draft.durationMinutes}
							onChange={(event) => update("durationMinutes", event.target.value)}
							placeholder="60"
						/>
					</label>
				</div>
				<label>
					Local ou link da reunião
					<input
						value={draft.location}
						onChange={(event) => update("location", event.target.value)}
						maxLength={1000}
						placeholder="https://meet.google.com/..."
					/>
				</label>
				<label>
					Observações
					<AutoGrowTextarea
						value={draft.notes}
						onChange={(event) => update("notes", event.target.value)}
						rows={3}
						maxLength={2000}
					/>
				</label>
			</fieldset>
			{conflicts.length > 0 && <ConflictWarning conflicts={conflicts} />}
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="dialog-actions">
				<button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
					Cancelar
				</button>
				<button type="submit" disabled={saving || !draft.scheduledAt} aria-busy={saving}>
					Salvar agendamento
				</button>
			</div>
		</form>
	);
}

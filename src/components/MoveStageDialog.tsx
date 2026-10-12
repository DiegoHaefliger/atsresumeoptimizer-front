import { useState, type FormEvent } from "react";
import { errorMessage } from "../api/client";
import type { SelectionProcess, SelectionStage } from "../api/types";
import { jobLabel } from "../lib/jobCode";
import { STAGE_LABELS, STAGES } from "../lib/processLabels";
import { emptyScheduleDraft, MAX_DURATION_MINUTES, type ScheduleDraft } from "../lib/scheduleDraft";
import { useScheduleConflicts } from "../lib/useScheduleConflicts";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { ConflictWarning } from "./ConflictWarning";
import { DateTimeField } from "./DateTimeField";
import { Dialog } from "./Dialog";
import { ProcessHistory } from "./ProcessHistory";
import { StateMessage } from "./StateMessage";

type MoveStageDialogProps = {
	process: SelectionProcess | null;
	onClose: () => void;
	onMove: (processId: string, stage: SelectionStage, note: string, stageAt: string, schedule: ScheduleDraft | null) => Promise<void>;
	onHistoryChange: () => void;
};

export function MoveStageDialog({ process, onClose, onMove, onHistoryChange }: MoveStageDialogProps) {
	return (
		<Dialog open={process !== null} title={process ? jobLabel(process.jobCode, process.jobTitle, process.company) : ""} onClose={onClose}>
			{process && <MoveStageForm key={process.id} process={process} onClose={onClose} onMove={onMove} onHistoryChange={onHistoryChange} />}
		</Dialog>
	);
}

type MoveStageFormProps = {
	process: SelectionProcess;
	onClose: () => void;
	onMove: MoveStageDialogProps["onMove"];
	onHistoryChange: MoveStageDialogProps["onHistoryChange"];
};

function MoveStageForm({ process, onClose, onMove, onHistoryChange }: MoveStageFormProps) {
	const [stage, setStage] = useState<SelectionStage>(process.stage);
	const [note, setNote] = useState("");
	const [stageAt, setStageAt] = useState("");
	const [addToCalendar, setAddToCalendar] = useState(false);
	const [schedule, setSchedule] = useState<ScheduleDraft>(() => emptyScheduleDraft(process.stage));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const conflicts = useScheduleConflicts(addToCalendar ? stageAt : "", schedule.durationMinutes);
	const missingDate = addToCalendar && !stageAt;

	function updateSchedule<K extends keyof ScheduleDraft>(field: K, value: ScheduleDraft[K]) {
		setSchedule((current) => ({ ...current, [field]: value }));
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onMove(process.id, stage, note, stageAt, addToCalendar ? { ...schedule, stage, scheduledAt: stageAt } : null);
			onClose();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra mudar a etapa. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<div className="dialog-content">
			<form onSubmit={handleSubmit} className="form">
				<fieldset className="form" disabled={saving}>
					<label>
						Etapa atual: {STAGE_LABELS[process.stage]}. Mover para
						<select value={stage} onChange={(event) => setStage(event.target.value as SelectionStage)}>
							{STAGES.map((option) => (
								<option key={option} value={option}>
									{STAGE_LABELS[option]}
								</option>
							))}
						</select>
					</label>
					<DateTimeField
						legend={addToCalendar ? "Data e hora da etapa" : "Data e hora da etapa (opcional)"}
						required={addToCalendar}
						value={stageAt}
						onChange={setStageAt}
					/>
					<label className="toggle-option">
						<input
							type="checkbox"
							role="switch"
							checked={addToCalendar}
							onChange={(event) => setAddToCalendar(event.target.checked)}
						/>
						<span className="toggle-switch" aria-hidden="true" />
						<span className="toggle-option-text">
							<span className="toggle-option-title">Adicionar etapa ao calendário</span>
							<span className="toggle-option-desc">
								Cria um agendamento com lembrete. Se o Google Agenda estiver conectado, o evento vai pra lá também. Desligado, a
								data fica só no histórico da vaga.
							</span>
						</span>
					</label>
					{addToCalendar && (
						<div className="schedule-fields">
							<div className="form-row">
								<label>
									Duração (minutos)
									<input
										type="number"
										inputMode="numeric"
										min={1}
										max={MAX_DURATION_MINUTES}
										value={schedule.durationMinutes}
										onChange={(event) => updateSchedule("durationMinutes", event.target.value)}
										placeholder="60"
									/>
								</label>
								<label>
									Local ou link da reunião
									<input
										value={schedule.location}
										onChange={(event) => updateSchedule("location", event.target.value)}
										maxLength={1000}
										placeholder="https://meet.google.com/..."
									/>
								</label>
							</div>
							{conflicts.length > 0 && <ConflictWarning conflicts={conflicts} />}
						</div>
					)}
					<label>
						Anotação (opcional)
						<AutoGrowTextarea
							value={note}
							onChange={(event) => setNote(event.target.value)}
							rows={3}
							maxLength={2000}
							placeholder="Ex.: entrevista marcada para sexta, 14h"
						/>
					</label>
				</fieldset>
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="dialog-actions">
					<button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
						Cancelar
					</button>
					<button type="submit" disabled={saving || stage === process.stage || missingDate} aria-busy={saving}>
						Mover etapa
					</button>
				</div>
			</form>
			<ProcessHistory
				processId={process.id}
				currentStage={process.stage}
				onPick={saving ? undefined : setStage}
				onScheduleChange={onHistoryChange}
			/>
		</div>
	);
}

import { useState } from "react";
import { apiDelete, errorMessage } from "../api/client";
import type { SelectionProcess, SelectionSchedule, SelectionStage, StageMovement } from "../api/types";
import { PROCESSES_PATH } from "../lib/processPath";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { buildTimeline } from "../lib/processTimeline";
import { cancelSchedule, completeSchedule, rescheduleSchedule } from "../lib/scheduleApi";
import { draftFromSchedule, type ScheduleDraft } from "../lib/scheduleDraft";
import { useApiResource } from "../lib/useApiResource";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import { ScheduleHistoryItem } from "./ScheduleHistoryItem";
import { StateMessage } from "./StateMessage";

type ProcessHistoryProps = {
	processId: string;
	currentStage: SelectionStage;
	onPick?: (stage: SelectionStage) => void;
	onScheduleChange?: () => void;
};

export function ProcessHistory({ processId, currentStage, onPick, onScheduleChange }: ProcessHistoryProps) {
	const { data: detail, reload } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	const [confirming, setConfirming] = useState<StageMovement | null>(null);
	const [cancelling, setCancelling] = useState<SelectionSchedule | null>(null);
	const [rescheduling, setRescheduling] = useState<SelectionSchedule | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timeline = buildTimeline(detail?.history ?? [], detail?.schedules ?? []);
	const currentMovementId = detail?.history.at(-1)?.id;

	async function run(action: () => Promise<unknown>, failure: string) {
		setError(null);
		setBusy(true);
		try {
			await action();
			reload();
			onScheduleChange?.();
			return true;
		} catch (err) {
			setError(errorMessage(err, failure));
			return false;
		} finally {
			setBusy(false);
		}
	}

	async function removeMovement(movement: StageMovement) {
		const removed = await run(
			() => apiDelete(`${PROCESSES_PATH}/${processId}/history/${movement.id}`),
			"Não deu pra excluir a etapa. Tenta de novo.",
		);
		if (removed) {
			setConfirming(null);
		}
	}

	async function cancelScheduled(schedule: SelectionSchedule) {
		const canceled = await run(() => cancelSchedule(processId, schedule.id), "Não deu pra cancelar o agendamento. Tenta de novo.");
		if (canceled) {
			setCancelling(null);
		}
	}

	function reschedule(draft: ScheduleDraft) {
		return rescheduleSchedule(processId, rescheduling?.id ?? "", draft).then(() => {
			reload();
			onScheduleChange?.();
		});
	}

	return (
		<>
			<h3 className="process-history-title">Histórico</h3>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<ol className="process-history">
				{timeline.map((item) => (
					<li key={item.id}>
						{item.kind === "schedule" ? (
							<ScheduleHistoryItem
								schedule={item.schedule}
								busy={busy}
								onReschedule={setRescheduling}
								onComplete={(schedule) =>
									run(() => completeSchedule(processId, schedule.id), "Não deu pra concluir o agendamento. Tenta de novo.")
								}
								onCancel={setCancelling}
							/>
						) : (
							<details className="process-history-item">
								<summary>
									<strong>{STAGE_LABELS[item.movement.stage]}</strong>
									<span className="process-history-date">{formatDateTime(item.movement.movedAt)}</span>
								</summary>
								<p className="process-history-note">{item.movement.note ?? "Sem anotação."}</p>
								<div className="process-history-actions">
									{onPick && item.movement.stage !== currentStage && (
										<button
											type="button"
											className="btn-secondary btn-small"
											onClick={() => onPick(item.movement.stage)}
										>
											Voltar para esta etapa
										</button>
									)}
									{item.movement.id !== currentMovementId && (
										<button type="button" className="btn-secondary btn-small" onClick={() => setConfirming(item.movement)}>
											Excluir etapa
										</button>
									)}
								</div>
							</details>
						)}
					</li>
				))}
			</ol>
			<ConfirmDialog
				open={confirming !== null}
				title="Excluir etapa do histórico?"
				confirmLabel="Excluir etapa"
				busy={busy}
				onConfirm={() => confirming && removeMovement(confirming)}
				onCancel={() => setConfirming(null)}
			>
				<p>
					A etapa <strong>{confirming ? STAGE_LABELS[confirming.stage] : ""}</strong> sai do histórico do processo. Não dá
					pra desfazer.
				</p>
			</ConfirmDialog>
			<ConfirmDialog
				open={cancelling !== null}
				title="Cancelar agendamento?"
				confirmLabel="Cancelar agendamento"
				busy={busy}
				onConfirm={() => cancelling && cancelScheduled(cancelling)}
				onCancel={() => setCancelling(null)}
			>
				<p>
					O agendamento de <strong>{cancelling ? formatDateTime(cancelling.scheduledAt) : ""}</strong> fica como cancelado no
					histórico e o lembrete não é mais enviado.
				</p>
			</ConfirmDialog>
			<ScheduleDialog
				title="Reagendar"
				initial={rescheduling ? draftFromSchedule(rescheduling) : null}
				onClose={() => setRescheduling(null)}
				onSave={reschedule}
			/>
		</>
	);
}

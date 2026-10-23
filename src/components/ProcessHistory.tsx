import { useState } from "react";
import { apiDelete, errorMessage } from "../api/client";
import type { SelectionProcess, SelectionSchedule, SelectionStage, StageMovement } from "../api/types";
import { PROCESSES_PATH } from "../lib/processPath";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { buildTimeline } from "../lib/processTimeline";
import { buildStageTimeline } from "../lib/stageTimeline";
import { cancelSchedule, completeSchedule, rescheduleSchedule } from "../lib/scheduleApi";
import { draftFromSchedule, type ScheduleDraft } from "../lib/scheduleDraft";
import { useApiResource } from "../lib/useApiResource";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import { ScheduleHistoryItem } from "./ScheduleHistoryItem";
import { StageTimelineNode } from "./StageTimelineNode";
import { StateMessage } from "./StateMessage";

const COLLAPSE_ABOVE = 3;

type ProcessHistoryProps = {
	processId: string;
	currentStage: SelectionStage;
	onPick?: (stage: SelectionStage) => void;
	onScheduleChange?: () => void;
	variant?: "list" | "timeline";
};

export function ProcessHistory({ processId, currentStage, onPick, onScheduleChange, variant = "list" }: ProcessHistoryProps) {
	const { data: detail, reload } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	const [confirming, setConfirming] = useState<StageMovement | null>(null);
	const [cancelling, setCancelling] = useState<SelectionSchedule | null>(null);
	const [rescheduling, setRescheduling] = useState<SelectionSchedule | null>(null);
	const [overrides, setOverrides] = useState<Record<string, boolean>>({});
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timeline = buildTimeline(detail?.history ?? [], detail?.schedules ?? []);
	const stageTimeline = buildStageTimeline(detail?.history ?? [], detail?.schedules ?? []);
	const collapsedByDefault = stageTimeline.nodes.length > COLLAPSE_ABOVE;
	const isExpanded = (key: string) => overrides[key] ?? !collapsedByDefault;
	const allExpanded = stageTimeline.nodes.every((node) => isExpanded(node.key));
	const history = detail?.history ?? [];
	const currentMovementId = history.at(-1)?.id;
	const previousStage = history.at(-2)?.stage;

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

	function toggle(key: string) {
		setOverrides((current) => ({ ...current, [key]: !isExpanded(key) }));
	}

	function setAll(expanded: boolean) {
		setOverrides(Object.fromEntries(stageTimeline.nodes.map((node) => [node.key, expanded])));
	}

	function scheduleItem(schedule: SelectionSchedule) {
		return (
			<ScheduleHistoryItem
				schedule={schedule}
				busy={busy}
				onReschedule={setRescheduling}
				onComplete={(completed) =>
					run(() => completeSchedule(processId, completed.id), "Não deu pra concluir o agendamento. Tenta de novo.")
				}
				onCancel={setCancelling}
			/>
		);
	}

	return (
		<>
			<h3 className="process-history-title">Histórico</h3>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{variant === "timeline" ? (
				<>
					{stageTimeline.upcoming.length > 0 && (
						<section className="stage-upcoming" aria-label="Próximos agendamentos">
							<h4>Próximos</h4>
							<ul>
								{stageTimeline.upcoming.map((schedule) => (
									<li key={schedule.id}>{scheduleItem(schedule)}</li>
								))}
							</ul>
						</section>
					)}
					{stageTimeline.nodes.length > 1 && (
						<button type="button" className="stage-timeline-toggle-all" onClick={() => setAll(!allExpanded)}>
							{allExpanded ? "Recolher tudo" : "Expandir tudo"}
						</button>
					)}
					<ol className="stage-timeline">
						{stageTimeline.nodes.map((node) => (
							<StageTimelineNode
								key={node.key}
								node={node}
								currentStage={currentStage}
								canDelete={history.length > 1}
								expanded={isExpanded(node.key)}
								onToggle={() => toggle(node.key)}
								onPick={onPick}
								onDelete={setConfirming}
							>
								{node.schedules.map((schedule) => (
									<li key={schedule.id}>{scheduleItem(schedule)}</li>
								))}
							</StageTimelineNode>
						))}
					</ol>
				</>
			) : (
				<ol className="process-history">
					{timeline.map((item) => (
						<li key={item.id}>
							{item.kind === "schedule" ? (
								scheduleItem(item.schedule)
							) : (
								<details className="process-history-item">
									<summary>
										<strong>{STAGE_LABELS[item.movement.stage]}</strong>
										<span className="process-history-date">{formatDateTime(item.movement.movedAt)}</span>
										{item.movement.stageAt && (
											<span className="process-history-stage-at">Etapa em {formatDateTime(item.movement.stageAt)}</span>
										)}
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
										{history.length > 1 && (
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
			)}
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
				{confirming?.id === currentMovementId && previousStage && (
					<p>
						Como é a etapa atual, o processo volta para <strong>{STAGE_LABELS[previousStage]}</strong>.
					</p>
				)}
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
				ignoreScheduleId={rescheduling?.id}
				onClose={() => setRescheduling(null)}
				onSave={reschedule}
			/>
		</>
	);
}

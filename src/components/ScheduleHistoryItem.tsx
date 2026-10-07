import type { SelectionSchedule } from "../api/types";
import { formatDateTime, STAGE_LABELS } from "../lib/processLabels";
import { SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_TONES } from "../lib/scheduleLabels";
import { Badge } from "./Badge";

const LINK_PATTERN = /^https?:\/\//i;

type ScheduleHistoryItemProps = {
	schedule: SelectionSchedule;
	busy: boolean;
	onReschedule: (schedule: SelectionSchedule) => void;
	onComplete: (schedule: SelectionSchedule) => void;
	onCancel: (schedule: SelectionSchedule) => void;
};

export function ScheduleHistoryItem({ schedule, busy, onReschedule, onComplete, onCancel }: ScheduleHistoryItemProps) {
	const active = schedule.status === "SCHEDULED";
	return (
		<details className="process-history-item process-history-schedule">
			<summary>
				<strong>Agenda: {STAGE_LABELS[schedule.stage]}</strong>{" "}
				<Badge tone={SCHEDULE_STATUS_TONES[schedule.status]}>{SCHEDULE_STATUS_LABELS[schedule.status]}</Badge>
				<span className="process-history-date">{formatDateTime(schedule.scheduledAt)}</span>
			</summary>
			{schedule.durationMinutes != null && <p className="process-history-note">Duração: {schedule.durationMinutes} min</p>}
			{schedule.location && (
				<p className="process-history-note">
					{LINK_PATTERN.test(schedule.location) ? (
						<a href={schedule.location} target="_blank" rel="noopener noreferrer" className="link">
							{schedule.location}
						</a>
					) : (
						schedule.location
					)}
				</p>
			)}
			<p className="process-history-note">{schedule.notes ?? "Sem anotação."}</p>
			{active && (
				<div className="process-history-actions">
					<button type="button" className="btn-secondary btn-small" disabled={busy} onClick={() => onReschedule(schedule)}>
						Reagendar
					</button>
					<button type="button" className="btn-secondary btn-small" disabled={busy} onClick={() => onComplete(schedule)}>
						Marcar como realizada
					</button>
					<button type="button" className="btn-secondary btn-small" disabled={busy} onClick={() => onCancel(schedule)}>
						Cancelar
					</button>
				</div>
			)}
		</details>
	);
}

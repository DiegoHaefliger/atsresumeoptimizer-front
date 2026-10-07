import { timeLabel } from "../lib/calendarRange";
import type { CalendarItem } from "../lib/calendarItems";
import { AlertCircleIcon } from "./icons";

const endFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function ConflictWarning({ conflicts }: { conflicts: CalendarItem[] }) {
	return (
		<div className="alert alert-warning" role="status">
			<AlertCircleIcon />
			<div>
				<strong>Esse horário conflita com:</strong>
				<ul className="conflict-list">
					{conflicts.map((item) => (
						<li key={item.key}>
							{timeLabel(item)}-{endFormat.format(item.end)} {item.title}
							{item.source === "google" ? " (Google Agenda)" : ""}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

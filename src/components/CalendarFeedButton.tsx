import { useState } from "react";
import { apiUrl } from "../api/client";
import type { CalendarFeedInfo } from "../api/types";
import { useApiResource } from "../lib/useApiResource";

export function CalendarFeedButton() {
	const { data: info } = useApiResource<CalendarFeedInfo>("/api/v1/calendar/feed-info");
	const [copied, setCopied] = useState(false);

	if (!info) {
		return null;
	}
	if (!info.enabled || !info.path) {
		return <p className="field-hint">Para assinar a agenda no Google ou Outlook, defina CALENDAR_FEED_TOKEN no servidor.</p>;
	}
	const feedPath = info.path;

	async function copy() {
		await navigator.clipboard.writeText(apiUrl(feedPath));
		setCopied(true);
	}

	return (
		<button type="button" className="btn-secondary btn-small" onClick={copy} title="Cole em Google Agenda > Outras agendas > Por URL">
			{copied ? "Link copiado" : "Copiar link para assinar"}
		</button>
	);
}

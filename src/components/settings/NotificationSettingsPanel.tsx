import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, errorMessage } from "../../api/client";
import type { NotificationChannel, NotificationSettings } from "../../api/types";
import { LeadTimeEditor } from "../LeadTimeEditor";
import { Skeleton } from "../Skeleton";
import { StateMessage } from "../StateMessage";
import { NOTIFICATION_SETTINGS_PATH } from "../../lib/notificationsPath";

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
	IN_APP: "No aplicativo",
	EMAIL: "E-mail",
	PUSH: "Notificação push",
};

const TIMEZONES = Intl.supportedValuesOf("timeZone");

export function NotificationSettingsPanel() {
	const [settings, setSettings] = useState<NotificationSettings | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		apiGet<NotificationSettings>(NOTIFICATION_SETTINGS_PATH).then(setSettings).catch(() => setLoadFailed(true));
	}, []);

	function change(update: Partial<NotificationSettings>) {
		setSaved(false);
		setSettings((current) => (current ? { ...current, ...update } : current));
	}

	function toggleChannel(channel: NotificationChannel, enabled: boolean) {
		const channels = settings?.channels ?? [];
		change({ channels: enabled ? [...channels, channel] : channels.filter((item) => item !== channel) });
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!settings) {
			return;
		}
		setError(null);
		setSaving(true);
		try {
			const { leadMinutes, channels, timezone } = settings;
			setSettings(await apiPutJson<NotificationSettings>(NOTIFICATION_SETTINGS_PATH, { leadMinutes, channels, timezone }));
			setSaved(true);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar as configurações. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	return (
		<>
			<p className="page-subtitle">Defina com quanto tempo de antecedência quer ser avisado dos seus agendamentos.</p>

			{loadFailed ? (
				<StateMessage variant="error" layout="page" message="Não deu pra carregar as configurações." action={{ label: "Ver notificações", to: "/notifications" }} />
			) : !settings ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando configurações...</span>
					<Skeleton width="100%" height={240} radius="var(--radius-lg)" />
				</div>
			) : (
				<form onSubmit={handleSubmit} className="panel panel-body form form-narrow">
					<fieldset className="job-details" disabled={saving}>
						<legend>Quando avisar</legend>
						<LeadTimeEditor value={settings.leadMinutes} onChange={(leadMinutes) => change({ leadMinutes })} />
					</fieldset>
					<fieldset className="job-details" disabled={saving}>
						<legend>Como avisar</legend>
						{settings.availableChannels.map(({ channel, available }) => (
							<label key={channel} className="checkbox-row">
								<input
									type="checkbox"
									checked={settings.channels.includes(channel)}
									disabled={!available}
									onChange={(event) => toggleChannel(channel, event.target.checked)}
								/>
								{CHANNEL_LABELS[channel]}
								{!available && <span className="field-hint"> (em breve)</span>}
							</label>
						))}
					</fieldset>
					<fieldset className="job-details" disabled={saving}>
						<legend>Fuso horário</legend>
						<label>
							Horário exibido nas notificações
							<input
								list="notification-timezones"
								value={settings.timezone}
								onChange={(event) => change({ timezone: event.target.value })}
							/>
							<datalist id="notification-timezones">
								{TIMEZONES.map((zone) => (
									<option key={zone} value={zone} />
								))}
							</datalist>
						</label>
					</fieldset>
					{error && <StateMessage variant="error" layout="inline" message={error} />}
					{saved && <StateMessage variant="empty" layout="inline" message="Configurações salvas." />}
					<div className="form-actions">
						<button type="submit" disabled={saving || settings.channels.length === 0} aria-busy={saving}>
							Salvar configurações
						</button>
					</div>
				</form>
			)}
		</>
	);
}

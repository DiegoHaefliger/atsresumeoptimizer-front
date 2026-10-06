import { useState, type FormEvent } from "react";
import { errorMessage } from "../../api/client";
import type { GoogleCalendarStatus } from "../../api/types";
import { StateMessage } from "../StateMessage";

type GoogleCredentialsFormProps = {
	status: GoogleCalendarStatus;
	onSave: (clientId: string, clientSecret: string) => Promise<void>;
};

export function GoogleCredentialsForm({ status, onSave }: GoogleCredentialsFormProps) {
	const [clientId, setClientId] = useState(status.clientId ?? "");
	const [clientSecret, setClientSecret] = useState("");
	const [copied, setCopied] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSaving(true);
		try {
			await onSave(clientId.trim(), clientSecret.trim());
			setClientSecret("");
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar as credenciais. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	async function copyRedirectUri() {
		await navigator.clipboard.writeText(status.redirectUri);
		setCopied(true);
	}

	return (
		<form onSubmit={handleSubmit} className="form">
			<ol className="field-hint google-steps">
				<li>No Google Cloud, ative a Google Calendar API e crie credenciais OAuth do tipo "Aplicativo da Web".</li>
				<li>Cadastre este endereço em "URIs de redirecionamento autorizados":</li>
			</ol>
			<div className="feed-url">
				<input readOnly value={status.redirectUri} aria-label="URI de redirecionamento" onFocus={(event) => event.target.select()} />
				<button type="button" className="btn-secondary" onClick={copyRedirectUri}>
					{copied ? "Copiado" : "Copiar"}
				</button>
			</div>
			<fieldset className="job-details" disabled={saving}>
				<div className="form-row">
					<label>
						Client ID
						<input required value={clientId} onChange={(event) => setClientId(event.target.value)} maxLength={255} />
					</label>
					<label>
						Client secret
						<input
							required
							type="password"
							autoComplete="off"
							value={clientSecret}
							onChange={(event) => setClientSecret(event.target.value)}
							maxLength={255}
							placeholder={status.configured ? "Informe de novo para trocar" : ""}
						/>
					</label>
				</div>
			</fieldset>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="form-actions">
				<button type="submit" disabled={saving || !clientId.trim() || !clientSecret.trim()} aria-busy={saving}>
					Salvar credenciais
				</button>
			</div>
		</form>
	);
}

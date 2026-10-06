import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { useGoogleCalendar } from "../../lib/useGoogleCalendar";
import { ConfirmDialog } from "../ConfirmDialog";
import { StateMessage } from "../StateMessage";
import { GoogleCredentialsForm } from "./GoogleCredentialsForm";

type Pending = "disconnect" | "remove";

export function GoogleCalendarSettings() {
	const { status, failed, reload, saveCredentials, removeCredentials, connect, sync, disconnect } = useGoogleCalendar();
	const [searchParams, setSearchParams] = useSearchParams();
	const [returned] = useState(() => searchParams.get("google"));
	const [pending, setPending] = useState<Pending | null>(null);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (searchParams.has("google")) {
			setSearchParams({}, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	async function run(action: () => Promise<string | void>, failure: string) {
		setError(null);
		setMessage(null);
		setBusy(true);
		try {
			const result = await action();
			setMessage(result ?? null);
			setPending(null);
		} catch (err) {
			setError(errorMessage(err, failure));
		} finally {
			setBusy(false);
		}
	}

	if (failed) {
		return (
			<fieldset className="job-details">
				<legend>Google Agenda</legend>
				<StateMessage variant="error" layout="inline" message="Não deu pra carregar a integração com o Google." />
				<button type="button" className="btn-secondary btn-small" onClick={reload}>
					Tentar de novo
				</button>
			</fieldset>
		);
	}

	return (
		<fieldset className="job-details" disabled={busy || !status}>
			<legend>Google Agenda</legend>
			<p className="field-hint">
				Opcional. Conectando sua conta, cada agendamento vira um evento no Google Agenda, com os lembretes configurados
				acima. Sem conectar, a agenda do app e o link de assinatura continuam funcionando.
			</p>
			{returned === "connected" && <StateMessage variant="empty" layout="inline" message="Conta Google conectada." />}
			{returned === "error" && (
				<StateMessage variant="error" layout="inline" message="Não deu pra conectar a conta Google. Tenta de novo." />
			)}
			{status && !status.connected && <GoogleCredentialsForm key={status.clientId ?? "new"} status={status} onSave={saveCredentials} />}
			{status?.connected && (
				<p>
					Conectado como <strong>{status.accountEmail ?? "conta Google"}</strong>.
				</p>
			)}
			{message && <StateMessage variant="empty" layout="inline" message={message} />}
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{status?.configured && (
				<div className="process-history-actions">
					{status.connected ? (
						<>
							<button
								type="button"
								onClick={() =>
									run(async () => `${await sync()} agendamentos sincronizados.`, "Não deu pra sincronizar. Tenta de novo.")
								}
							>
								Sincronizar agora
							</button>
							<button type="button" className="btn-secondary" onClick={() => setPending("disconnect")}>
								Desconectar
							</button>
						</>
					) : (
						<button type="button" onClick={() => run(connect, "Não deu pra iniciar a conexão. Tenta de novo.")}>
							Conectar conta Google
						</button>
					)}
					<button type="button" className="btn-secondary" onClick={() => setPending("remove")}>
						Remover credenciais
					</button>
				</div>
			)}
			<ConfirmDialog
				open={pending !== null}
				title={pending === "remove" ? "Remover as credenciais do Google?" : "Desconectar a conta Google?"}
				confirmLabel={pending === "remove" ? "Remover credenciais" : "Desconectar"}
				busy={busy}
				onConfirm={() =>
					pending === "remove"
						? run(removeCredentials, "Não deu pra remover as credenciais. Tenta de novo.")
						: run(disconnect, "Não deu pra desconectar. Tenta de novo.")
				}
				onCancel={() => setPending(null)}
			>
				<p>
					O app para de sincronizar. Os eventos que já estão no Google Agenda continuam lá e podem ser apagados por
					você.
				</p>
			</ConfirmDialog>
		</fieldset>
	);
}

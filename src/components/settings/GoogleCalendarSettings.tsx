import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { useGoogleCalendar } from "../../lib/useGoogleCalendar";
import { ConfirmDialog } from "../ConfirmDialog";
import { StateMessage } from "../StateMessage";
import { GoogleSetupGuide } from "./GoogleSetupGuide";

export function GoogleCalendarSettings() {
	const { status, failed, reload, connect, sync, disconnect } = useGoogleCalendar();
	const [searchParams, setSearchParams] = useSearchParams();
	const [returned] = useState(() => searchParams.get("google"));
	const [confirming, setConfirming] = useState(false);
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
			setMessage(typeof result === "string" ? result : null);
			setConfirming(false);
		} catch (err) {
			setError(errorMessage(err, failure));
		} finally {
			setBusy(false);
		}
	}

	if (failed) {
		return (
			<section className="panel panel-body form form-narrow">
				<StateMessage variant="error" layout="inline" message="Não deu pra carregar a integração com o Google." />
				<button type="button" className="btn-secondary btn-small" onClick={reload}>
					Tentar de novo
				</button>
			</section>
		);
	}
	if (!status) {
		return null;
	}

	return (
		<section className="panel panel-body form form-narrow google-panel">
			<h2>Google Agenda</h2>
			<p className="field-hint">
				Conecte sua conta para os agendamentos aparecerem no Google Agenda, com os lembretes configurados acima. É
				opcional: sem conectar, a agenda do app continua funcionando.
			</p>
			{returned === "connected" && <StateMessage variant="empty" layout="inline" message="Conta Google conectada." />}
			{returned === "error" && (
				<StateMessage variant="error" layout="inline" message="Não deu pra conectar a conta Google. Tenta de novo." />
			)}
			{!status.configured && (
				<p className="field-hint">A integração com o Google ainda não foi configurada no servidor.</p>
			)}
			{status.connected && (
				<p>
					Conectado como <strong>{status.accountEmail ?? "conta Google"}</strong>.
				</p>
			)}
			{message && <StateMessage variant="empty" layout="inline" message={message} />}
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="process-history-actions">
				{status.connected ? (
					<>
						<button
							type="button"
							disabled={busy}
							onClick={() => run(async () => `${await sync()} agendamentos sincronizados.`, "Não deu pra sincronizar. Tenta de novo.")}
						>
							Sincronizar agora
						</button>
						<button type="button" className="btn-secondary" disabled={busy} onClick={() => setConfirming(true)}>
							Desconectar
						</button>
					</>
				) : (
					<button
						type="button"
						disabled={busy || !status.configured}
						onClick={() => run(connect, "Não deu pra iniciar a conexão. Tenta de novo.")}
					>
						Conectar com o Google
					</button>
				)}
			</div>
			{!status.connected && <GoogleSetupGuide redirectUri={status.redirectUri} open={!status.configured} />}
			<ConfirmDialog
				open={confirming}
				title="Desconectar a conta Google?"
				confirmLabel="Desconectar"
				busy={busy}
				onConfirm={() => run(disconnect, "Não deu pra desconectar. Tenta de novo.")}
				onCancel={() => setConfirming(false)}
			>
				<p>
					O app para de sincronizar. Os eventos que já estão no Google Agenda continuam lá e podem ser apagados por
					você.
				</p>
			</ConfirmDialog>
		</section>
	);
}

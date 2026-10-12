import { useState, type FormEvent } from "react";
import { apiDeleteJson, apiPostJson, apiPutJson, errorMessage } from "../../api/client";
import type { ConnectionCheck, DatabaseSettings, DatabaseSwitch, ExternalDatabaseRequest, SslMode } from "../../api/types";
import { DEFAULT_POSTGRES_PORT, DESKTOP_DATABASE_PATH, SSL_MODE_LABELS } from "../../lib/desktopDatabase";
import { waitForRestart } from "../../lib/waitForRestart";
import { BusyLabel } from "../BusyLabel";
import { ConfirmDialog } from "../ConfirmDialog";
import { AlertCircleIcon, CheckCircleIcon } from "../icons";
import { StateMessage } from "../StateMessage";

type Draft = { host: string; port: string; database: string; username: string; password: string; sslMode: SslMode };

type Phase = "idle" | "testing" | "saving" | "restarting" | "restart-manually";

function draftOf(settings: DatabaseSettings): Draft {
	return {
		host: settings.host ?? "",
		port: String(settings.port ?? DEFAULT_POSTGRES_PORT),
		database: settings.database ?? "",
		username: settings.username ?? "",
		password: "",
		sslMode: settings.sslMode ?? "REQUIRE",
	};
}

export function DatabaseSettingsPanel({ settings }: { settings: DatabaseSettings }) {
	const external = settings.mode === "EXTERNAL";
	const [draft, setDraft] = useState<Draft>(() => draftOf(settings));
	const [copyData, setCopyData] = useState(true);
	const [check, setCheck] = useState<ConnectionCheck | null>(null);
	const [phase, setPhase] = useState<Phase>("idle");
	const [error, setError] = useState<string | null>(null);
	const [confirmingLocal, setConfirmingLocal] = useState(false);

	function change(update: Partial<Draft>) {
		setCheck(null);
		setError(null);
		setDraft((current) => ({ ...current, ...update }));
	}

	function request(): ExternalDatabaseRequest {
		return { ...draft, host: draft.host.trim(), port: Number(draft.port), copyData };
	}

	async function handleTest() {
		setError(null);
		setPhase("testing");
		try {
			setCheck(await apiPostJson<ConnectionCheck>(`${DESKTOP_DATABASE_PATH}/test`, request()));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra testar a conexão."));
		} finally {
			setPhase("idle");
		}
	}

	async function afterSwitch(result: DatabaseSwitch) {
		if (!result.restarting) {
			setPhase("restart-manually");
			return;
		}
		setPhase("restarting");
		if (await waitForRestart()) {
			window.location.reload();
		} else {
			setPhase("restart-manually");
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setPhase("saving");
		try {
			await afterSwitch(await apiPutJson<DatabaseSwitch>(DESKTOP_DATABASE_PATH, request()));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra trocar o banco de dados."));
			setPhase("idle");
		}
	}

	async function useLocal() {
		setConfirmingLocal(false);
		setPhase("saving");
		try {
			await afterSwitch(await apiDeleteJson<DatabaseSwitch>(DESKTOP_DATABASE_PATH));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra voltar para o banco local."));
			setPhase("idle");
		}
	}

	if (phase === "restarting") {
		return (
			<p className="alert alert-neutral" role="status" aria-busy="true">
				<span>Reiniciando o app com o novo banco de dados. A página recarrega sozinha.</span>
			</p>
		);
	}

	if (phase === "restart-manually") {
		return <StateMessage variant="error" message="Configuração salva. Feche e abra o app para usar o novo banco." />;
	}

	const busy = phase !== "idle";
	const notEmptyForCopy = check !== null && !check.empty && copyData;

	return (
		<>
			<p className="page-subtitle">
				Por padrão os dados ficam num banco dentro deste computador. Aqui dá pra usar um PostgreSQL externo, por exemplo
				numa VPS, para não depender do computador ou ter backup no servidor.
			</p>
			<form onSubmit={handleSubmit} className="settings-layout">
				<div className="settings-main">
					<section className="panel">
						<div className="panel-header">
							<h2>{external ? "Banco externo em uso" : "Conectar a um banco externo"}</h2>
							<p>
								{external
									? `Os dados estão em ${settings.host}:${settings.port}/${settings.database}.`
									: "Os dados estão no banco local deste computador."}
							</p>
						</div>
						<div className="panel-body">
							<div className="form-row form-row-3">
								<label>
									Servidor
									<input
										required
										value={draft.host}
										onChange={(event) => change({ host: event.target.value })}
										placeholder="Ex.: meuservidor.com.br"
									/>
								</label>
								<label>
									Porta
									<input
										required
										type="number"
										min={1}
										max={65535}
										value={draft.port}
										onChange={(event) => change({ port: event.target.value })}
									/>
								</label>
								<label>
									Banco
									<input required value={draft.database} onChange={(event) => change({ database: event.target.value })} />
								</label>
							</div>
							<div className="form-row form-row-3">
								<label>
									Usuário
									<input
										required
										autoComplete="off"
										value={draft.username}
										onChange={(event) => change({ username: event.target.value })}
									/>
								</label>
								<label>
									Senha
									<input
										required
										type="password"
										autoComplete="new-password"
										value={draft.password}
										onChange={(event) => change({ password: event.target.value })}
									/>
								</label>
								<label>
									Conexão
									<select value={draft.sslMode} onChange={(event) => change({ sslMode: event.target.value as SslMode })}>
										{(Object.keys(SSL_MODE_LABELS) as SslMode[]).map((mode) => (
											<option key={mode} value={mode}>
												{SSL_MODE_LABELS[mode]}
											</option>
										))}
									</select>
								</label>
							</div>
							{draft.sslMode === "DISABLE" && (
								<p className="alert alert-warning" role="alert">
									<AlertCircleIcon />
									<span>Sem criptografia, os currículos trafegam abertos pela rede. Use só se o banco estiver na sua rede local.</span>
								</p>
							)}
							<label className="checkbox-row">
								<input type="checkbox" checked={copyData} onChange={(event) => setCopyData(event.target.checked)} />
								Copiar meus dados atuais para o novo banco (ele precisa estar vazio)
							</label>
							<p className="field-hint">
								O banco atual não é apagado. A senha fica salva só neste computador, num arquivo que apenas o seu usuário
								lê. Para usar o mesmo banco em outro computador, cadastre lá as chaves de IA de novo.
							</p>
						</div>
					</section>
				</div>

				<aside className="settings-aside">
					<div className="panel">
						<div className="panel-header">
							<h2>Aplicar</h2>
							<p>Teste antes de salvar. Ao salvar, o app reinicia já usando o novo banco.</p>
						</div>
						<div className="panel-body">
							{check && (
								<p className={`connection-result connection-result-${notEmptyForCopy ? "error" : "ok"}`} role="status">
									{notEmptyForCopy ? <AlertCircleIcon /> : <CheckCircleIcon />}
									<span>
										Conectou no PostgreSQL {check.serverVersion}.{" "}
										{check.empty
											? "O banco está vazio."
											: copyData
												? "O banco já tem dados: use um banco vazio ou desmarque a cópia para usar o que já está lá."
												: "O banco já tem dados do app; eles passam a ser usados."}
									</span>
								</p>
							)}
							<div className="settings-actions">
								{error && <StateMessage variant="error" layout="inline" message={error} />}
								<button type="button" className="btn-secondary btn-block" onClick={handleTest} disabled={busy} aria-busy={phase === "testing"}>
									<BusyLabel busy={phase === "testing"} busyText="Testando...">
										Testar conexão
									</BusyLabel>
								</button>
								<button type="submit" className="btn-block" disabled={busy || notEmptyForCopy} aria-busy={phase === "saving"}>
									<BusyLabel busy={phase === "saving"} busyText={copyData ? "Copiando dados..." : "Salvando..."}>
										Salvar e reiniciar
									</BusyLabel>
								</button>
								{external && (
									<button type="button" className="btn-secondary btn-block" onClick={() => setConfirmingLocal(true)} disabled={busy}>
										Voltar para o banco local
									</button>
								)}
							</div>
						</div>
					</div>
				</aside>
			</form>
			<ConfirmDialog
				open={confirmingLocal}
				title="Voltar para o banco local?"
				confirmLabel="Voltar para o banco local"
				onConfirm={useLocal}
				onCancel={() => setConfirmingLocal(false)}
			>
				O app volta a usar o banco deste computador, com os dados de antes da troca. O que foi feito só no banco externo
				não aparece nele.
			</ConfirmDialog>
		</>
	);
}

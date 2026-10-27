import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPostJson, apiUrl, ApiError, errorMessage } from "../../api/client";
import type { LinkedInSnapshotResponse, PairingTokenResponse } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { Badge } from "../Badge";
import { RefreshIcon } from "../icons";
import { StateMessage } from "../StateMessage";
import { CopyButton } from "./CopyButton";

const SNAPSHOT_PATH = "/api/v1/linkedin/snapshots";

export function LinkedInDataPanel({ onSnapshotLoaded }: { onSnapshotLoaded?: (snapshot: LinkedInSnapshotResponse | null) => void }) {
	const [snapshot, setSnapshot] = useState<LinkedInSnapshotResponse | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [latest, pairing] = await Promise.all([
				apiGet<LinkedInSnapshotResponse>(`${SNAPSHOT_PATH}/latest`).catch((err) => {
					if (err instanceof ApiError && err.status === 404) {
						return null;
					}
					throw err;
				}),
				apiGet<PairingTokenResponse>("/api/v1/linkedin/pairing-token"),
			]);
			setSnapshot(latest);
			setToken(pairing.token);
			onSnapshotLoaded?.(latest);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra carregar os dados do LinkedIn."));
		} finally {
			setLoading(false);
		}
	}, [onSnapshotLoaded]);

	useEffect(() => {
		void load();
	}, [load]);

	async function regenerate() {
		try {
			const pairing = await apiPostJson<PairingTokenResponse>("/api/v1/linkedin/pairing-token/regenerate", {});
			setToken(pairing.token);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra gerar um novo token."));
		}
	}

	return (
		<div className="settings-main">
			{error && <StateMessage variant="error" message={error} />}
			<section className="panel">
				<div className="panel-header">
					<h2>Como trazer o seu perfil</h2>
					<p>Você mesmo abre o perfil no LinkedIn, já logado. A extensão lê só a página aberta, sem guardar senha nem cookie.</p>
				</div>
				<div className="panel-body">
					<ol className="linkedin-steps">
						<li>
							Instale a extensão do Chrome (pasta <code>extension</code> do projeto, modo desenvolvedor).
						</li>
						<li>Abra o seu perfil em linkedin.com/in e role até o fim pra carregar as seções.</li>
						<li>Clique na extensão, em “Ler esta página”. Repita nas páginas “Mostrar tudo” de competências e certificações.</li>
						<li>Cole o token abaixo na extensão e clique em “Enviar para o app”.</li>
					</ol>
					<div className="linkedin-token">
						<span className="form-field-label">Token de pareamento</span>
						<code className="linkedin-token-value">{token ?? "..."}</code>
						<div className="linkedin-token-actions">
							{token && <CopyButton text={token} />}
							<button type="button" className="btn-secondary btn-small" onClick={regenerate}>
								Gerar outro
							</button>
						</div>
					</div>
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<h2>Último perfil recebido</h2>
					<button type="button" className="btn-secondary btn-small" onClick={() => void load()} disabled={loading}>
						<RefreshIcon /> Atualizar
					</button>
				</div>
				<div className="panel-body">
					{!snapshot && !loading && (
						<StateMessage variant="empty" message="Nenhum perfil recebido ainda. Siga os passos acima." />
					)}
					{snapshot && <SnapshotSummary snapshot={snapshot} />}
				</div>
			</section>
		</div>
	);
}

function SnapshotSummary({ snapshot }: { snapshot: LinkedInSnapshotResponse }) {
	return (
		<div className="linkedin-snapshot">
			{snapshot.hasPhoto && (
				<img
					className="linkedin-snapshot-photo"
					src={apiUrl(`${SNAPSHOT_PATH}/${snapshot.id}/photo`)}
					alt="Foto de perfil lida do LinkedIn"
				/>
			)}
			<div className="linkedin-snapshot-body">
				<h3>{snapshot.profile.fullName ?? "Perfil sem nome"}</h3>
				{snapshot.profile.headline && <p>{snapshot.profile.headline}</p>}
				<p className="field-hint">
					Lido em {formatCapturedAt(snapshot.capturedAt)} <Badge tone="info">{snapshot.source === "EXTENSION" ? "Extensão" : "Texto"}</Badge>
				</p>
				{snapshot.missingSections.length > 0 && (
					<>
						<p className="field-hint">Seções que não vieram na leitura:</p>
						<div className="keyword-pills">
							{snapshot.missingSections.map((section) => (
								<span key={section} className="keyword-pill keyword-pill-missing">
									{SECTION_LABELS[section]}
								</span>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { apiGet, apiUrl, ApiError, errorMessage } from "../../api/client";
import type { LinkedInSnapshotResponse } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { Badge } from "../Badge";
import { DownloadIcon, RefreshIcon } from "../icons";
import { StateMessage } from "../StateMessage";

const SNAPSHOT_PATH = "/api/v1/linkedin/snapshots";
const EXTENSION_FILE = "ats-linkedin-extension.zip";
const EXTENSIONS_PAGE = "chrome://extensions";

const COPIED_FEEDBACK_MS = 4000;

function ExtensionsLink() {
	const [copied, setCopied] = useState(false);

	async function copy(event: MouseEvent<HTMLAnchorElement>) {
		event.preventDefault();
		await navigator.clipboard.writeText(EXTENSIONS_PAGE);
		setCopied(true);
		window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
	}

	return (
		<>
			Abra uma nova aba do Chrome e vá em{" "}
			<a href={EXTENSIONS_PAGE} onClick={copy}>
				<code>{EXTENSIONS_PAGE}</code>
			</a>
			{copied ? " (copiado, é só colar na barra de endereço)" : " (clique para copiar)"}
		</>
	);
}

function downloadExtension() {
	const link = document.createElement("a");
	link.href = `${import.meta.env.BASE_URL}${EXTENSION_FILE}`;
	link.download = EXTENSION_FILE;
	link.click();
}

export function LinkedInDataPanel({ onSnapshotLoaded }: { onSnapshotLoaded?: (snapshot: LinkedInSnapshotResponse | null) => void }) {
	const [snapshot, setSnapshot] = useState<LinkedInSnapshotResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const latest = await apiGet<LinkedInSnapshotResponse>(`${SNAPSHOT_PATH}/latest`).catch((err) => {
				if (err instanceof ApiError && err.status === 404) {
					return null;
				}
				throw err;
			});
			setSnapshot(latest);
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

	return (
		<div className="settings-main">
			{error && <StateMessage variant="error" message={error} />}
			<section className="panel">
				<div className="panel-header">
					<h2>1. Instale a extensão do Chrome (uma vez só)</h2>
					<p>Ela lê só a página do LinkedIn que você abrir, sem guardar senha nem cookie.</p>
				</div>
				<div className="panel-body">
					<div className="linkedin-actions">
						<button type="button" onClick={downloadExtension}>
							<DownloadIcon /> Baixar extensão
						</button>
					</div>
					<ol className="linkedin-steps">
						<li>Abra o arquivo baixado e extraia tudo numa pasta (clique direito, “Extrair tudo”). Guarde a pasta, ela não pode ser apagada.</li>
						<li>
							<ExtensionsLink />
						</li>
						<li>Ligue a chave “Modo do desenvolvedor”, no canto superior direito.</li>
						<li>Clique em “Carregar sem compactação” e escolha a pasta que você extraiu.</li>
						<li>Clique no ícone de quebra-cabeça do Chrome e fixe a extensão “ATS Resume Optimizer”.</li>
					</ol>
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<h2>2. Traga o seu perfil</h2>
				</div>
				<div className="panel-body">
					<ol className="linkedin-steps">
						<li>Abra o seu perfil em linkedin.com/in, já logado, e role até o fim pra carregar as seções.</li>
						<li>Clique no ícone da extensão e em “Ler esta página”. Repita nas páginas “Mostrar tudo” de competências e certificações.</li>
						<li>Clique em “Enviar para o app”. O app precisa estar aberto; a extensão se pareia sozinha.</li>
					</ol>
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<h2>Último perfil recebido</h2>
					<button type="button" className="btn-secondary btn-small linkedin-refresh" onClick={() => void load()} disabled={loading}>
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

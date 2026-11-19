import { useCallback, useEffect, useState } from "react";
import { apiGet, apiUrl, ApiError, errorMessage } from "../../api/client";
import type { LinkedInSnapshotResponse } from "../../api/linkedinTypes";
import { formatCapturedAt, SECTION_LABELS } from "../../lib/linkedinLabels";
import { uploadLinkedInPdf } from "../../lib/linkedinPdf";
import { Badge } from "../Badge";
import { RefreshIcon } from "../icons";
import { StateMessage } from "../StateMessage";
import { ExtensionInstallSteps } from "./ExtensionInstallSteps";
import { PdfImport } from "./PdfImport";

const SNAPSHOT_PATH = "/api/v1/linkedin/snapshots";
const SOURCE_LABELS = { EXTENSION: "Extensão", TEXT: "Texto", PDF: "PDF" } as const;
export function LinkedInDataPanel({ onSnapshotLoaded }: { onSnapshotLoaded?: (snapshot: LinkedInSnapshotResponse | null) => void }) {
	const [snapshot, setSnapshot] = useState<LinkedInSnapshotResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [importing, setImporting] = useState(false);
	const [imported, setImported] = useState<string | null>(null);

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

	async function importPdf(file: File) {
		setImporting(true);
		setError(null);
		setImported(null);
		try {
			const capture = await uploadLinkedInPdf(file);
			const changed = capture.changedSections.map((section) => SECTION_LABELS[section]).join(", ");
			setImported(capture.unchanged ? "PDF lido. Nada mudou desde a última leitura." : `PDF lido.${changed ? ` Mudou: ${changed}.` : ""}`);
			await load();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra ler o PDF. Tenta de novo."));
		} finally {
			setImporting(false);
		}
	}

	return (
		<div className="settings-main">
			{error && <StateMessage variant="error" message={error} />}
			<section className="panel">
				<div className="panel-header">
					<h2>1. Instale a extensão do Chrome (uma vez só)</h2>
					<p>Ela lê só a página do LinkedIn que você abrir, sem guardar senha nem cookie.</p>
				</div>
				<div className="panel-body">
					<ExtensionInstallSteps />
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<h2>2. O perfil é lido a cada análise</h2>
				</div>
				<div className="panel-body">
					<p>
						Na aba Análise, clique em <strong>Analisar meu LinkedIn</strong>. A extensão abre o seu perfil em segundo plano, lê e envia sozinha. Só precisa
						estar com o LinkedIn logado neste navegador.
					</p>
					<p className="field-hint">Para ler à mão, abra o seu perfil, clique no ícone da extensão e em “Ler esta página”, repita nas páginas “Mostrar tudo” e clique em “Enviar para o app”.</p>
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<h2>Ou importe o PDF do seu perfil</h2>
					<p>Sem instalar nada. O PDF é lido com a IA configurada no app e depois não fica guardado.</p>
				</div>
				<div className="panel-body">
					<PdfImport onImport={(file) => void importPdf(file)} busy={importing} />
					{importing && <p className="field-hint">Lendo o PDF...</p>}
					{imported && <StateMessage variant="empty" message={imported} />}
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
					Lido em {formatCapturedAt(snapshot.capturedAt)} <Badge tone="info">{SOURCE_LABELS[snapshot.source]}</Badge>
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

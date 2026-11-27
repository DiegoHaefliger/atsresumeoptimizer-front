import { useState } from "react";
import { errorMessage } from "../../api/client";
import { openLogsFolder, type DiagnosticReport } from "../../lib/diagnosticsApi";
import { useDiagnosticBundleDownload } from "../../lib/useDiagnosticBundleDownload";
import { BusyLabel } from "../BusyLabel";
import { CheckCircleIcon, DownloadIcon, FileTextIcon, LockIcon } from "../icons";
import { StateMessage } from "../StateMessage";

type SystemInfoPanelProps = { report: DiagnosticReport };

export function SystemInfoPanel({ report }: SystemInfoPanelProps) {
	const [error, setError] = useState<string | null>(null);
	const bundle = useDiagnosticBundleDownload();

	async function openFolder() {
		setError(null);
		try {
			await openLogsFolder();
		} catch (caught) {
			setError(errorMessage(caught, "Não deu pra abrir a pasta de logs."));
		}
	}

	return (
		<section className="diagnostics-block" aria-labelledby="system-info-title">
			<header className="diagnostics-block-header">
				<div>
					<h2 id="system-info-title">Informações do sistema</h2>
					<p>
						Nenhuma chave de API é incluída. Itens com <LockIcon aria-hidden={false} role="img" aria-label="cadeado" /> ficam
						fora do texto da issue e só vão no pacote de diagnóstico.
					</p>
				</div>
			</header>
			<div className="diagnostics-actions">
				<button type="button" className="btn-secondary" onClick={() => void bundle.download()} disabled={bundle.downloading}>
					<BusyLabel busy={bundle.downloading} busyText="Gerando...">
						{bundle.downloaded ? <CheckCircleIcon /> : <DownloadIcon />} Baixar pacote de diagnóstico
					</BusyLabel>
				</button>
				{report.logsFolderOpenable && (
					<button type="button" className="btn-secondary" onClick={() => void openFolder()}>
						<FileTextIcon /> Abrir pasta de logs
					</button>
				)}
			</div>
			{(error ?? bundle.error) && <StateMessage message={(error ?? bundle.error) as string} />}
			<div className="diagnostics-sections">
				{report.sections.map((section) => (
					<div key={section.title} className="diagnostics-section panel">
						<h3>{section.title}</h3>
						<dl>
							{section.entries.map((entry) => (
								<div key={entry.label}>
									<dt>
										{entry.label}
										{entry.personal && <LockIcon className="diagnostics-personal" aria-hidden={false} role="img" aria-label="fica fora da issue pública" />}
									</dt>
									<dd>{entry.value}</dd>
								</div>
							))}
						</dl>
					</div>
				))}
			</div>
		</section>
	);
}

import { PROJECT_LINKS } from "../../lib/projectLinks";
import { useBugReportUrl } from "../../lib/useBugReportUrl";
import { useDiagnosticBundleDownload } from "../../lib/useDiagnosticBundleDownload";
import { BusyLabel } from "../BusyLabel";
import { CheckCircleIcon, DownloadIcon, ExternalLinkIcon, GitHubIcon, PaperclipIcon } from "../icons";
import { StateMessage } from "../StateMessage";

const LOCKED_HINT = "Libera depois de baixar o diagnóstico";

export function BugReportCallout() {
	const bugReportUrl = useBugReportUrl();
	const { download, downloading, downloaded, error } = useDiagnosticBundleDownload();

	return (
		<section className="bug-callout panel" aria-labelledby="bug-callout-title">
			<span className="bug-callout-icon">
				<GitHubIcon />
			</span>
			<div className="bug-callout-body">
				<span className="bug-callout-eyebrow">Canal oficial para bugs</span>
				<h2 id="bug-callout-title">Encontrou um problema? Abra uma issue no GitHub</h2>
				<p>A issue já abre com versão, sistema, IA ativa e os últimos erros.</p>
				<p className="bug-callout-attach">
					<PaperclipIcon />
					<span>
						<strong>Baixe o pacote de diagnóstico e anexe o .zip na issue.</strong> Arraste o arquivo para o campo de texto.
					</span>
				</p>
				{error && <StateMessage message={error} />}
			</div>
			<div className="bug-callout-actions">
				<button type="button" className="bug-callout-primary" onClick={() => void download()} disabled={downloading}>
					<BusyLabel busy={downloading} busyText="Gerando...">
						{downloaded ? <CheckCircleIcon /> : <DownloadIcon />} {downloaded ? "Diagnóstico baixado" : "1. Baixar Diagnóstico"}
					</BusyLabel>
				</button>
				{downloaded ? (
					<a className="bug-callout-primary" href={bugReportUrl()} target="_blank" rel="noreferrer">
						2. Relatar problema <ExternalLinkIcon />
						<span className="sr-only">(abre em nova aba)</span>
					</a>
				) : (
					<span className="bug-callout-primary is-locked" aria-disabled="true" title={LOCKED_HINT}>
						2. Relatar problema <ExternalLinkIcon />
						<span className="sr-only">({LOCKED_HINT})</span>
					</span>
				)}
				<a className="link" href={PROJECT_LINKS.issues} target="_blank" rel="noreferrer">
					Ver problemas já relatados
					<span className="sr-only">(abre em nova aba)</span>
				</a>
			</div>
		</section>
	);
}

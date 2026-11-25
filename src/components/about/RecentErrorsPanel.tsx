import { clearRecentErrors, useRecentErrors, type RecentError } from "../../lib/recentErrors";
import { useBugReportUrl } from "../../lib/useBugReportUrl";
import { useCopyFeedback } from "../../lib/useCopyFeedback";
import { CopyIcon, ExternalLinkIcon } from "../icons";

const timeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const SOURCE_LABELS: Record<RecentError["source"], string> = {
	server: "Servidor",
	screen: "Tela",
};

export function RecentErrorsPanel() {
	const errors = useRecentErrors();
	const bugReportUrl = useBugReportUrl();

	return (
		<section className="diagnostics-block" aria-labelledby="recent-errors-title">
			<header className="diagnostics-block-header">
				<div>
					<h2 id="recent-errors-title">Erros recentes</h2>
					<p>Os últimos erros que apareceram neste navegador, com o código que identifica cada um no log.</p>
				</div>
				{errors.length > 0 && (
					<button type="button" className="btn-secondary btn-small" onClick={clearRecentErrors}>
						Limpar lista
					</button>
				)}
			</header>
			{errors.length === 0 ? (
				<p className="diagnostics-empty panel">Nenhum erro registrado. Se algo der errado, ele aparece aqui.</p>
			) : (
				<ul className="recent-errors panel">
					{errors.map((error) => (
						<RecentErrorItem key={`${error.at}-${error.errorId ?? error.message}`} error={error} reportUrl={bugReportUrl({ errorId: error.errorId, message: error.message, page: error.page })} />
					))}
				</ul>
			)}
		</section>
	);
}

function RecentErrorItem({ error, reportUrl }: { error: RecentError; reportUrl: string }) {
	const { copied, copy } = useCopyFeedback();
	const summary = `Código: ${error.errorId ?? "sem código"} · ${error.page} · ${error.message}`;

	return (
		<li className="recent-error">
			<div className="recent-error-meta">
				<span className="recent-error-source">{SOURCE_LABELS[error.source]}</span>
				<time dateTime={error.at}>{timeFormat.format(new Date(error.at))}</time>
				<span>{error.page}</span>
			</div>
			<p className="recent-error-message">{error.message}</p>
			<div className="recent-error-code">
				<code>{error.errorId ?? "sem código"}</code>
				<button type="button" className="btn-secondary btn-small" onClick={() => void copy(summary)}>
					<CopyIcon /> {copied ? "Copiado" : "Copiar"}
				</button>
				<a
					className="link recent-error-report"
					href={reportUrl}
					target="_blank"
					rel="noreferrer"
				>
					Relatar este erro <ExternalLinkIcon />
					<span className="sr-only">(abre em nova aba)</span>
				</a>
			</div>
		</li>
	);
}

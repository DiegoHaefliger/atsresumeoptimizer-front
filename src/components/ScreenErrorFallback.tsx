import { Link } from "react-router-dom";
import { useBugReportUrl } from "../lib/useBugReportUrl";
import { useCopyFeedback } from "../lib/useCopyFeedback";
import { AlertCircleIcon, CopyIcon, ExternalLinkIcon, RefreshIcon } from "./icons";

type ScreenErrorFallbackProps = {
	error: Error;
	errorId: string | null;
	reporting: boolean;
	onRetry: () => void;
};

export function ScreenErrorFallback({ error, errorId, reporting, onRetry }: ScreenErrorFallbackProps) {
	const { copied, copy } = useCopyFeedback();
	const bugReportUrl = useBugReportUrl();
	const details = [
		`Código do erro: ${errorId ?? "não registrado"}`,
		`Tela: ${window.location.pathname}`,
		`Erro: ${error.name}: ${error.message}`,
	].join("\n");

	return (
		<section className="screen-error panel" role="alert" aria-labelledby="screen-error-title">
			<span className="screen-error-icon">
				<AlertCircleIcon />
			</span>
			<h1 id="screen-error-title">Esta tela encontrou um erro</h1>
			<p>
				Seus dados continuam salvos. Tente de novo; se o erro voltar, relate o problema no GitHub. O código abaixo já vai
				preenchido no formulário, junto com o diagnóstico.
			</p>
			<div className="screen-error-code">
				<span>Código do erro</span>
				<strong>{reporting ? "registrando..." : (errorId ?? "não foi possível registrar")}</strong>
			</div>
			<div className="screen-error-actions">
				<button type="button" onClick={onRetry}>
					<RefreshIcon /> Tentar de novo
				</button>
				<button type="button" className="btn-secondary" onClick={() => void copy(details)}>
					<CopyIcon /> {copied ? "Copiado" : "Copiar detalhes"}
				</button>
				<button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
					Recarregar o app
				</button>
			</div>
			<div className="screen-error-links">
				<a
					className="link"
					href={bugReportUrl({ errorId, message: `${error.name}: ${error.message}`, page: window.location.pathname })}
					target="_blank"
					rel="noreferrer"
				>
					Relatar problema no GitHub <ExternalLinkIcon />
					<span className="sr-only">(abre em nova aba)</span>
				</a>
				<Link className="link" to="/help?tab=diagnostics">
					Ver diagnóstico
				</Link>
			</div>
		</section>
	);
}

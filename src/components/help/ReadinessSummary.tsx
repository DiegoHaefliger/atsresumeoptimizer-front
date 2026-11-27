import { DIAGNOSTICS_PATH, type DiagnosticReport } from "../../lib/diagnosticsApi";
import { worstReadiness } from "../../lib/readiness";
import { useApiResource } from "../../lib/useApiResource";
import { AlertCircleIcon, ArrowRightIcon, CheckCircleIcon, SpinnerIcon } from "../icons";

type ReadinessSummaryProps = { onOpenDiagnostics: () => void };

export function ReadinessSummary({ onOpenDiagnostics }: ReadinessSummaryProps) {
	const { data: report, failed } = useApiResource<DiagnosticReport>(DIAGNOSTICS_PATH);
	const status = report ? worstReadiness(report.checks) : null;

	return (
		<section className={`readiness-summary panel${status ? ` readiness-${status.toLowerCase()}` : ""}`} aria-live="polite">
			{status === "OK" ? <CheckCircleIcon aria-hidden /> : report || failed ? <AlertCircleIcon aria-hidden /> : <SpinnerIcon aria-hidden />}
			<div>
				<h2>Verificação do sistema</h2>
				<p>
					{report
						? status === "OK"
							? "Banco de dados, IA e configurações estão funcionando."
							: report.verdict
						: failed
							? "Não deu pra consultar o servidor."
							: "Verificando banco de dados, IA e configurações..."}
				</p>
			</div>
			<button type="button" className="btn-secondary btn-small" onClick={onOpenDiagnostics}>
				{status && status !== "OK" ? "Ver o que resolver" : "Ver detalhes"} <ArrowRightIcon />
			</button>
		</section>
	);
}
